# Distributed search engines: sharding, replication and query routing

A 15-minute talk on how a search engine's inverted index is split across
many machines and still returns one correctly ranked list. It covers
partitioning by term or by document, replication, scatter-gather query
routing, why shard-local IDF breaks TF-IDF and BM25 scores, and tail latency.

Given by Marc, Èric and Oriol at the Information Retrieval and Web Analytics
seminar, 21 October 2026.

- [`Distributed_Search_Engines.pdf`](Distributed_Search_Engines.pdf): the slides as presented.
- [`visuals/`](visuals/): the source of every figure, drawn in code. Open
  `visuals/index.html` in a browser and move with ← →; the page number in the
  URL matches the slides. See [`visuals/README.md`](visuals/README.md) to edit
  or export them.
