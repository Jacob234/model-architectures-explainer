---
title: CLIP (dual-encoder)
tier: family
kind: architecture
summary: Two separate encoders — one for images, one for text — trained so matching pairs land close together in a shared embedding space. Introduced by OpenAI (Radford et al., 2021).
sources:
  - label: "Learning Transferable Visual Models From Natural Language Supervision (Radford et al., 2021)"
    url: "https://arxiv.org/abs/2103.00020"
---

CLIP is not a single tower. It is **two separate
[encoders](/concepts/encoder/)** — one for images, one for text — trained jointly
so that a photo and its matching caption end up near each other in a shared
[embedding](/concepts/embeddings/) space, while mismatched pairs are pushed
apart. Introduced by OpenAI in 2021, CLIP demonstrated that 400 million
web-scraped image-caption pairs are enough supervision to learn a remarkably
general visual representation, and that the result transfers to new visual
categories without any retraining.

## How it works

The image encoder is typically a [Vision Transformer](/concepts/vision-transformer/)
(or a modified ResNet); the text encoder is a transformer. Both are trained from
scratch. A linear projection on each side maps into the same embedding dimension;
embeddings are L2-normalized so similarity becomes cosine distance.

**Training uses an InfoNCE contrastive loss with in-batch negatives.** Given a
batch of N image-caption pairs, compute an N×N cosine-similarity matrix.
The N diagonal entries are correct matches (positives); all off-diagonal entries
are negatives. A symmetric cross-entropy loss pushes each image to prefer its
own caption over every other caption in the batch, and vice versa. More negatives
per positive make the discrimination signal richer — CLIP was trained with
batches of 32,768.

**Zero-shot classification** is CLIP's signature capability at inference time:
for each candidate class, construct a text prompt ("a photo of a {class}"),
embed it with the text encoder, embed the query image with the image encoder,
and pick the class whose text embedding is most similar. No fine-tuning, no
labeled examples.

## Where you'll see it

CLIP's image encoder became the standard visual backbone for
[vision-language models](/concepts/vision-language-models/) (LLaVA, InstructBLIP,
and others). Its text encoder is the conditioning signal for text-to-image
diffusion models. SigLIP (Google, 2023) replaced the softmax-based contrastive
loss with a pairwise sigmoid loss, decoupling training from batch size and
becoming the default for newer dual-encoder models. MetaCLIP (Meta, 2024) showed
that data curation choices explain much of CLIP's success.

CLIP has clear limitations: it struggles with fine-grained distinctions
(subspecies, expert categories), counting, precise spatial reasoning, and
typographic attacks (pasting text onto an image can override the visual content).

## Related concepts

- [vision-transformer](/concepts/vision-transformer/) — the most common image encoder backbone inside CLIP
- [embeddings](/concepts/embeddings/) — CLIP produces aligned image-text embeddings in a shared space
- [encoder](/concepts/encoder/) — CLIP uses two, one per modality
- [vision-language models](/concepts/vision-language-models/) — VLMs typically start from CLIP's pretrained image encoder
- [diffusion-models](/concepts/diffusion-models/) — use CLIP or its successors as the text-conditioning signal
- [joint-embedding-predictive-architecture](/concepts/joint-embedding-predictive-architecture/) — a related joint-embedding approach, but predictive within one modality rather than contrastive across two
