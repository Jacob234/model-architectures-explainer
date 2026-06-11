---
title: world models
tier: family
kind: model-class
summary: A learned model of an environment's dynamics that lets an agent predict what happens next and plan ahead. A goal, not one wiring — the architecture and objective vary significantly across implementations.
---

A world model is the "imagination" half of an intelligent agent: instead of acting only on the current observation, the agent rolls its model of the environment forward to predict future states, evaluate counterfactuals, or generate entirely new situations to learn from. The term covers two related ideas that are worth keeping distinct.

The first is the **RL-lineage** sense: a compact latent model of dynamics used inside a reinforcement-learning agent for planning. MuZero learned to predict reward, value, and policy from a latent state without ever being told the rules of Atari, Go, or chess — then planned with that model via tree search. The Dreamer line did the same for continuous control, using [recurrent neural networks](/concepts/recurrent-neural-networks/) to maintain a latent state that could be rolled forward in imagination.

The second is the **generative-foundation** sense: a large model trained on video that can synthesize interactive, navigable environments from a prompt. Genie 2 generates playable 3D worlds from a single image and keyboard actions. This is the current frontier and the sense that draws the most research attention.

## How it works

**The RL tradition.** Learn a compact dynamics model: given the current latent state and an action, predict the next latent state (and reward). This is latent-space prediction, using a [predictor](/concepts/predictor/) module. The model is narrow — optimized for planning in one domain — and doesn't need to reconstruct pixels, just enough to value actions.

**The generative-foundation shift.** Treat the world model as a pixel-level generative model trained on large video datasets. Each frame is conditioned on the action and the history of past frames, making the world interactive: the model must respond to inputs as they arrive rather than pre-rendering a fixed clip. Genie uses an autoregressive latent [diffusion](/concepts/diffusion-models/) model with a causal-masked transformer dynamics core — similar in spirit to an LLM generating tokens, but generating frames.

Key challenges at this scale: **emergent consistency** (keeping geometry coherent over minutes without an explicit 3D representation) and **counterfactual generation** (same start state + different actions = different futures, which is exactly what an agent needs for training).

**A third route.** [JEPA](/concepts/joint-embedding-predictive-architecture/)-style models predict future-state **representations** rather than pixels or actions — no decoder needed. This is the non-generative alternative LeCun advocates: predict what will happen in latent space, not what it will look like.

## Variants

There is no canonical world-model architecture: Genie is a [diffusion](/concepts/diffusion-models/) world model; Dreamer is [RNN](/concepts/recurrent-neural-networks/)/SSM-based; [JEPA](/concepts/joint-embedding-predictive-architecture/) is a latent-prediction route that avoids generation entirely. The objective varies accordingly: denoising, next-state regression, or joint-embedding prediction.

## Where you'll see it

Robotics simulation and synthetic data (NVIDIA Cosmos generating training scenarios for autonomous vehicles and robots), agent training environments (DeepMind running embodied agents inside generated worlds), and game research (Genie generating playable environments). The generative world model is also adjacent to video generation — the boundary with Sora-style models is increasingly blurry.

## Related concepts

- [diffusion models](/concepts/diffusion-models/) — the generative substrate of Genie and other pixel-level world models
- [recurrent-neural-networks](/concepts/recurrent-neural-networks/) — the dynamics core of Dreamer-style latent world models
- [joint-embedding-predictive-architecture](/concepts/joint-embedding-predictive-architecture/) — a non-generative alternative: predict future representations, not pixels
- [predictor](/concepts/predictor/) — the module a latent world model uses to forecast the next state
