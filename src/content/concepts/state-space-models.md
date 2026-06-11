---
title: state space models (SSM/Mamba)
tier: family
kind: backbone
summary: Replaces attention with a selective state-space scan — recurrent memory you can train in parallel, sub-quadratic in sequence length. Mostly used autoregressively (Mamba, S4). The objective is not fixed.
sources:
  - label: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces (Gu & Dao, 2023)"
    url: "https://arxiv.org/abs/2312.00752"
    type: paper
  - label: "Efficiently Modeling Long Sequences with Structured State Spaces (Gu, Goel & Re, 2021)"
    url: "https://arxiv.org/abs/2111.00396"
    type: paper
  - label: "The Annotated S4 (Rush & Karamcheti, 2022)"
    url: "https://srush.github.io/annotated-s4/"
    type: explainer
  - label: "A Visual Guide to Mamba and State Space Models (Maarten Grootendorst, 2024)"
    url: "https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mamba-and-state"
    type: explainer
---

State space models bring a tool from classical control theory — the linear
dynamical system — into deep learning as a sequence-modeling primitive. Where
[attention mechanisms](../attention-mechanisms/) compute pairwise
relationships between every pair of positions (quadratic cost in sequence
length), an SSM maintains a fixed-size hidden state updated as each token
arrives, keeping processing linear in sequence length. The family was revived
for deep learning around 2020–2022 and reached its current prominence with
Mamba (2023), which made SSMs genuinely competitive with transformers at
language-model scale.

## The state-space scan primitive

The core abstraction is a linear dynamical system discretized to operate on
token sequences:

```
h'(t) = A·h(t) + B·x(t)    (state evolution)
y(t)  = C·h(t) + D·x(t)    (output)
```

This computation can be run as a **recurrence** (one token at a time — fast for
inference, constant memory) or a **convolution** (parallel across the sequence —
fast for training). The duality gives SSMs "linear inference, parallel training."

The original formulation is **time-invariant**: dynamics don't change based on
input content. S4 (2022) showed that carefully parameterizing the A matrix —
using structure from polynomial approximation theory — lets SSMs match
transformers on long-range benchmarks. But time-invariance limits in-context
flexibility: the model can't decide what to remember based on what it's reading.

## The Mamba family (selective SSMs)

Mamba (Gu & Dao, 2023) solved this by making SSM parameters **input-dependent**:
the B and C matrices and discretization step Δ are functions of the current
input, so the model can selectively retain or discard information based on
content — a form of learned [gating](../expert-routing/). A
hardware-aware parallel scan avoids materializing the full state in GPU memory,
achieving 3–5× faster inference than equivalently-sized transformers.
Mamba-2 (2024) showed selective state spaces are mathematically equivalent to
a form of structured attention, unifying the two perspectives.

**Hybrid architectures** interleave Mamba layers with transformer
[attention](../attention-mechanisms/) layers: SSM layers handle long-range
context efficiently; attention layers handle precise token retrieval. This hybrid
pattern is becoming the practical standard for models needing both efficiency
and capability.

## Where you'll see it

SSMs are a **backbone** — the training objective is not fixed. In practice:

- **Autoregressive language modeling** — Mamba and hybrid Mamba-Transformer
  models are the main SSM-based [LLM](../large-language-models/) line.
- **Long-context tasks** — SSMs maintain constant memory per inference step
  where transformer KV caches grow linearly.
- **Scientific sequences** — genomics models (HyenaDNA, Evo) use SSM
  architectures for single-nucleotide-resolution DNA modeling.

## Related concepts

- [attention-mechanisms](../attention-mechanisms/) — the operation SSMs replace; Mamba-2 shows the two are mathematically related
- [recurrent-neural-networks](../recurrent-neural-networks/) — SSMs are RNNs with structured dynamics chosen for trainability and parallelism
- [expert-routing](../expert-routing/) — Mamba's input-dependent selectivity is a form of learned gating
- [large-language-models](../large-language-models/) — Mamba-based hybrids are the SSM LLM line
- [world-models](../world-models/) — hybrid Mamba-Transformer backbones appear in video-length world model training
