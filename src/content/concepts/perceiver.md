---
title: Perceiver
tier: family
kind: backbone
summary: Cross-attend a huge input into a small fixed-size latent array, then run the transformer there — one architecture for images, audio, point clouds, anything (Perceiver, Perceiver IO).
sources:
  - label: "Perceiver: General Perception with Iterative Attention (Jaegle et al., 2021)"
    url: "https://arxiv.org/abs/2103.03206"
    type: paper
  - label: "Perceiver IO: A General Architecture for Structured Inputs and Outputs (Jaegle et al., 2021)"
    url: "https://arxiv.org/abs/2107.14795"
    type: paper
  - label: "Perceiver IO: a scalable, fully-attentional model that works on any modality (Hugging Face, 2021)"
    url: "https://huggingface.co/blog/perceiver"
    type: blog
---

Self-[attention](../attention-mechanisms/)'s cost grows with the *square* of the
input length, which is why every modality historically needed its own input
machinery — [tokenizers](../tokenization/) for text, patch grids for
[ViTs](../vision-transformer/), spectrograms for audio — all tricks to shrink the
sequence before the transformer sees it. The Perceiver removes that constraint
with one asymmetry: keep a small **latent array** of a few hundred learned
vectors, and let *it* attend to the raw input, however large. The expensive
quadratic computation happens only in the latent space, whose size you chose; the
input — 50,000 pixels, an audio waveform, a point cloud — is touched only by
cheap linear-cost cross-attention.

## How it works

1. **Cross-attention reads the input.** The latent array (say, 512 vectors)
   forms the queries; the raw input array (up to hundreds of thousands of
   elements) supplies keys and values. Cost scales with `input × latent`, not
   `input²`. Modality enters only through [positional/Fourier
   encodings](../positional-encoding/) attached to the input elements.
2. **A latent transformer does the thinking.** Stacks of ordinary
   [transformer blocks](../transformer-block/) run self-attention *within* the
   latent array — a fixed, input-independent budget of computation.
3. **Repeat.** Cross-attend to the input again at intervals, letting the latents
   fetch details they now know they need — iterative attention, reading the
   input several times with sharper questions.
4. **Perceiver IO adds structured outputs.** A final cross-attention runs in
   reverse: a set of *output queries* (one per desired output element — per
   pixel, per label, per audio sample) attends to the latents. Input size,
   computation, and output size are all decoupled.

The price of generality: a fixed-size latent array is an information bottleneck,
and giving up modality-specific structure (like convolution's translation bias)
means the architecture leans harder on data scale.

## Where you'll see it

Less as a headline model than as a *component*: the *Perceiver Resampler* in
Flamingo-style [vision-language models](../vision-language-models/) is exactly
this pattern — squeeze a variable number of image features into a fixed handful
of latent vectors before handing them to the language model. The same
fixed-latent cross-attention trick recurs wherever a model must ingest
arbitrarily large or oddly-shaped inputs at bounded cost.

## Related concepts

- [attention mechanisms](../attention-mechanisms/) — the quadratic cost being engineered around; cross-attention is the workhorse here
- [transformer block](../transformer-block/) — the latent processor is a plain stack of them
- [vision transformer](../vision-transformer/) — the modality-specific alternative: solve images by patching, rather than any input by latents
- [positional encoding](../positional-encoding/) — carries all the modality structure the architecture itself gives up
- [vision-language models](../vision-language-models/) — where the Perceiver pattern survives in production, as Flamingo's resampler
