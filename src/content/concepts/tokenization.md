---
title: tokenization
tier: primitive
summary: How raw text becomes the integer IDs models actually see — BPE, WordPiece, SentencePiece — and why tokenizer quirks explain so many otherwise-baffling LLM failures.
sources:
  - label: "Neural Machine Translation of Rare Words with Subword Units (Sennrich et al., 2015)"
    url: "https://arxiv.org/abs/1508.07909"
    type: paper
  - label: "Let's Build the GPT Tokenizer (Andrej Karpathy, 2024)"
    url: "https://www.youtube.com/watch?v=zduSFxRajkE"
    type: video
  - label: "Tokenizers chapter, Hugging Face LLM Course (Hugging Face, 2022)"
    url: "https://huggingface.co/learn/llm-course/chapter6/1"
    type: blog
  - label: "Tiktokenizer (dqbd, 2023)"
    url: "https://tiktokenizer.vercel.app/"
    type: explainer
---

A language model never sees text. It sees a sequence of integers, each naming an
entry in a fixed vocabulary, and everything downstream — [embeddings](../embeddings/),
attention, the [output head](../output-head/)'s prediction — operates on those IDs.
Tokenization is the deterministic preprocessing step that chops raw bytes into
that sequence, and it embodies a trade-off: characters give a tiny vocabulary but
absurdly long sequences; whole words give short sequences but an unbounded
vocabulary that can't handle typos or new words. Subword tokenization splits the
difference — common words stay whole, rare words decompose into recognizable
pieces (`tokenization` → `token` + `ization`).

It is also the layer where many famous LLM failures actually live. A model that
can write poetry but can't count the letters in "strawberry" or reverse a string
isn't bad at reasoning — it literally cannot see characters, only opaque chunks.

## How it works

**Byte-pair encoding (BPE)**, the dominant algorithm, is learned from a corpus
before model training ever starts:

1. Start with a base vocabulary of single bytes (so *anything* is representable).
2. Count which adjacent pair of tokens occurs most often; merge it into a new
   vocabulary entry.
3. Repeat until the vocabulary reaches a target size (typically 32k–200k entries).

Encoding new text replays those merges in order. The result is a frequency-driven
vocabulary: common English words become single tokens, rare strings shatter into
many. **WordPiece** (used by [BERT](../bert/)) scores merges by likelihood instead
of raw frequency, and **SentencePiece** runs directly on raw text so the same
machinery works for languages without spaces.

The token IDs then index an [embedding](../embeddings/) table — tokenization
decides what the atoms are; embeddings decide what they mean.

## Why tokenizer quirks matter

- **Character-level blindness** — spelling, rhyming, counting letters, and
  arithmetic all suffer because the relevant structure is hidden inside tokens
  (numbers split inconsistently: `2023` might be one token, `2024` two).
- **Multilingual inequity** — a vocabulary trained mostly on English spends few
  tokens per English sentence and many per sentence of an underrepresented
  language, making the same content slower, costlier, and effectively shrinking
  the context window.
- **Glitch tokens** — vocabulary entries whose training data was filtered out
  (the infamous `SolidGoldMagikarp`) leave embeddings essentially untrained, and
  prompting them produces erratic behavior.
- **Whitespace sensitivity** — `hello` and ` hello` are different tokens, which is
  why trailing spaces in prompts can measurably change completions.

## Related concepts

- [embeddings](../embeddings/) — the next stage: token IDs become vectors; tokenization defines the rows of that table
- [large language models](../large-language-models/) — predict the next *token*, not the next word; every context-window and pricing number is denominated in tokens
- [BERT](../bert/) — uses WordPiece tokenization; its masked objective masks tokens, not words
- [vision transformer](../vision-transformer/) — the same move for images: patches are visual tokens
