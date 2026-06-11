---
title: rectified flow
tier: family
kind: generative-framework
summary: Straighten the noise-to-data paths a flow model learns until sampling takes a handful of ODE steps — or just one. The flow-matching formulation behind Stable Diffusion 3.
sources:
  - label: "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow (Liu, Gong and Liu, 2022)"
    url: "https://arxiv.org/abs/2209.03003"
    type: paper
  - label: "Rectified Flow: An Introduction (Qiang Liu, UT Austin, 2022)"
    url: "https://www.cs.utexas.edu/~lqiang/rectflow/html/intro.html"
    type: blog
  - label: "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis (Esser et al., Stability AI, 2024)"
    url: "https://arxiv.org/abs/2403.03206"
    type: paper
---

[Flow matching](../flow-matching/) trains a velocity field that carries noise to
data along an ODE, and its appeal over [diffusion](../diffusion-models/) is that
straighter transport paths need fewer integration steps. Rectified flow takes that
logic to its conclusion: make straightness the explicit goal. A perfectly straight
trajectory can be integrated **exactly in a single Euler step** — no solver error,
no hundred-step sampling loop. The method's contribution is a procedure that
provably makes the learned paths straighter each time you apply it.

## How it works

**Start with linear pairings.** Draw a noise sample `x0` and a data sample `x1`
independently, connect them with the straight line `x_t = (1−t)·x0 + t·x1`, and
regress a velocity network onto the direction `x1 − x0` — the same simulation-free
objective as [flow matching](../flow-matching/) with linear paths.

**Why the learned flow still curves.** The individual training lines cross each
other (many random noise–data pairs pass through the same point), and an ODE's
trajectories cannot cross. At crossing points the model averages the conflicting
directions, so the *marginal* flow it learns bends even though every training
path was straight. Following it accurately still takes many small steps.

**Reflow — the rectification step.** Sample the trained model: integrate from a
noise sample `x0` to its output `x1'`. This produces a new coupling
`(x0 → x1')` that the flow itself generated — and these pairs, by construction,
no longer cross. Retrain the velocity field on straight lines between *these*
pairs. The result is a new flow with the same noise and data distributions at the
endpoints but visibly straighter transport; each repetition (1-rectified flow,
2-rectified flow, …) straightens further. A final distillation pass collapses
the nearly-straight flow into a one-step generator.

**Scaling it.** Stable Diffusion 3 pairs the rectified-flow objective with a
[diffusion transformer](../diffusion-transformer/) backbone and biases the
training-time sampling of `t` toward the middle of the trajectory (where the
velocity is hardest to learn) — the recipe that took rectified flow from paper
to production text-to-image.

## Relation to flow matching

The two papers appeared independently within weeks of each other, and the base
training objective is the same conditional regression. What rectified flow adds
is the **coupling perspective**: the insight that *which* `(x0, x1)` pairs you
draw lines between determines how straight the marginal flow can be, plus the
reflow algorithm for improving those couplings using the model itself. In
practice "rectified flow" usually names the linear-path objective (as in SD3),
with reflow reserved for few-step and one-step variants.

## Where you'll see it

Stable Diffusion 3 made rectified flow the highest-profile generative objective
in image synthesis, and Flux continues the lineage. Reflow-style straightening
and its descendants power the one- and few-step samplers that make near-realtime
image generation possible.

## Related concepts

- [flow matching](../flow-matching/) — the parent framework; rectified flow is its straightness-first formulation
- [diffusion models](../diffusion-models/) — the stepwise-denoising alternative this family undercuts at sampling time
- [diffusion transformer](../diffusion-transformer/) — the backbone rectified flow drives in SD3 and Flux
