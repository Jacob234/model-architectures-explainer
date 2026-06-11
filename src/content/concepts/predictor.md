---
title: predictor
tier: module
summary: A lightweight module that predicts the representation of hidden content from visible context — the defining piece of JEPA and latent world models.
---

A predictor is a module that takes a context representation and forecasts what the representation of some hidden or future part *should be* — operating entirely in the model's internal [embedding](/concepts/embeddings/) space rather than generating pixels or tokens. It is the defining component of [joint embedding predictive architectures](/concepts/joint-embedding-predictive-architecture/) (JEPA) and latent [world models](/concepts/world-models/), and marks a deliberate departure from generative training: instead of reconstructing raw input, the model learns to predict abstract summaries of what it hasn't seen.

## How it works

The standard JEPA setup pairs two [encoders](/concepts/encoder/): a context encoder that maps the visible part of an input into a representation, and a target encoder that maps the hidden part into its own representation. The predictor sits between them — it receives the context representation plus a positional signal indicating *which* hidden region to predict, and outputs an estimate of the target representation. Training minimizes the distance between prediction and actual target embedding.

A critical detail prevents collapse: the target encoder is not updated by gradient descent directly, but instead tracks the context encoder via an exponential moving average. This asymmetry forces the model to learn genuinely informative summaries rather than the degenerate solution of mapping everything to the same constant vector.

The contrast with a generative [output head](/concepts/output-head/) is instructive. A language model's output head must assign probability to every token in the vocabulary — including unpredictable surface noise. A predictor commits only to the *abstract structure* of what comes next, sidestepping detail that carries no useful information.

## Where you'll see it

The predictor module powers I-JEPA and V-JEPA, which apply this framework to images and video. The same pattern appears in latent [world models](/concepts/world-models/): rather than simulating future frames pixel by pixel, the model predicts how the latent state will evolve under a sequence of actions.

## Related concepts

- [joint embedding predictive architecture](/concepts/joint-embedding-predictive-architecture/) — the framework built around this module
- [world models](/concepts/world-models/) — latent world models use a predictor to forecast future state representations
- [encoder](/concepts/encoder/) — supplies the context and target representations the predictor operates on
- [output head](/concepts/output-head/) — the contrasting module: predicts outputs, not representations
- [embeddings](/concepts/embeddings/) — the space in which all prediction happens
