---
title: attention
tier: primitive
summary: Lets every position look at every other position and mix in what's relevant. The breakthrough that replaced sequential processing with direct connections between any two positions.
sources:
  - label: "Neural Machine Translation by Jointly Learning to Align and Translate (Bahdanau et al., 2014)"
    url: "https://arxiv.org/abs/1409.0473"
    type: paper
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
    type: paper
  - label: "Attention? Attention! (Lilian Weng, 2018)"
    url: "https://lilianweng.github.io/posts/2018-06-24-attention/"
    type: blog
  - label: "Attention and Augmented Recurrent Neural Networks (Olah & Carter, Distill, 2016)"
    url: "https://distill.pub/2016/augmented-rnns/"
    type: explainer
  - label: "Attention in Transformers, Step-by-Step (3Blue1Brown, 2024)"
    url: "https://www.youtube.com/watch?v=eMlx5fFNoYc"
    type: video
---

Attention lets a neural network focus on the most relevant parts of its input
when producing each part of its output. It replaces the step-by-step processing
of [recurrent networks](../recurrent-neural-networks/) with a mechanism
that directly connects any two positions in a sequence — in parallel, in a
single operation.

## How it works

Each token produces three vectors: a **query** (what am I looking for?), a
**key** (what do I contain?), and a **value** (what information do I carry?).
A token's query is scored against every key, the scores are normalized with a
softmax, and the values are summed with those weights — yielding a
representation of each token that has mixed in whatever is relevant from the
rest of the sequence. **Multi-head** attention runs this many times in parallel
with different learned projections, so different heads can track different
relationships — syntax, meaning, proximity. Because the operation itself is
order-blind, it is paired with
[positional encoding](../positional-encoding/) to restore word order.

Attention comes in three flavors. **Self-attention** lets a sequence attend to
itself — every position to every other — and powers the
[encoder](../encoder/). **Masked self-attention** restricts each
position to what came before it, enforcing the left-to-right generation of the
[decoder](../decoder/). **Cross-attention** lets a decoder read an
encoder's output — the original 2014 form, invented to fix the bottleneck in
[sequence-to-sequence models](../sequence-to-sequence-models/) that
squeezed a whole input into one fixed-size vector.

## Where you'll see it

Everywhere. Scaled-up attention across many layers is what gives
[large language models](../large-language-models/) their capabilities;
a [Vision Transformer](../vision-transformer/) applies it to image
patches. Its main cost is memory — every position interacting with every other
— which drives variants like
[attention head sharing](../attention-head-sharing/) and motivates
attention-free challengers like
[state space models](../state-space-models/).

## Related concepts

- [encoder](../encoder/) / [decoder](../decoder/) — the modules built around it
- [positional encoding](../positional-encoding/) — restores the order attention can't see
- [attention head sharing](../attention-head-sharing/) — the memory-saving variant family
- [state space models](../state-space-models/) — the sub-quadratic alternative
