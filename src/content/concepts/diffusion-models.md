---
title: diffusion models
tier: family
kind: generative-framework
summary: Generate by reversing noise — start from static and repeatedly denoise until an image (or video) emerges. The denoiser inside is swappable, and flow matching is the straight-line successor that trains most modern systems.
---

Diffusion models generate images (and audio, video, and 3D content) by learning to reverse a gradual noising process. The training recipe: take a real image, add Gaussian noise step by step until it's pure static, then train a neural network to predict the noise at each step. Generation runs that process in reverse — start from random noise and repeatedly subtract predicted noise until a coherent image emerges. This approach overtook generative adversarial networks as the dominant image generation framework around 2021–2022 and now powers Stable Diffusion, DALL-E 3, Midjourney, and Imagen.

## How it works

The **forward process** is fixed and not learned: add a small amount of Gaussian noise to an image at each of T timesteps until the result is indistinguishable from pure noise. The **reverse process** is what the model learns: given a noisy image at timestep t, predict the noise that was added so it can be subtracted to recover a slightly cleaner image at t-1.

The training objective is a mean-squared error between the predicted noise and the actual noise:

```
L = E[‖ε - ε_θ(xₜ, t)‖²]
```

The key insight is that this breaks a hard problem into many small easy ones. Rather than generating a coherent image in one shot, each denoising step is a simple regression. Early steps (high noise) establish large-scale structure — composition and color. Later steps refine textures and fine detail. This coarse-to-fine structure is why diffusion models produce sharp, detailed outputs.

**Latent diffusion** — used by Stable Diffusion and most modern systems — runs the diffusion process in a compressed latent space (produced by a variational autoencoder) rather than in pixel space. A 512×512 image (~786K dimensions) compresses to ~16K dimensions, making the diffusion process ~50× cheaper.

**Conditioning** lets the model generate to specification. Text-to-image models inject text [embeddings](../embeddings/) through cross-attention layers inside the denoiser, guiding each denoising step toward the description. Classifier-free guidance amplifies the conditional signal at inference time by blending conditional and unconditional denoising predictions.

## The denoiser is swappable

The learned component — the denoiser — is not part of the diffusion framework itself; it is a pluggable backbone. The original DDPM used a U-Net ([convolutional neural network](../convolutional-neural-networks/) architecture) with skip connections. The [Diffusion Transformer (DiT)](../diffusion-transformer/) replaced the U-Net with a transformer, and DiT-based models now power the highest-capability systems (SD3, Sora-class video). The diffusion objective is unchanged; only the network architecture inside changes.

## Flow matching

[Flow matching](../flow-matching/) is the straight-line generalization of diffusion: instead of predicting noise at each step of a curved stochastic trajectory, the model learns a velocity field that transports noise to data along straight paths. This reduces the number of sampling steps required and simplifies training. SD3 and Flux — the leading open-source image models — use flow matching objectives with transformer denoisers.

## Related concepts

- [diffusion-transformer](../diffusion-transformer/) — the transformer-based denoiser replacing U-Net in modern systems
- [flow-matching](../flow-matching/) — the straight-path successor objective that trains SD3 and Flux
- [variational-autoencoders](../variational-autoencoders/) — the VAE that compresses images into the latent space diffusion runs in
- [embeddings](../embeddings/) — text conditioning works by injecting text embeddings into the denoiser via cross-attention
- [convolutional-neural-networks](../convolutional-neural-networks/) — the U-Net denoiser is a convolutional architecture
- [attention-mechanisms](../attention-mechanisms/) — cross-attention connects text conditioning to image generation inside the denoiser
