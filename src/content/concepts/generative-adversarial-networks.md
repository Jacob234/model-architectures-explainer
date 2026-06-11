---
title: generative adversarial networks (GANs)
tier: family
kind: generative-framework
summary: A generator forges samples while a discriminator learns to spot fakes; trained against each other until the forgeries get good (StyleGAN). Introduced by Goodfellow et al. in 2014.
---

Generative adversarial networks pit two networks against each other in a minimax
game. A **generator** maps random noise into synthetic samples; a **discriminator**
tries to tell the generator's fakes from real training data. Each improves at
the expense of the other until, at the theoretical optimum, the generator
reproduces the training distribution and the discriminator can only guess. For
most of 2015–2021, GANs were the dominant paradigm for high-fidelity image
synthesis — StyleGAN's photorealistic faces were the high-water mark — before
being largely displaced by [diffusion models](../diffusion-models/) around
2022.

## How it works

The generator G maps a noise vector z to a sample G(z). The discriminator D
outputs a probability that its input is real. They optimize opposing objectives:
D wants to assign high probability to real data and low to fakes; G wants to
maximize the probability D assigns to its outputs. There is no
[encoder](../encoder/) — unlike a
[variational autoencoder](../variational-autoencoders/), a vanilla GAN
only learns to *sample*, not to map data back into a latent space. Training
alternates gradient steps on each network.

**Failure modes** are intrinsic to the adversarial setup:

- **Mode collapse** — the generator finds a few outputs that reliably fool the
  discriminator and produces only those, ignoring the rest of the distribution.
- **Non-convergence** — the two networks chase each other without settling; the
  minimax objective has no guaranteed equilibrium under gradient descent.

Wasserstein GANs replaced the original divergence measure with one that gives
smoother gradients; spectral normalization and gradient penalties further
stabilized training. StyleGAN added a style-based generator with fine-grained
control over image attributes.

## Where you'll see it

GANs matter most where **single-step sampling** is the priority: a GAN generates
in one forward pass, while [diffusion models](../diffusion-models/) need
many denoising steps. This speed advantage keeps GAN-style adversarial objectives
alive in diffusion distillation and fast-sampling research. The discriminator's
role — scoring how "real" a configuration looks — connects to
[energy-based models](../energy-based-models/), which also assign a scalar
energy to configurations and train a network to tell real from not-real.

## Related concepts

- [diffusion models](../diffusion-models/) — the paradigm that displaced GANs; far more stable training, slower sampling
- [variational autoencoders](../variational-autoencoders/) — the other classic latent-variable generative family; likelihood-based and stable, but blurrier outputs
- [energy-based models](../energy-based-models/) — the discriminator behaves like a learned energy function (low energy = realistic)
- [convolutional neural networks](../convolutional-neural-networks/) — DCGAN established the convolutional generator/discriminator that most image GANs use
