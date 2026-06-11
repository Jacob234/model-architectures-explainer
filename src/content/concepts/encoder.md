---
title: encoder
tier: module
summary: Reads the whole input at once — bidirectionally — and produces a contextual representation of it. The "understanding" half of the transformer recipe.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
---

An encoder is a stack of identical blocks that turns a raw input sequence into a
contextual representation: every position's vector ends up informed by every other
position. Unlike a [decoder](/concepts/decoder/), it looks at the whole input at
once — there is no notion of "past" and "future," so it can use context from both
directions.

## How it works

Each encoder block runs two sub-layers: [self-attention](/concepts/attention-mechanisms/),
which lets every position mix in information from every other position, and a
[feed-forward network](/concepts/feed-forward-networks/) applied identically at each
position. [Residual connections](/concepts/residual-connections/) and
[layer normalization](/concepts/layer-normalization/) around each sub-layer keep deep
stacks trainable, and [positional encodings](/concepts/positional-encoding/) inject
word order, which attention alone cannot see.

## Where you'll see it

Encoder-only stacks power [BERT](/concepts/bert/)-style models, built to understand
text rather than generate it. Paired with a decoder, the encoder is the reading half
of [encoder–decoder models](/concepts/sequence-to-sequence-models/) like the original
translation Transformer and T5. A [Vision Transformer](/concepts/vision-transformer/)
is an encoder over image patches, and [CLIP](/concepts/clip/) trains two encoders —
one for images, one for text — against each other.

## Related concepts

- [decoder](/concepts/decoder/) — the generating counterpart
- [attention mechanisms](/concepts/attention-mechanisms/) — the core operation inside
- [BERT](/concepts/bert/) — the encoder-only family
