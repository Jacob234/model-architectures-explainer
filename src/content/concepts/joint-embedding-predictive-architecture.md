---
title: JEPA (joint-embedding predictive architecture)
tier: family
kind: architecture
summary: Predict the representation of hidden content rather than its pixels — LeCun's alternative to generative pretraining, using an encoder plus a predictor to learn in latent space (I-JEPA, V-JEPA).
---

Most self-supervised pretraining asks a model to reconstruct masked content at
the pixel or token level. JEPA asks a different question: given the visible part
of an input, can you predict the **representation** of the hidden part? The
distinction matters. Pixel-level generation requires modeling every low-level
detail — exact textures, shadows, fine noise — that is largely unpredictable and
semantically irrelevant. By predicting in an abstract representation space, JEPA
discards that noise and focuses on the predictable, semantically meaningful
structure of the input.

Proposed by Yann LeCun as part of a broader program for machine intelligence
without pixel-generative objectives, JEPA is explicitly positioned against both
autoregressive next-token prediction and reconstructive generative pretraining.

## How it works

JEPA uses three components: a **context encoder**, a **target encoder**, and a
**[predictor](../predictor/)**.

1. Mask part of the input. Feed the visible context through the context
   [encoder](../encoder/) → context representation.
2. Feed the masked target region through the target encoder → target
   representation. The target encoder is a stop-gradient EMA of the context
   encoder's weights, so targets are stable and not directly optimized.
3. The [predictor](../predictor/) takes the context representation plus
   positional information about where the masked region is, and predicts the
   target representation. The loss is the distance between predicted and actual
   target embeddings — computed in **latent space**, never in input space.

**Avoiding collapse** — predicting representations risks a trivial solution where
both encoders output a constant. JEPA prevents this through the asymmetry between
the online context encoder and the stop-gradient EMA target encoder, combined
with the predictor's information bottleneck.

## Variants

**I-JEPA** (images) — predicts the representations of several large masked image
blocks from a single context block, all in the latent space of a
[Vision Transformer](../vision-transformer/). It learns strong features
without the hand-designed augmentations that contrastive methods rely on.

**V-JEPA** (video) — extends masking to spatiotemporal regions of video. The aim
is a model that learns intuitive physics and object dynamics from passive video —
a concrete step toward a [world model](../world-models/).

## Related concepts

- [encoder](../encoder/) — both the context and target encoders embed input into representation space
- [predictor](../predictor/) — the module that maps context representation to predicted target representation
- [vision-transformer](../vision-transformer/) — the encoder backbone in I-JEPA and V-JEPA
- [world-models](../world-models/) — JEPA's stated purpose: a predictive model of the world in representation space
- [clip](../clip/) — a related joint-embedding approach, but contrastive across modalities rather than predictive within one
- [energy-based-models](../energy-based-models/) — LeCun's unifying framework; JEPA defines an energy that is low when predicted and observed representations match
