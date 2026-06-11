---
title: autoencoders
tier: family
kind: architecture
summary: Encoder squeezes the input through a bottleneck; decoder rebuilds it. The bottleneck is forced to learn what matters — and is the parent of VAEs and sparse autoencoders.
sources:
  - label: "Reducing the Dimensionality of Data with Neural Networks (Hinton and Salakhutdinov, 2006)"
    url: "https://www.cs.toronto.edu/~hinton/absps/science.pdf"
    type: paper
  - label: "From Autoencoder to Beta-VAE (Lilian Weng, 2018)"
    url: "https://lilianweng.github.io/posts/2018-08-12-vae/"
    type: blog
  - label: "Anomagram: Anomaly Detection with Autoencoders in the Browser (Victor Dibia, 2019)"
    url: "https://anomagram.fastforwardlabs.com/"
    type: explainer
  - label: "Building Autoencoders in Keras (Francois Chollet, 2016)"
    url: "https://blog.keras.io/building-autoencoders-in-keras.html"
    type: blog
---

An autoencoder is a neural network trained to reconstruct its own input after
squeezing it through a narrow **bottleneck**. An [encoder](../encoder/)
maps the input to a compact latent code; a [decoder](../decoder/) expands
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
  [diffusion models](../diffusion-models/), which are a stack of learned
  denoisers.
- **Variational autoencoder (VAE)** — the bottleneck becomes a probability
  distribution with a prior, creating a smooth, samplable latent space. See
  [variational autoencoders](../variational-autoencoders/).
- **Sparse autoencoder** — penalize the latent to be mostly zero so each active
  unit captures a distinct, interpretable feature. Now heavily used to decompose
  large language model activations in mechanistic interpretability research.

## Where you'll see it

Once trained, the encoder is a feature extractor: its codes serve as
[embeddings](../embeddings/) for downstream tasks or as a similarity
space. Reconstruction error is also a signal: inputs the autoencoder rebuilds
poorly are likely anomalies (out of distribution), which is the basis of
autoencoder-based anomaly detection.

## Related concepts

- [variational-autoencoders](../variational-autoencoders/) — the probabilistic, generative child
- [encoder](../encoder/) — the compressing half
- [decoder](../decoder/) — the expanding half
- [diffusion-models](../diffusion-models/) — denoising autoencoders are the conceptual seed of diffusion
- [embeddings](../embeddings/) — the latent code is itself a learned embedding
