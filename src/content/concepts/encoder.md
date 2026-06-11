---
title: encoder
tier: module
summary: Reads the whole input at once — bidirectionally — and produces a contextual representation of it. The "understanding" half of the transformer recipe.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
    type: paper
  - label: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding (Devlin et al., 2018)"
    url: "https://arxiv.org/abs/1810.04805"
    type: paper
  - label: "The Illustrated BERT, ELMo, and co. (Jay Alammar, 2018)"
    url: "https://jalammar.github.io/illustrated-bert/"
    type: blog
---

An encoder is a stack of identical blocks that turns a raw input sequence into a
contextual representation: every position's vector ends up informed by every other
position. Unlike a [decoder](../decoder/), it looks at the whole input at
once — there is no notion of "past" and "future," so it can use context from both
directions.

## How it works

Each encoder block runs two sub-layers: [self-attention](../attention-mechanisms/),
which lets every position mix in information from every other position, and a
[feed-forward network](../feed-forward-networks/) applied identically at each
position. [Residual connections](../residual-connections/) and
[layer normalization](../layer-normalization/) around each sub-layer keep deep
stacks trainable, and [positional encodings](../positional-encoding/) inject
word order, which attention alone cannot see.

## Where you'll see it

Encoder-only stacks power [BERT](../bert/)-style models, built to understand
text rather than generate it. Paired with a decoder, the encoder is the reading half
of [encoder–decoder models](../sequence-to-sequence-models/) like the original
translation Transformer and T5. A [Vision Transformer](../vision-transformer/)
is an encoder over image patches, and [CLIP](../clip/) trains two encoders —
one for images, one for text — against each other.

## Related concepts

- [decoder](../decoder/) — the generating counterpart
- [attention mechanisms](../attention-mechanisms/) — the core operation inside
- [BERT](../bert/) — the encoder-only family
