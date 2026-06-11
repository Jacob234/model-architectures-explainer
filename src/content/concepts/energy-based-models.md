---
title: energy-based models
tier: family
kind: generative-framework
summary: "A framework that assigns a scalar energy to each configuration — low for plausible data, high for everything else. Generation and inference become search: descent on the energy landscape."
---

Most generative models output probabilities or samples directly. Energy-based models (EBMs) take a different stance: a model defines a scalar **energy function** `E(x)` that scores how compatible a configuration is with the data. Low energy means "plausible"; high energy means "unlikely." Training shapes the landscape so that real data sits in low-energy valleys and everything else is pushed uphill. To generate a sample, you start from a random configuration and descend the landscape — following the gradient of the energy until you settle somewhere low.

The defining feature, and the central difficulty, is that EBMs do **not require a normalized probability**. Any energy function implies a probability via `p(x) ∝ e^(−E(x))`, but computing the normalizing constant (the partition function `Z`) requires integrating over all possible inputs — intractable for high-dimensional data like images.

## How it works

**Training without `Z`.** The main training families each avoid computing the partition function:

- **Contrastive methods** — push energy down on real data and up on "negative" (contrast) samples, so training only compares energies and never needs `Z`. The [GAN](../generative-adversarial-networks/) discriminator fits here: it is implicitly a learned energy that distinguishes real from fake.
- **Score matching** — learn the gradient of the log-density (the negative energy gradient), which is independent of `Z`. This is the bridge to [diffusion models](../diffusion-models/): their denoising objective is a form of score matching over a noisy energy.
- **MCMC / Langevin sampling** — generate negative samples by descending the energy with small gradient steps plus injected noise (Langevin dynamics), then use those as contrast examples in contrastive divergence.

**Inference.** Given a query, minimize energy over the unknown variables. Given nothing, run Langevin dynamics from random noise to generate a sample. This makes EBMs naturally suited to structured prediction, where you want to score candidates rather than emit one deterministic answer.

## Historical roots

EBMs descend from statistical physics. **Hopfield networks** (1982) store memories as low-energy attractor states and retrieve them by energy descent — the canonical example of an energy landscape with discrete basins. **Boltzmann machines** are stochastic EBMs over binary units. Modern deep EBMs replace these with neural networks that produce a scalar output, but the core idea is unchanged.

Yann LeCun champions EBMs as a unifying lens: he frames [JEPA](../joint-embedding-predictive-architecture/) and contrastive learning as special cases of energy-based learning, where the goal is always to carve low energy around good answers.

## Where you'll see it

EBMs appear most visibly through their connections to other families — the GAN discriminator, diffusion's score-matching objective — rather than as standalone deployment targets. Active research uses them for structured prediction (parsing, protein design) and as a theoretical framework for understanding what contrastive self-supervised learning is actually doing.

## Related concepts

- [diffusion models](../diffusion-models/) — connected through score matching; diffusion learns the gradient of an energy without the partition function
- [generative adversarial networks](../generative-adversarial-networks/) — the discriminator acts as a learned energy function
- [joint-embedding predictive architecture](../joint-embedding-predictive-architecture/) — LeCun frames JEPA as an EBM: low energy when predicted representation matches observed
- [variational-autoencoders](../variational-autoencoders/) — another generative framework; VAEs normalize explicitly via a latent distribution, EBMs avoid normalization entirely
