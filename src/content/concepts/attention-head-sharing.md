---
title: attention head sharing (GQA/MLA)
tier: modifier
summary: Shares key/value projections across query heads to shrink the KV cache at inference — a modifier on the attention sublayer, not a peer architecture.
sources:
  - label: "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints (Ainslie et al., 2023)"
    url: "https://arxiv.org/abs/2305.13245"
    type: paper
  - label: "Fast Transformer Decoding: One Write-Head is All You Need — MQA (Shazeer, 2019)"
    url: "https://arxiv.org/abs/1911.02150"
    type: paper
  - label: "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model — introduces MLA (DeepSeek-AI, 2024)"
    url: "https://arxiv.org/abs/2405.04434"
    type: paper
  - label: "The Big LLM Architecture Comparison (Sebastian Raschka, 2025)"
    url: "https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison"
    type: blog
---

Attention head sharing is a modifier on the [attention mechanisms](../attention-mechanisms/) sublayer, not a separate architecture family. Standard multi-head attention (MHA) gives every query head its own key and value projections — maximum expressiveness, but maximum memory during generation. At inference, these projections are cached for every past token (the KV cache), growing proportionally with context length and batch size. Head sharing reduces that cache by reusing key/value projections across multiple query heads.

## How it works

In standard MHA with H query heads, the cache stores H key vectors and H value vectors per token per layer. The sharing variants cut that number:

**Multi-Query Attention (MQA)** uses a single shared KV head for all query heads — 1/H the cache, with a small quality penalty.

**Grouped-Query Attention (GQA)** splits query heads into G groups, each sharing one KV head. This interpolates between MHA and MQA: near-MHA quality with substantially reduced cache. GQA is the production standard — Llama 2/3, Mistral, and Gemma all use it.

**Multi-head Latent Attention (MLA)**, introduced in DeepSeek-V2, takes a different approach: compress all KV information into a single low-rank latent vector per token, then reconstruct full KV heads from it on the fly. Only the latent vector is cached, achieving roughly a 93% reduction in KV cache size versus MHA — and matching or exceeding MHA quality, because compression pressure encourages a more efficient KV representation.

The intuition: diversity among *query* heads matters more than diversity among *key and value* heads. Each query asks a different question, but the "facts" it looks up can be shared without much loss.

## Where you'll see it

GQA is the default in virtually every [large language model](../large-language-models/) released since 2023. MLA is the frontier variant, used by DeepSeek-V2/V3 alongside [Mixture of Experts](../mixture-of-experts/) — MoE reduces computation, MLA reduces memory, the two addressing complementary bottlenecks.

## Related concepts

- [attention mechanisms](../attention-mechanisms/) — the sublayer this modifier applies to
- [mixture-of-experts](../mixture-of-experts/) — a complementary modifier: MoE applies to the feed-forward sublayer
- [large language models](../large-language-models/) — GQA is the default for production LLMs
