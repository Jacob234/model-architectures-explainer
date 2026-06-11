---
title: VQ-VAE
tier: family
kind: architecture
summary: An autoencoder with a discrete codebook bottleneck — images become grids of tokens, which is what lets transformers generate them (VQ-VAE, VQGAN, DALL-E 1).
sources:
  - label: "Neural Discrete Representation Learning (van den Oord et al., 2017)"
    url: "https://arxiv.org/abs/1711.00937"
    type: paper
  - label: "Understanding VQ-VAE — DALL-E Explained Pt. 1 (Charlie Snell, ML@Berkeley, 2021)"
    url: "https://mlberkeley.substack.com/p/vq-vae"
    type: blog
  - label: "Taming Transformers for High-Resolution Image Synthesis (Esser, Rombach and Ommer, 2020)"
    url: "https://arxiv.org/abs/2012.09841"
    type: paper
---

A [VAE](../variational-autoencoders/) compresses an image into a *continuous*
latent vector. VQ-VAE makes one pointed change: the latent must be **discrete** —
every position in the compressed representation snaps to its nearest entry in a
learned codebook of, say, 8,192 vectors. An image stops being a tensor of floats
and becomes a small grid of code indices: 32×32 integers instead of 256×256×3
pixels.

Why force that? Because sequences of discrete symbols are exactly what
autoregressive transformers eat. [Tokenization](../tokenization/) did this for
text by design; VQ-VAE does it for images by construction — it *learns* the
visual vocabulary. That single move is the bridge that let language-model
machinery generate pictures.

## How it works

**The autoencoder stage.** A convolutional [encoder](../encoder/) maps the image
to a grid of latent vectors. Each vector is replaced by its nearest neighbor in
the codebook (vector quantization), and a [decoder](../decoder/) reconstructs the
image from the quantized grid. Snapping-to-nearest has no gradient, so training
uses the **straight-through estimator** — gradients skip over the quantization
step as if it were the identity — plus two auxiliary terms: a codebook loss
pulling code vectors toward the encoder's outputs, and a commitment loss pulling
the encoder toward the codes it uses.

**The prior stage.** The frozen autoencoder turns every training image into a
grid of code indices, and a second model — an autoregressive transformer like a
[decoder](../decoder/)-only LM — learns to generate those grids token by token.
Sampling means: generate a plausible index grid, then run it through the decoder
to get pixels. This two-stage recipe is DALL-E 1.

**VQGAN** sharpened the recipe by training the autoencoder with an adversarial
loss (a [GAN](../generative-adversarial-networks/) discriminator) alongside
reconstruction, so aggressive compression still yields crisp decodes — making the
token grids small enough for transformers to model at high resolution.

## Where you'll see it

Discrete visual tokens turned out to be infrastructure, not just a generator:
[BEiT](../masked-image-modeling/) uses them as targets for masked-image
pretraining, audio codecs like SoundStream apply the same quantization idea to
sound, and multimodal LLMs that emit images do so by predicting visual tokens.
The continuous-latent branch of the same idea — a VAE compressor without
quantization — underpins latent [diffusion](../diffusion-models/) (Stable
Diffusion's "latent space" is exactly this).

## Related concepts

- [variational autoencoders](../variational-autoencoders/) — the continuous-latent parent; VQ-VAE swaps the Gaussian bottleneck for a codebook
- [autoencoders](../autoencoders/) — the underlying compress-reconstruct skeleton
- [tokenization](../tokenization/) — the text-side analogue: a learned vocabulary of discrete atoms
- [generative adversarial networks](../generative-adversarial-networks/) — supplies VQGAN's perceptual sharpness
- [masked image modeling](../masked-image-modeling/) — BEiT predicts VQ-style visual tokens instead of pixels
