---
title: Vision Transformer (ViT)
tier: family
kind: backbone
summary: Chops an image into patches, embeds each like a token, and runs a standard encoder over them. The training objective is not fixed — ViT is a backbone used for supervised classification, masked autoencoding, and contrastive learning alike.
sources:
  - label: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (Dosovitskiy et al., 2020)"
    url: "https://arxiv.org/abs/2010.11929"
    type: paper
  - label: "Transformers for Image Recognition at Scale (Google Research Blog, 2020)"
    url: "https://research.google/blog/transformers-for-image-recognition-at-scale/"
    type: blog
  - label: "An Image is Worth 16x16 Words — Paper Explained (Yannic Kilcher, 2020)"
    url: "https://www.youtube.com/watch?v=TrdevFK_am4"
    type: video
---

The Vision Transformer (ViT), introduced by Dosovitskiy et al. in 2020, made a provocative claim: convolution is not necessary for state-of-the-art image recognition. Split an image into small patches, treat each patch as a token, and feed the sequence to a standard transformer [encoder](../encoder/). Given enough pretraining data, this approach matches or beats convolutional networks on image classification — and it has since become the dominant visual backbone for multimodal AI.

## How it works

ViT's core contribution is a [tokenization](../tokenization/) recipe that turns a 2D image into a sequence the transformer already knows how to process:

1. **Patchify.** Divide the image (e.g., 224×224 pixels) into a grid of non-overlapping 16×16 patches, yielding 196 patches for that example — the "16×16 words" of the paper's title.
2. **Linear embedding.** Flatten each patch and project it through a learned linear layer to produce a fixed-dimensional token vector.
3. **Add [CLS] token and [positional encodings](../positional-encoding/).** Prepend a learnable classification token whose final-layer output represents the whole image, and add positional embeddings so the encoder knows where each patch sat in the grid — [attention mechanisms](../attention-mechanisms/) are otherwise order-blind.
4. **Transformer encoder.** Run the token sequence through a standard stack of multi-head attention and [feed-forward network](../feed-forward-networks/) blocks with [residual connections](../residual-connections/) and [layer normalization](../layer-normalization/).
5. **Output head.** Pass the final [CLS] embedding through a small MLP to produce class logits, or read all patch tokens for dense tasks.

The key tradeoff is inductive bias. [Convolutional neural networks](../convolutional-neural-networks/) bake in locality and translation invariance — strong priors that make them data-efficient. ViT has almost none of this built in, so it underperforms CNNs on modest datasets. With large-scale pretraining, it surpasses them, trading hard-coded structure for scale.

## The objective is not fixed

ViT is a backbone, not a training recipe. The same architecture is used for supervised classification on ImageNet, masked autoencoding ([MAE](../masked-image-modeling/) masks ~75% of patches and trains reconstruction of missing pixels — paralleling BERT's masked pretraining), and contrastive learning ([CLIP](../clip/) trains a ViT image encoder against a text encoder using image–caption pairs). What changes is the training objective and the output head, not the encoder stack.

## Variants

DeiT introduced distillation-based training that makes ViT data-efficient without industrial-scale pretraining datasets. Swin Transformer reintroduces hierarchical, windowed attention that gives ViT some CNN-like efficiency for dense prediction tasks (detection, segmentation). DINOv2 trains a ViT with self-supervised objectives that produce highly transferable features without any labels.

## Where you'll see it

ViT is the image encoder inside [CLIP](../clip/) and most modern [vision-language models](../vision-language-models/). Its patch-token output lives in the same embedding space as text tokens, which is what makes cross-modal attention straightforward. Understanding ViT is understanding how modern AI systems see.

## Related concepts

- [encoder](../encoder/) — the module ViT is built from
- [attention mechanisms](../attention-mechanisms/) — patches attend to every other patch globally from layer one
- [positional encoding](../positional-encoding/) — restores the spatial grid order that attention discards
- [convolutional neural networks](../convolutional-neural-networks/) — the architecture ViT challenges; CNNs win at small scale, ViT at large
- [clip](../clip/) — uses a ViT as its image encoder
- [vision-language models](../vision-language-models/) — ViT typically provides the visual tokens these models process
