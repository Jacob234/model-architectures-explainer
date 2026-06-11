---
title: predictor
tier: module
summary: A lightweight module that predicts the representation of hidden content from visible context — the defining piece of JEPA and latent world models.
sources:
  - label: "A Path Towards Autonomous Machine Intelligence (Yann LeCun, 2022)"
    url: "https://openreview.net/forum?id=BZ5a1r-kVsf"
    type: paper
  - label: "Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture (Assran et al., 2023)"
    url: "https://arxiv.org/abs/2301.08243"
    type: paper
  - label: "V-JEPA: The next step toward advanced machine intelligence (Meta AI, 2024)"
    url: "https://ai.meta.com/blog/v-jepa-yann-lecun-ai-model-video-joint-embedding-predictive-architecture/"
    type: blog
---

A predictor is a module that takes a context representation and forecasts what the representation of some hidden or future part *should be* — operating entirely in the model's internal [embedding](../embeddings/) space rather than generating pixels or tokens. It is the defining component of [joint embedding predictive architectures](../joint-embedding-predictive-architecture/) (JEPA) and latent [world models](../world-models/), and marks a deliberate departure from generative training: instead of reconstructing raw input, the model learns to predict abstract summaries of what it hasn't seen.

## How it works

The standard JEPA setup pairs two [encoders](../encoder/): a context encoder that maps the visible part of an input into a representation, and a target encoder that maps the hidden part into its own representation. The predictor sits between them — it receives the context representation plus a positional signal indicating *which* hidden region to predict, and outputs an estimate of the target representation. Training minimizes the distance between prediction and actual target embedding.

A critical detail prevents collapse: the target encoder is not updated by gradient descent directly, but instead tracks the context encoder via an exponential moving average. This asymmetry forces the model to learn genuinely informative summaries rather than the degenerate solution of mapping everything to the same constant vector.

The contrast with a generative [output head](../output-head/) is instructive. A language model's output head must assign probability to every token in the vocabulary — including unpredictable surface noise. A predictor commits only to the *abstract structure* of what comes next, sidestepping detail that carries no useful information.

## Where you'll see it

The predictor module powers I-JEPA and V-JEPA, which apply this framework to images and video. The same pattern appears in latent [world models](../world-models/): rather than simulating future frames pixel by pixel, the model predicts how the latent state will evolve under a sequence of actions.

## Related concepts

- [joint embedding predictive architecture](../joint-embedding-predictive-architecture/) — the framework built around this module
- [world models](../world-models/) — latent world models use a predictor to forecast future state representations
- [encoder](../encoder/) — supplies the context and target representations the predictor operates on
- [output head](../output-head/) — the contrasting module: predicts outputs, not representations
- [embeddings](../embeddings/) — the space in which all prediction happens
