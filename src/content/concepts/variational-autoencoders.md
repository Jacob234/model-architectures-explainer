---
title: variational autoencoders (VAEs)
tier: family
kind: generative-framework
summary: An autoencoder whose bottleneck is a probability distribution — rebuild the input, but keep the latent space smooth enough to sample new data from (ELBO = reconstruction + KL). Introduced by Kingma & Welling in 2014.
---

A variational autoencoder is a generative model built on the
[autoencoder](../autoencoders/) pattern, with one crucial change: the
bottleneck is a **probability distribution** rather than a fixed vector. The
[encoder](../encoder/) maps each input to a mean and variance describing a
Gaussian in latent space; the [decoder](../decoder/) reconstructs the input
from a sample drawn from that Gaussian. The result is a latent space that is
continuous and smooth — you can sample new points anywhere in it and get
plausible outputs, and you can interpolate between two inputs and get a
meaningful path.

## How it works

The encoder q(z|x) produces distribution parameters (mean μ, variance σ²) for
a latent variable z. The decoder p(x|z) reconstructs the input from a sample
drawn from that distribution. A prior — usually a standard Gaussian — is imposed
on the latent space to keep it organized.

**Training uses the Evidence Lower Bound (ELBO)**, which has two terms:

- **Reconstruction loss** — how faithfully does the decoder rebuild the input
  from the sampled latent?
- **KL divergence** — how far is the encoder's per-input distribution from the
  prior? This term regularizes the latent space, preventing it from degenerating
  into a lookup table and keeping it smooth enough to sample from.

**The reparameterization trick** makes backprop possible: write z = μ + σ·ε
where ε is external noise. Now μ and σ are on a differentiable path and
gradients flow back through the encoder.

**VQ-VAE** (van den Oord et al., 2017) replaces the Gaussian latent with a
discrete codebook: the encoder output snaps to its nearest codebook entry,
producing discrete tokens that autoregressive models can generate.
This is the basis of token-based image and audio generation.

## Where you'll see it

VAEs are less commonly used as standalone image generators today — their outputs
tend to be blurrier than [diffusion model](../diffusion-models/) or
[GAN](../generative-adversarial-networks/) outputs. Their bigger role is
as a **compression front-end**: latent diffusion models (including Stable
Diffusion) use a pretrained VAE to compress high-resolution images into a compact
latent space where diffusion actually runs, then decode back to pixels. This
compression is what made high-resolution diffusion computationally tractable.

## Related concepts

- [autoencoders](../autoencoders/) — the parent pattern; VAEs are the probabilistic, generative member of the family
- [diffusion models](../diffusion-models/) — depend on the VAE encoder/decoder for latent-space efficiency
- [generative adversarial networks](../generative-adversarial-networks/) — the contrasting generative model; adversarial and sharp-but-unstable vs. VAE's likelihood-based stability
- [encoder](../encoder/) — outputs a latent distribution (mean + variance) rather than a point
- [decoder](../decoder/) — reconstructs input from a sampled latent code
