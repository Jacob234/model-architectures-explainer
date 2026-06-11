---
title: decoder
tier: module
summary: Generates output one token at a time, each step attending only to what came before — the "generation" half of the transformer recipe.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
---

A decoder is a stack of blocks that generates an output sequence
*autoregressively*: one token at a time, each conditioned on everything generated
so far. It is the producing counterpart to the [encoder](../encoder/) —
where an encoder builds a representation of input it can see all at once, a
decoder writes output it must commit to left to right.

## How it works

The defining ingredient is **causal (masked)
[self-attention](../attention-mechanisms/)**: each position may attend
only to itself and earlier positions — future positions are blocked out before
the softmax. That mask is what enforces left-to-right generation: the model
predicts token *t+1* from tokens *1…t* without peeking at the answer, so the
same forward pass works for both training (all positions in parallel) and
generation (one token at a time). Around that core, each block looks like an
encoder block: a [feed-forward network](../feed-forward-networks/),
[residual connections](../residual-connections/), and
[layer normalization](../layer-normalization/), ending in an
[output head](../output-head/) that turns the final hidden state into a
probability distribution over the vocabulary.

During generation, the decoder caches the key and value vectors of past tokens
(the "KV cache") instead of recomputing them at every step — a memory footprint
that grows with sequence length, and the bottleneck that
[attention head sharing](../attention-head-sharing/) techniques attack.

## Where you'll see it

Decoder-only stacks are the backbone of essentially every modern
[large language model](../large-language-models/) — GPT, Claude, Llama.
Generation turned out to be the most general capability: a model that can
generate can also classify, translate, and answer by emitting the right output,
which is why this configuration won. In
[encoder–decoder models](../sequence-to-sequence-models/) (translation,
summarization), each decoder block adds a second, *cross-attention* sub-layer
that reads the encoder's representation of the source while the masked
self-attention handles the target generated so far.

## Related concepts

- [encoder](../encoder/) — the understanding counterpart
- [attention mechanisms](../attention-mechanisms/) — decoders use the causal, masked form
- [large language models](../large-language-models/) — overwhelmingly decoder-only
- [predictor](../predictor/) — contrast: a predictor outputs representations, a decoder outputs tokens
