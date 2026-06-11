---
title: retrieval-augmented architectures (RAG)
tier: family
kind: model-class
summary: Bolt a search step onto a generator — fetch relevant documents at inference time and condition on them (RAG, RETRO) instead of memorizing everything in weights.
sources:
  - label: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)"
    url: "https://arxiv.org/abs/2005.11401"
    type: paper
  - label: "Improving Language Models by Retrieving from Trillions of Tokens (Borgeaud et al., 2021)"
    url: "https://arxiv.org/abs/2112.04426"
    type: paper
  - label: "The Illustrated Retrieval Transformer (Jay Alammar, 2022)"
    url: "https://jalammar.github.io/illustrated-retrieval-transformer/"
    type: blog
---

An [LLM](../large-language-models/) stores everything it knows in its weights —
*parametric* memory, expensive to update and prone to confident confabulation
when a fact isn't there. Retrieval-augmented architectures split knowledge off
into a second, *non-parametric* memory: an external corpus the model searches at
inference time, conditioning generation on what it finds. The generator no longer
has to *be* the library; it has to *use* one. Facts become updatable by editing
the corpus, answers become attributable to retrieved passages, and a smaller
model can punch above its parameter count on knowledge-heavy tasks.

## How it works

Every variant shares three parts — the differences are in how tightly part 3 is
wired in.

1. **Embed the query.** The input is encoded into a vector using an
   [embedding](../embeddings/) model trained so that questions land near the
   passages that answer them (dense retrieval, e.g. DPR).
2. **Search.** A nearest-neighbor index over the pre-embedded corpus returns the
   top-k passages — vector search over millions or trillions of tokens.
3. **Condition the generator on the results:**
   - **RAG (2020)** feeds retrieved passages to an
     [encoder–decoder](../sequence-to-sequence-models/) generator and trains
     retriever and generator jointly, marginalizing over which passage helps.
   - **RETRO (2021)** integrates deeper: retrieved chunks are encoded and the
     [decoder](../decoder/) **cross-attends** to them at regular intervals — a
     7B-parameter model wired to a 2-trillion-token database matched GPT-3 on
     many tasks with 25× fewer parameters.
   - **Prompt-stuffing RAG**, the dominant production pattern, changes the
     architecture not at all: retrieved text is simply concatenated into the
     context window of a frozen LLM. All the engineering moves into the
     retrieval pipeline.

The spectrum runs from architectural (RETRO's cross-attention) to purely
operational (prompt-stuffing) — the same idea at different depths of
integration.

## Where you'll see it

Nearly every deployed assistant that answers questions about *your* documents,
recent events, or a private knowledge base is retrieval-augmented — search-
grounded chat, enterprise document Q&A, coding assistants indexing a repo. The
architectural variants (RETRO-style) remain rarer than the operational one, but
the trade they exemplify — parameters vs searchable memory — shapes how modern
systems are scaled.

## Related concepts

- [embeddings](../embeddings/) — the retrieval half is embedding search; the index is a frozen embedding table over the corpus
- [large language models](../large-language-models/) — the generator being augmented, and the parametric memory being relieved
- [decoder](../decoder/) — where RETRO splices in its cross-attention to retrieved chunks
- [sequence-to-sequence models](../sequence-to-sequence-models/) — original RAG's generator, with retrieval bolted to the front
