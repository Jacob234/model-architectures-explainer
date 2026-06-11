---
title: flow matching
tier: family
kind: generative-framework
summary: A generative training objective that learns a velocity field transporting noise to data along straight paths — fewer sampling steps than diffusion, same backbone architectures (SD3, Flux).
sources:
  - label: "Flow Matching for Generative Modeling (Lipman et al., 2022)"
    url: "https://arxiv.org/abs/2210.02747"
    type: paper
  - label: "An Introduction to Flow Matching (Fjelde, Mathieu and Dutordoir, Cambridge MLG, 2024)"
    url: "https://mlg.eng.cam.ac.uk/blog/2024/01/20/flow-matching.html"
    type: blog
  - label: "Diffusion Meets Flow Matching: Two Sides of the Same Coin (Google DeepMind, 2024)"
    url: "https://diffusionflow.github.io/"
    type: blog
  - label: "Flow Matching Guide and Code (Lipman et al., 2024)"
    url: "https://arxiv.org/abs/2412.06264"
    type: paper
---

[Diffusion models](../diffusion-models/) generate images by reversing a noising process across hundreds of small steps. Flow matching is a closely related — and in many formulations more general — alternative: instead of learning to denoise step by step, it trains a network to regress the **velocity field** that, if you follow it as an ordinary differential equation, carries a noise sample directly to a data sample. Because the learned paths are straighter, accurate samples typically need far fewer integration steps at generation time.

Flow matching is the training objective behind Stable Diffusion 3 and Flux, where it is paired with a [diffusion transformer](../diffusion-transformer/) as the backbone network.

## How it works

**The probability path.** Define an interpolation between a noise sample `x0` and a data sample `x1`. The simplest choice is a straight line: `x_t = (1−t)·x0 + t·x1` for `t` between 0 and 1. This defines a family of distributions morphing from noise to data, and a corresponding velocity field — the instantaneous direction and speed that transports probability mass along the path.

**The objective.** Train a network `v(x, t)` to match that velocity. For the straight-line path the target is simply `x1 − x0`, a constant for each pair — so training is a plain regression onto known per-sample vectors. Crucially, this regression is **simulation-free**: you never have to integrate the ODE during training. This is the *conditional flow matching* trick — conditioning on a specific `(x0, x1)` pair makes the otherwise-intractable marginal velocity tractable to regress.

**Sampling.** At generation time, draw `x0` from noise and integrate the learned velocity field from `t = 0` to `t = 1` using a standard ODE solver (Euler, Heun, etc.). Straight paths mean fewer steps are needed for accurate results.

**[Rectified flow](../rectified-flow/).** A flow-matching variant that explicitly pushes transport paths to be as straight as possible. Straight enough paths can be integrated in a single step, underpinning fast one-step samplers. SD3 and Flux use this formulation.

## Relation to diffusion

Diffusion's score-based reverse process has an equivalent deterministic probability-flow ODE. Flow matching can be understood as directly learning that ODE's velocity field, sidestepping the noise-schedule machinery. The two paradigms share backbone architectures — U-Net or [DiT](../diffusion-transformer/) — and differ in how they define the training target.

## Where you'll see it

Flow matching is the loss function behind the current frontier of image and video generation models. Stable Diffusion 3 and Flux are the highest-profile deployments. Expect it to displace vanilla diffusion training in most new generative pipelines, given its sampling efficiency.

## Related concepts

- [diffusion models](../diffusion-models/) — the closest relative; flow matching reframes diffusion's noise→data transport as a learned velocity field
- [diffusion transformer](../diffusion-transformer/) — the network architecture flow matching is typically paired with
