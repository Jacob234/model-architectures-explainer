---
title: vision-language-action models (VLAs)
tier: family
kind: model-class
summary: A VLM extended for robotics — the model sees the scene, reads the instruction, and emits motor actions as tokens, inheriting web-scale knowledge without changing the architecture (RT-2, π0).
---

A vision-language-action model (VLA) is a [vision-language model](/concepts/vision-language-models/) with one additional output modality: **robot actions**. The core bet, introduced by RT-2 (DeepMind, 2023), is that a robot policy should inherit the web-scale knowledge of a VLM rather than learn the world from scratch on scarce robot data. By discretizing motor commands — end-effector deltas, gripper state, a terminate flag — and serializing them as tokens, you can fine-tune an internet-pretrained VLM on robot demonstrations without changing its architecture. The robot policy is literally the same model that does visual question answering.

This makes VLAs the dominant paradigm for general-purpose robot learning as of 2025, underlying systems from RT-2 through RT-X, Gemini Robotics, and Physical Intelligence's π0.

## How it works

**Actions as tokens.** Robot actions are discretized into a small vocabulary and appended to the output token stream. The VLM's [encoder](/concepts/encoder/) processes the camera image; the [decoder](/concepts/decoder/) generates text and action tokens interleaved. Nothing in the architecture changes — the tokenizer is extended to include action bins.

**What that buys.** Because the action model is a web-pretrained VLM, it inherits semantic and visual generalization. RT-2 demonstrated emergent capabilities never present in robot data: "pick up the bag about to fall off the table," multi-step reasoning from natural language, even arithmetic used to select objects. It nearly doubled generalization on novel objects and backgrounds over its robot-only predecessor.

**Scaling the substrate.** A VLA's ceiling is set by its base VLM — better web-scale understanding leads to better robot generalization. This couples robot progress to LLM scaling, which is why every frontier-grade VLA in 2025 sits on a flagship foundation model rather than a bespoke robotics network.

**Chain-of-thought actions.** RT-2 and later systems added an explicit reasoning trace — a "Plan" step in natural language — before emitting motor actions, enabling visually grounded multi-step planning that pure language planners cannot do.

## Variants and lineage

- **RT-1 (2022)** — a transformer trained on multi-task robot demonstrations; learned task/object combinations but didn't generalize beyond robot data.
- **RT-2 (2023)** — the VLA leap: VLM backbone + actions-as-tokens → web-scale generalization.
- **RT-X / Open X-Embodiment (2023)** — co-training across 22 robot types from 33 labs; cross-embodiment transfer boosted performance ~50%.
- **π0 (Physical Intelligence)** — a VLA for dexterous manipulation, co-trained on diverse robot hardware.

## Where you'll see it

Dexterous manipulation, household robotics, and industrial automation are the primary targets. The field is in a rapid buildout phase: the limiting factor has shifted from architecture to high-quality robot demonstration data.

## Related concepts

- [vision-language-models](/concepts/vision-language-models/) — the base architecture VLAs extend
- [encoder](/concepts/encoder/) — processes camera images in the visual tower
- [decoder](/concepts/decoder/) — generates interleaved language and action tokens
- [large-language-models](/concepts/large-language-models/) — the backbone whose web-scale knowledge VLAs inherit
