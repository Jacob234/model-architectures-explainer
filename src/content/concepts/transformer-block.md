---
title: transformer block
tier: module
summary: The repeating unit of every transformer — attention then feed-forward, each wrapped in a residual connection and normalization. Stack N of them and you have an encoder or a decoder.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
    type: paper
  - label: "The Illustrated Transformer (Jay Alammar, 2018)"
    url: "https://jalammar.github.io/illustrated-transformer/"
    type: blog
  - label: "The Annotated Transformer (Harvard NLP, 2022)"
    url: "https://nlp.seas.harvard.edu/annotated-transformer/"
    type: blog
  - label: "Transformer Explainer (Polo Club, Georgia Tech, 2024)"
    url: "https://poloclub.github.io/transformer-explainer/"
    type: explainer
  - label: "LLM Visualization (Brendan Bycroft, 2023)"
    url: "https://bbycroft.net/llm"
    type: explainer
---

Strip any transformer — GPT, [BERT](../bert/), a [ViT](../vision-transformer/) —
down to its skeleton and you find one small circuit repeated over and over: an
[attention](../attention-mechanisms/) layer, then a
[feed-forward](../feed-forward-networks/) layer, each wrapped in a
[residual connection](../residual-connections/) and
[normalization](../layer-normalization/). That four-part unit is the transformer
block. Architectural differences between famous models are mostly *outside* the
block (how many, what masking, what objective); the block itself has barely
changed since 2017 — a strong hint that this particular division of labor is
doing something right.

## How it works

A block receives one vector per position and returns one vector per position —
same shape in, same shape out, which is what makes stacking trivial.

1. **Attention sublayer** — the only place positions interact. Each position
   queries the others and mixes in what's relevant: information *routing*.
2. **Feed-forward sublayer** — the same two-layer MLP applied to every position
   independently, no cross-talk: information *processing*, and where most of the
   parameters (and, evidence suggests, most stored facts) live.
3. **Residuals + normalization around each** — the input of each sublayer is
   added back to its output, so a block computes `x + attention(x)` then
   `x + ffn(x)` rather than replacing `x`. Modern stacks normalize *before* each
   sublayer (pre-LN), which keeps hundred-layer training stable.

The residual view is the most useful mental model: a **residual stream** flows
through the network unchanged by default, and each sublayer reads from it and
writes small updates into it. Attention moves information *between* positions'
streams; the FFN refines each stream *in place*.

## One block, three roles

Stacking N blocks and choosing an attention mask is what differentiates the
major architectures:

- **[Encoder](../encoder/)** — blocks with unmasked, bidirectional attention; every
  position sees every other.
- **[Decoder](../decoder/)** — blocks with a causal mask (positions only look left),
  plus, in [seq2seq](../sequence-to-sequence-models/) models, a third sublayer
  that cross-attends to the encoder's output.
- **[ViT](../vision-transformer/)** — exactly the encoder block, fed image patches
  instead of [tokens](../tokenization/).

## Related concepts

- [attention mechanisms](../attention-mechanisms/) — the routing sublayer
- [feed-forward networks](../feed-forward-networks/) — the processing sublayer
- [residual connections](../residual-connections/) — what makes deep stacks of blocks trainable, and the source of the residual-stream view
- [layer normalization](../layer-normalization/) — the stabilizer; pre-LN vs post-LN placement is the block's one big historical revision
- [encoder](../encoder/) / [decoder](../decoder/) — what N stacked blocks become, depending on the mask
