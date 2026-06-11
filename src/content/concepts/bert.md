---
title: BERT
tier: family
kind: architecture
summary: A stack of bidirectional encoder blocks trained to fill in masked words — built to understand text, not to generate it. The architecture that cemented the pretrain-then-fine-tune paradigm in NLP.
sources:
  - label: "BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2018)"
    url: "https://arxiv.org/abs/1810.04805"
    type: paper
  - label: "The Illustrated BERT, ELMo, and co. (Jay Alammar, 2018)"
    url: "https://jalammar.github.io/illustrated-bert/"
    type: blog
  - label: "BERT 101 — State of the Art NLP Model Explained (Hugging Face, 2022)"
    url: "https://huggingface.co/blog/bert-101"
    type: blog
---

BERT — Bidirectional Encoder Representations from Transformers — made the opposite architectural bet from GPT. Where GPT predicts the next token left-to-right, BERT masks random tokens and predicts them using context from both directions simultaneously. That bidirectional view produces richer representations for tasks that require understanding rather than generation: classification, entity recognition, question answering, semantic similarity. Introduced by Google Research in 2018, BERT dominated NLP benchmarks for two years and cemented the pretrain-then-fine-tune paradigm that every modern language model follows.

## How it works

BERT is an [encoder](../encoder/)-only transformer — no decoder, no causal mask. Every token attends to every other token in both directions. The base model has 12 layers and 110 million parameters; the large variant has 24 layers and 340 million.

Pretraining uses two objectives. The first, masked language modeling, randomly masks 15% of tokens and trains the model to predict the originals from surrounding context. The second, next-sentence prediction, asks whether two passages appear consecutively — though later work (RoBERTa) showed this objective hurts more than it helps and dropped it.

Fine-tuning is intentionally simple: add a thin task-specific [output head](../output-head/) on top of the pretrained encoder and train the whole stack. For classification, the [CLS] token's final representation feeds a linear classifier. For span extraction (question answering), position classifiers run over every token. For token-level tasks like named-entity recognition, per-token classifiers apply directly. No architecture changes are needed across tasks — the same pretrained encoder serves all of them.

## Variants

BERT's design spawned a productive family. RoBERTa showed BERT was significantly undertrained and improved results by removing next-sentence prediction and training longer on more data. DistilBERT used knowledge distillation to produce a 40% smaller model that keeps 97% of performance. ALBERT shares parameters across layers to reduce model size. XLM-RoBERTa extends the approach to 100 languages. DeBERTa introduces disentangled attention that separates content and positional representations.

## Where you'll see it

BERT-family models underpin most production search, classification, and embedding pipelines today. They power semantic search (sentence-transformers turn BERT outputs into dense retrieval vectors), reranking stages in retrieval-augmented systems, and document classification at scale. BERT lost the race to build generative [large language models](../large-language-models/) — bidirectional encoders cannot generate text autoregressively — but they remain the practical default wherever understanding, not generation, is the task.

## Related concepts

- [encoder](../encoder/) — the bidirectional module BERT is built from
- [attention mechanisms](../attention-mechanisms/) — the core operation; bidirectional, so every token sees every other
- [embeddings](../embeddings/) — BERT produces contextual embeddings; sentence-BERT adapts them for dense retrieval
- [large language models](../large-language-models/) — the decoder-only alternative that won the generative race
