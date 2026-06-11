---
title: positional encoding
tier: primitive
summary: Injects token-order information into a transformer, because attention alone treats its input as an unordered set and cannot distinguish "the dog bit the man" from "the man bit the dog."
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
  - label: "RoFormer: Enhanced Transformer with Rotary Position Embedding (Su et al., 2021)"
    url: "https://arxiv.org/abs/2104.09864"
---

[Attention mechanisms](../attention-mechanisms/) are inherently order-blind. When a query vector asks which keys are relevant, it compares against all keys simultaneously with no notion of position — the result is the same whether the input tokens appear in their correct order or scrambled. A recurrent network processes tokens one at a time, so position is implicit in the sequence of steps. Transformers process all positions in parallel, so position must be made explicit.

## How it works

**Sinusoidal encoding** (the original approach) adds a fixed, deterministic signal to each token's [embedding](../embeddings/) before the first attention layer. The signal is a stack of sine and cosine waves at different frequencies — high-frequency waves encode fine position differences; low-frequency waves encode coarse ones. Any fixed relative distance corresponds to a linear transformation of the encoding, which makes it easy for the model to learn relative attention patterns. This approach requires no learned parameters and can in principle extrapolate to longer sequences than those seen during training.

**Learned positional embeddings** are the simpler alternative: a trainable matrix with one vector per position, added to the token embedding. GPT-2 used this approach. The model can learn arbitrary position-dependent patterns, but the embeddings cannot extrapolate — there is no representation for positions beyond the training length.

**Rotary Position Embeddings (RoPE)** have become the modern standard. Instead of adding a position signal to [embeddings](../embeddings/), RoPE *rotates* the query and key vectors by an angle proportional to their position before computing attention scores. Each pair of dimensions in the vector is rotated at a different frequency, mirroring the multi-frequency design of sinusoidal encoding — but applied multiplicatively through rotation rather than additively.

The key insight is geometric: when a query at position m and a key at position n are both rotated, their dot product depends on the *difference* (m − n), not the absolute positions. Attention scores become naturally relative-position-aware. RoPE requires no additional parameters, and techniques like YaRN allow the effective context window to be extended well beyond the training length — Llama 3.1 uses this to go from 8K training to 128K inference context.

**ALiBi** takes a different route: rather than modifying embeddings, it adds a linear penalty to attention scores based on distance. Closer tokens get a boost; distant tokens get a penalty. Simpler to implement but less dominant in practice than RoPE.

## Where you'll see it

Positional encoding is applied once at the input of every [encoder](../encoder/) and [decoder](../decoder/) stack. Most open-weight large language models from the past few years — Llama, Mistral, DeepSeek, Qwen, Gemma — use RoPE internally.

## Related concepts

- [embeddings](../embeddings/) — token embeddings that positional signals are added to or rotated
- [attention mechanisms](../attention-mechanisms/) — the order-blind operation that positional encoding corrects
- [encoder](../encoder/) — applies positional encoding at its input
- [decoder](../decoder/) — same; also depends on position for causal masking
