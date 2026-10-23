"""Turn free text into search terms.

Documents and queries go through the same `build_terms` pipeline, so a query
term always matches the same term in a document.
"""

import re
import unicodedata
from functools import lru_cache

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

_STEMMER = PorterStemmer()

# Spelling variants of the same product word, unified before tokenizing.
_VARIANTS = [
    (re.compile(r"\bt[\s-]?shirts?\b|\btees?\b"), "tshirt"),
    (re.compile(r"\bv[\s-]neck\b"), "vneck"),
    (re.compile(r"\b(slim|regular|body)fit\b"), r"\1 fit"),
]
_POSSESSIVE = re.compile(r"(\w)'s\b")
_HYPHENATED = re.compile(r"(?<=[a-z])-(?=[a-z])")
_PUNCTUATION = re.compile(r"[^a-z0-9\s]+")


@lru_cache(maxsize=1)
def _stop_words() -> frozenset[str]:
    return frozenset(stopwords.words("english"))


def normalize_text(text: str) -> str:
    """Repair encoding damage, fold to plain lowercase ASCII and unify variants."""
    if "â" in text or "Ã" in text:
        try:  # UTF-8 text that was decoded as Latin-1 somewhere upstream.
            text = text.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
    text = text.replace("’", "'").replace("‘", "'")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = text.lower()
    for pattern, replacement in _VARIANTS:
        text = pattern.sub(replacement, text)
    text = _POSSESSIVE.sub(r"\1", text)  # women's -> women
    text = _HYPHENATED.sub("", text)  # round-neck -> roundneck
    # Remaining punctuation becomes a space, so "cotton.Designed" splits in two.
    return _PUNCTUATION.sub(" ", text)


def build_terms(text: str | None) -> list[str]:
    """Normalize and strip punctuation, tokenize, drop numbers and stop words, then stem."""
    if not text:
        return []
    stop_words = _stop_words()
    terms = []
    for token in word_tokenize(normalize_text(text)):
        # Keep words with at least one letter; this drops bare numbers and stray letters.
        if len(token) < 2 or not any(c.isalpha() for c in token):
            continue
        if token in stop_words:
            continue
        terms.append(_STEMMER.stem(token))
    return terms
