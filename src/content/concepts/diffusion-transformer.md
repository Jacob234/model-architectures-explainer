---
title: diffusion transformer (DiT)
tier: module
summary: A transformer backbone used as the denoiser inside a diffusion model — the architecture that replaced the convolutional U-Net in nearly every frontier image and video generation system.
---

DiT is a denoiser-backbone variant inside [diffusion models](../diffusion-models/), not a separate model family. Diffusion models generate images by repeatedly denoising a noisy input; the question is what network performs the denoising at each step. The first generation used a convolutional U-Net. DiT — introduced by Peebles and Xie in 2022 — replaces that U-Net with a transformer, giving diffusion the same clean scaling story that powered large language models: make the transformer bigger or deeper, and sample quality reliably improves. DiT is now the backbone of essentially every frontier image and video generation system: Stable Diffusion 3, PixArt, Flux, and Sora-class video models all use it.

## How it works

The key trick is **patchification**: DiT borrows the [Vision Transformer's](../vision-transformer/) strategy of cutting the input into non-overlapping patches, embedding each as a token, and feeding the sequence into a standard transformer. The noisy latent (a VAE-compressed image) becomes patch tokens enriched with [positional encodings](../positional-encoding/). After the transformer processes the sequence, output tokens are reassembled into a noise prediction. Smaller patches mean more tokens, more compute, and higher quality — the main quality/cost knob.

The transformer blocks are standard: [attention mechanisms](../attention-mechanisms/) let every patch attend to every other, and [feed-forward networks](../feed-forward-networks/) operate position-wise, with [residual connections](../residual-connections/) and [layer normalization](../layer-normalization/) throughout.

Conditioning on the timestep and text prompt is handled two ways. The DiT paper's preferred method, **adaLN-zero**, regresses adaptive layer normalization parameters from the conditioning vector — weights are zero-initialized so each block starts as identity. For richer text conditioning, later designs like Stable Diffusion 3 add cross-attention so patch tokens attend directly to text representations.

## Where you'll see it

DiT is the denoiser backbone for leading open image-generation systems (SD3, Flux). Extending patchification along the time dimension turns a DiT into a video model — the lineage behind Sora-class systems.

## Related concepts

- [diffusion models](../diffusion-models/) — the framework DiT operates inside; DiT is a backbone choice, not a new framework
- [vision transformer](../vision-transformer/) — DiT inherits the patchify-then-attend recipe
- [flow matching](../flow-matching/) — the training objective increasingly paired with DiT backbones
- [attention mechanisms](../attention-mechanisms/) — the core operation across patch tokens
