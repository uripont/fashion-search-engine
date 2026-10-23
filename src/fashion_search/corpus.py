"""Load the product catalogue and turn it into clean, searchable records.

Each product keeps the fields a search result shows, with prices, discount
and rating parsed into numbers, plus one list of terms per searchable field
(title, description, product details, brand).

Usage: uv run python -m fashion_search.corpus
"""

import json
import re
from pathlib import Path

import pandas as pd

from fashion_search.text import build_terms

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
RAW_PATH = DATA_DIR / "fashion_products_dataset.json"
CORPUS_PATH = DATA_DIR / "processed" / "products.parquet"

# Fields a search result returns, in display order.
RESULT_FIELDS = [
    "pid", "title", "description", "brand", "category", "sub_category",
    "product_details", "seller", "out_of_stock", "selling_price", "discount",
    "actual_price", "average_rating", "url",
]
# Searchable text fields, kept apart so later ranking can weight them.
TEXT_FIELDS = ["title", "description", "details", "brand"]
# Product detail keys whose values are internal codes, not descriptive words.
IGNORED_DETAIL_KEYS = {"Style Code"}


def details_text(product_details: list[dict]) -> str:
    """Join the descriptive values of the raw product details (not their keys)."""
    return " ".join(
        str(value)
        for detail in product_details
        for key, value in detail.items()
        if key not in IGNORED_DETAIL_KEYS
    )


def parse_number(value) -> float | None:
    """Parse '2,999', '69% off', '3.9' or '' into a float, or None when missing."""
    match = re.search(r"\d+(?:\.\d+)?", str(value).replace(",", ""))
    return float(match.group()) if match else None


def load_raw(path: Path = RAW_PATH) -> pd.DataFrame:
    return pd.read_json(path, dtype=False)


def build_corpus(raw: pd.DataFrame) -> pd.DataFrame:
    """Build one clean record per product: result fields plus terms per text field."""
    df = pd.DataFrame({"pid": raw["pid"]})

    for field in ["title", "description", "brand", "category", "sub_category", "seller", "url"]:
        df[field] = raw[field].fillna("").astype(str).str.strip().replace("", None)
    df["product_details"] = [
        [{"key": k, "value": str(v)} for d in details for k, v in d.items()]
        for details in raw["product_details"]
    ]
    df["out_of_stock"] = raw["out_of_stock"].astype(bool)
    for field in ["selling_price", "discount", "actual_price", "average_rating"]:
        df[field] = raw[field].map(parse_number).astype("Float64")

    df["title_terms"] = raw["title"].map(build_terms)
    df["description_terms"] = raw["description"].map(build_terms)
    df["details_terms"] = raw["product_details"].map(lambda d: build_terms(details_text(d)))
    df["brand_terms"] = raw["brand"].map(build_terms)
    return df


def save_corpus(corpus: pd.DataFrame, path: Path = CORPUS_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    corpus.to_parquet(path, index=False)


def load_corpus(path: Path = CORPUS_PATH) -> pd.DataFrame:
    return pd.read_parquet(path)


def all_terms(record: pd.Series) -> list[str]:
    """Every searchable term of a product record, across its text fields."""
    return [t for field in TEXT_FIELDS for t in record[f"{field}_terms"]]


def details_dict(record: pd.Series) -> dict[str, str]:
    """The product details of a product record as a plain dictionary."""
    return {d["key"]: d["value"] for d in record["product_details"]}


def main() -> None:
    corpus = build_corpus(load_raw())
    save_corpus(corpus)
    summary = {
        "products": len(corpus),
        **{f"{f}_vocabulary": len({t for ts in corpus[f"{f}_terms"] for t in ts}) for f in TEXT_FIELDS},
    }
    print(f"Wrote {CORPUS_PATH}")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
