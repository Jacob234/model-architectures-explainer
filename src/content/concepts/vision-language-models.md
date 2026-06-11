---
title: vision-language models (VLMs)
tier: family
kind: model-class
summary: A composition of a vision encoder and an LLM decoder — not a new wiring, but a projector-bridged assembly that lets a language model process images alongside text (LLaVA, Flamingo).
---

A vision-language model (VLM) is a **composition**, not a fundamentally new architecture. The dominant recipe takes three existing pieces and connects them: a visual [encoder](../encoder/) (typically a [Vision Transformer](../vision-transformer/)) converts image patches into feature vectors; a lightweight projector maps those vectors into the [LLM](../large-language-models/)'s token space; and the LLM [decoder](../decoder/) processes interleaved image and text tokens together. The LLM never sees raw pixels — only the encoder's compressed representation, spliced into the token stream like a "foreign language."

This assembly enables open-ended visual question answering, image captioning, video understanding, and visual reasoning all through the same prompt interface, without training a separate model for each task. LLaVA is the clearest example of the projector-based recipe; Flamingo is a notable variant that interleaves cross-attention layers between text and image features instead.

## How it works

**Visual [encoder](../encoder/).** A pretrained vision model — [CLIP](../clip/) ViT, SigLIP, DINOv2 — converts an image into a grid of [embedding](../embeddings/) vectors, typically 196–729 tokens per image depending on patch size. Reducing token count is critical for efficiency: fewer image tokens means shorter sequences for the LLM.

**Projector.** A lightweight network (often a 2-layer MLP or cross-attention module) that maps visual tokens from the encoder's embedding space into the LLM's embedding space. This alignment layer is the only genuinely new piece; the encoder and LLM are both pretrained and optionally frozen.

**LLM backbone.** The language model processes the combined visual and text token sequence autoregressively. Larger LLMs produce better reasoning; smaller ones (3B–8B parameters) enable edge deployment.

**Training.** A typical three-stage recipe: first train only the projector on image-caption pairs; then unfreeze the LLM and train on interleaved image-text data (enabling multi-image in-context learning); finally fine-tune on visual instruction data. Re-blending text-only data in the final stage prevents degradation on language tasks.

## Variants

The projector-bridge (LLaVA-style) is dominant, but Flamingo took a different route: it inserts cross-[attention](../attention-mechanisms/) layers between a frozen LLM and visual features, allowing visual and text streams to interact at multiple depths without concatenating them into one token sequence.

As LLM backbones grow more capable, VLM quality scales with them — the ceiling is set by the base language model.

## Where you'll see it

Industrial inspection (defect classification, safety monitoring), retail analytics, video surveillance, and accessibility tooling are major deployments. The key capability VLMs add over task-specific computer vision is **natural language reasoning over images**: instead of a binary defect flag, a VLM generates an explanation.

## Related concepts

- [encoder](../encoder/) — the visual tower that converts image patches into vectors
- [vision-transformer](../vision-transformer/) — the architecture typically used as the visual encoder
- [clip](../clip/) — the dual-encoder model whose visual backbone many VLMs use
- [large-language-models](../large-language-models/) — the LLM backbone providing language reasoning
- [decoder](../decoder/) — the generation half that processes interleaved image + text tokens
- [attention-mechanisms](../attention-mechanisms/) — cross-attention connects visual and text streams in Flamingo-style VLMs
- [vision-language-action-model](../vision-language-action-model/) — the robotics extension of VLMs
