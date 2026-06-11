---
title: feed-forward networks (MLP)
tier: primitive
summary: A small per-position neural net applied identically at every token position; where transformers store much of their factual knowledge and the natural target for sparsity in mixture-of-experts designs.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
    type: paper
  - label: "Transformer Feed-Forward Layers Are Key-Value Memories (Geva et al., 2021)"
    url: "https://arxiv.org/abs/2012.14913"
    type: paper
  - label: "GLU Variants Improve Transformer (Shazeer, 2020)"
    url: "https://arxiv.org/abs/2002.05202"
    type: paper
  - label: "How Might LLMs Store Facts (3Blue1Brown, 2024)"
    url: "https://www.youtube.com/watch?v=9-Jl0dxWQs8"
    type: video
---

Every transformer block contains two sub-layers: an attention layer that mixes information *across* positions, and a feed-forward network (FFN) that processes each position *independently*. The FFN is easy to overlook beside attention, but it holds roughly two-thirds of a transformer's parameters and is increasingly understood as the primary place where models store factual knowledge.

## How it works

The classic FFN is two linear projections with a nonlinearity between them. The input vector (one token's representation) is expanded to a wider hidden dimension — typically four times the model dimension — then projected back down:

```
FFN(x) = W₂ · σ(W₁x + b₁) + b₂
```

Because there is no interaction *between* tokens inside the FFN, every token's vector is processed by the exact same learned function in parallel. All cross-token mixing already happened in the preceding attention sub-layer; the FFN then refines each position on its own.

The original transformer used ReLU as the nonlinearity. Modern large language models use gated variants — most commonly SwiGLU — which add a third projection and consistently improve quality.

**The key-value memory view.** Interpretability research recasts the FFN as an associative memory: the first matrix's rows detect patterns in the input, and the second matrix's columns write information back when those patterns fire. This is why factual edits (e.g., ROME) target FFN weights: the knowledge is encoded there.

Like every other transformer sub-layer, the FFN is wrapped in [residual connections](../residual-connections/) and paired with [layer normalization](../layer-normalization/), so it adds to the existing representation rather than replacing it.

## Where you'll see it

The FFN appears in every [encoder](../encoder/) and [decoder](../decoder/) block. Because it dominates the parameter count, it is the natural target for sparsity: in [Mixture of Experts](../mixture-of-experts/) models, the single dense FFN is replaced by many parallel expert FFNs, with a router selecting only a few per token. This is how MoE models like Mixtral and DeepSeek scale parameters while keeping per-token compute fixed.

## Related concepts

- [attention mechanisms](../attention-mechanisms/) — the cross-position sub-layer the FFN alternates with
- [residual connections](../residual-connections/) — the skip connection the FFN reads from and writes to
- [layer normalization](../layer-normalization/) — normalization paired with the FFN at each block
- [mixture of experts](../mixture-of-experts/) — replaces this layer with many routed expert FFNs
