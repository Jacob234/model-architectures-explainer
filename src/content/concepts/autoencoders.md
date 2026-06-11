---
title: autoencoders
tier: family
kind: architecture
summary: Encoder squeezes the input through a bottleneck; decoder rebuilds it. The bottleneck is forced to learn what matters — and is the parent of VAEs and sparse autoencoders.
---

An autoencoder is a neural network trained to reconstruct its own input after
squeezing it through a narrow **bottleneck**. An [encoder](/concepts/encoder/)
maps the input to a compact latent code; a [decoder](/concepts/decoder/) expands
that code back into a reconstruction; the network minimizes the difference
between the input and the output. Because the bottleneck is smaller than the
input, the network cannot simply copy — it must learn which features are salient
enough to survive the compression. The latent code is the payoff: a learned,
compressed representation of the input.

Autoencoders are a foundational self-supervised pattern — no labels needed, just
the data reconstructing itself — and the parent concept for a family of variants
used in dimensionality reduction, denoising, representation learning, and anomaly
detection.

## How it works

Given input x, the encoder produces a latent code z with far fewer dimensions;
the decoder produces a reconstruction from z. Training minimizes a reconstruction
loss — typically mean squared error for continuous data, cross-entropy for
discrete. The bottleneck is the inductive pressure: everything must pass through
a tight latent, so the encoder learns what actually matters.

A linear autoencoder with MSE loss recovers something close to PCA. Nonlinear
encoders generalize this to curved, more expressive manifolds.

**Common variants** specialize the basic recipe:

- **Denoising autoencoder** — corrupt the input, train to reconstruct the clean
  original. Forces robust features; the conceptual ancestor of
  [diffusion models](/concepts/diffusion-models/), which are a stack of learned
  denoisers.
- **Variational autoencoder (VAE)** — the bottleneck becomes a probability
  distribution with a prior, creating a smooth, samplable latent space. See
  [variational autoencoders](/concepts/variational-autoencoders/).
- **Sparse autoencoder** — penalize the latent to be mostly zero so each active
  unit captures a distinct, interpretable feature. Now heavily used to decompose
  large language model activations in mechanistic interpretability research.

## Where you'll see it

Once trained, the encoder is a feature extractor: its codes serve as
[embeddings](/concepts/embeddings/) for downstream tasks or as a similarity
space. Reconstruction error is also a signal: inputs the autoencoder rebuilds
poorly are likely anomalies (out of distribution), which is the basis of
autoencoder-based anomaly detection.

## Related concepts

- [variational-autoencoders](/concepts/variational-autoencoders/) — the probabilistic, generative child
- [encoder](/concepts/encoder/) — the compressing half
- [decoder](/concepts/decoder/) — the expanding half
- [diffusion-models](/concepts/diffusion-models/) — denoising autoencoders are the conceptual seed of diffusion
- [embeddings](/concepts/embeddings/) — the latent code is itself a learned embedding
