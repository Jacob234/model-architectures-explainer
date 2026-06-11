---
title: masked image modeling (MAE)
tier: family
kind: architecture
summary: BERT's fill-in-the-blank idea applied to pixels — hide most of an image's patches and train a vision transformer to reconstruct them. A simple, scalable way to pretrain vision encoders without labels (MAE, BEiT).
sources:
  - label: "Masked Autoencoders Are Scalable Vision Learners (He et al., 2021)"
    url: "https://arxiv.org/abs/2111.06377"
    type: paper
  - label: "BEiT: BERT Pre-Training of Image Transformers (Bao et al., 2021)"
    url: "https://arxiv.org/abs/2106.08254"
    type: paper
  - label: "Masked Autoencoders Are Scalable Vision Learners — Paper Explained (AI Coffee Break with Letitia, 2021)"
    url: "https://www.youtube.com/watch?v=Dp6iICL2dVI"
    type: video
---

[BERT](../bert/) showed that hiding ~15% of a sentence's tokens and training a model
to fill them back in produces representations that transfer to almost any language
task. Masked image modeling asks the obvious follow-up: does the same trick work on
pixels? The answer is yes — with one striking twist. Language is information-dense,
so masking 15% makes a hard puzzle; images are spatially redundant, so MAE has to
mask **75% of the patches** before reconstruction becomes a task worth learning
from. Solving it forces the model to internalize objects, shapes, and scene
structure rather than interpolating from neighboring pixels.

The result is one of the simplest recipes for pretraining a vision backbone
without labels: no contrastive pairs, no hand-designed augmentations, no
tokenizer — just hide most of the image and reconstruct it.

## How it works

MAE is an asymmetric [autoencoder](../autoencoders/) built from
[vision transformer](../vision-transformer/) parts.

1. **Patchify and mask.** Split the image into patches as a ViT would, then
   randomly drop 75% of them.
2. **Encode only what's visible.** The [encoder](../encoder/) — a full-size ViT —
   processes just the remaining 25% of patches. Skipping the masked positions
   entirely is the efficiency trick: the expensive network touches a quarter of
   the input, making pretraining 3×+ faster.
3. **Decode the full image.** A lightweight [decoder](../decoder/) receives the
   encoded visible patches plus shared learnable mask tokens (with
   [positional encodings](../positional-encoding/) saying where the holes are) and
   regresses the raw pixels of the masked patches. The loss is mean squared error
   on masked positions only.
4. **Throw the decoder away.** After pretraining, only the encoder survives — it
   becomes the backbone that gets fine-tuned for classification, detection,
   segmentation, or used as the vision encoder in larger systems.

**BEiT**, the other founding formulation, masks patches the same way but predicts
discrete visual token ids (from a pretrained [image tokenizer](../vq-vae/)) instead of raw
pixels — literally BERT's classification-over-vocabulary objective, where MAE
swaps in pixel regression and drops the tokenizer dependency.

## Relation to other pretraining

- Versus **contrastive methods** ([CLIP](../clip/)-style or SimCLR-style):
  masked modeling needs no negative pairs and no augmentation engineering, and it
  scales the way masked language modeling does — more data and bigger ViTs keep
  helping.
- Versus **[JEPA](../joint-embedding-predictive-architecture/)**: I-JEPA keeps the
  mask-and-predict structure but moves the target into latent space — predict the
  *representation* of hidden patches, not their pixels — arguing that
  reconstructing exact textures wastes capacity on unpredictable detail. MAE is
  the pixel-space baseline that JEPA defines itself against.

## Where you'll see it

MAE pretraining (and its video extension, VideoMAE) is a standard recipe for
initializing ViT backbones that later get fine-tuned on downstream vision tasks
or slotted into [vision-language models](../vision-language-models/). When a
paper says a vision encoder was "self-supervised pretrained," masked image
modeling is one of the two recipes it usually means — the other being contrastive.

## Related concepts

- [bert](../bert/) — the masked-prediction objective this family transplants from language
- [vision transformer](../vision-transformer/) — supplies the patch structure and the encoder backbone
- [autoencoders](../autoencoders/) — MAE is literally a masked, asymmetric autoencoder
- [encoder](../encoder/) / [decoder](../decoder/) — the asymmetric pair: big encoder kept, small decoder discarded
- [JEPA](../joint-embedding-predictive-architecture/) — same masking idea, but predicting latents instead of pixels
