---
title: recurrent neural networks (RNN/LSTM)
tier: family
kind: backbone
summary: Processes sequences one step at a time, carrying a hidden state forward as a running memory; LSTM adds gates so memory survives long sequences. The pre-transformer default for language — and a backbone whose training objective is not fixed.
---

A recurrent neural network processes a sequence by reading one element at a time and carrying a hidden state forward — a compressed running summary of everything seen so far. This is both a primitive operation (the recurrence step itself) and the basis for an entire family of sequence models that dominated NLP, speech, and time-series work for roughly two decades before transformers took over.

## The recurrence primitive

At every timestep, the network takes the current input and the previous hidden state, mixes them through a learned weight matrix, and produces a new hidden state:

```
hₜ = f(W_h · hₜ₋₁ + W_x · xₜ + b)
```

The same weights are reused at every step — weight sharing across time — which lets an RNN handle variable-length sequences without any architectural changes. The hidden state is a fixed-dimensional vector that, in principle, can carry information arbitrarily far forward. That "in principle" is the critical qualifier.

**Backpropagation through time (BPTT)** unrolls the recurrence into one layer per timestep and runs ordinary backpropagation through it. Because the same weight matrix is multiplied at every step, gradients either shrink exponentially (vanishing gradients) or grow without bound (exploding gradients) as sequences get long. The practical result: vanilla RNNs struggle to learn dependencies more than about 20 steps apart.

## The LSTM family

The Long Short-Term Memory (LSTM) cell, introduced by Hochreiter and Schmidhuber in 1997, solved the vanishing gradient problem with gates — learned binary-ish switches that control what information flows into, out of, and through the cell state:

- **Input gate**: how much of the new input to write into memory
- **Forget gate**: how much of the existing memory to erase
- **Output gate**: how much of the memory to expose as the hidden state

These gates create a protected highway for gradients during backpropagation, allowing LSTMs to learn dependencies across hundreds of steps. The Gated Recurrent Unit (GRU) is a streamlined variant with two gates instead of three that is similarly effective and faster to train.

Before transformers, stacked bidirectional LSTMs were the default architecture for machine translation, language modeling, and speech recognition. Bidirectional variants run one LSTM forward and one backward, concatenating both hidden states to give each position full left-and-right context — useful for encoding, though not for autoregressive generation.

## The objective is not fixed

Like [convolutional neural networks](/concepts/convolutional-neural-networks/), an RNN is a backbone. The same recurrent cell can be used for autoregressive language modeling (predict the next token), sequence classification (read a sentence, classify at the final hidden state), or sequence-to-sequence transduction inside an [encoder–decoder](/concepts/sequence-to-sequence-models/) model. The objective is separate from the recurrent mechanism.

## Why transformers replaced RNNs

The core limitation is sequential computation. `hₜ` depends on `hₜ₋₁`, so timesteps cannot be parallelized — training is O(sequence length) in serial wall-clock time. [Attention mechanisms](/concepts/attention-mechanisms/) were first introduced as an add-on to RNN-based translation models (Bahdanau et al., 2014), letting the decoder look at all encoder hidden states rather than relying on a single compressed vector. Once attention did the heavy lifting, the recurrence became redundant. The transformer dropped the recurrence entirely and computed all positions in parallel, unlocking the GPU utilization that enabled scaling to modern model sizes.

The conceptual lineage lives on: [state-space models](/concepts/state-space-models/) like Mamba recover the linear-inference efficiency of recurrence while remaining trainable in parallel — a modern reinvention of the RNN's core appeal.

## Related concepts

- [sequence-to-sequence models](/concepts/sequence-to-sequence-models/) — the encoder–decoder framework first built with stacked RNNs
- [attention mechanisms](/concepts/attention-mechanisms/) — invented as an add-on to RNN seq2seq; later replaced recurrence entirely
- [state-space models](/concepts/state-space-models/) — modern parallel-trainable recurrence; the RNN's conceptual successor
- [large-language-models](/concepts/large-language-models/) — decoder-only transformers: the architecture that obsoleted RNNs for language
