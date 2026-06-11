---
title: large language models (LLMs)
tier: family
kind: model-class
summary: A large model trained to predict the next token; the dominant form stacks decoder blocks at enormous scale (GPT, Claude, Llama). "LLM" is a category, not one architecture — the invariant is the autoregressive objective applied at scale.
---

Large language models are neural networks trained on massive text corpora to predict the next token in a sequence. That deceptively simple objective — given everything so far, what comes next? — turns out, at sufficient scale, to produce systems that can reason, write code, answer questions, and follow instructions. The technology behind ChatGPT, Claude, and Llama is the product of this one training signal applied to billions of parameters and trillions of tokens.

## How it works

The dominant form of LLM is a deep stack of [decoder](../decoder/) blocks, each containing [attention mechanisms](../attention-mechanisms/) and a [feed-forward network](../feed-forward-networks/). The decoder's causal masking means each position can only attend to tokens that came before it, enforcing the left-to-right prediction structure. [Positional encodings](../positional-encoding/) inject token-order information into the [embeddings](../embeddings/), and [residual connections](../residual-connections/) with [layer normalization](../layer-normalization/) keep the deep stack stable to train.

Training happens in stages. Pre-training on raw text (hundreds of billions to trillions of tokens) is where the model learns language, world knowledge, and reasoning patterns — at enormous compute cost. Fine-tuning and alignment (often via reinforcement learning from human feedback) then steer the model to be helpful and follow instructions, rather than just complete text.

## "LLM" is a category, not one architecture

This is the most common misconception. The dominant form is a decoder-only stack trained autoregressively, but that is not the only wiring. T5 and UL2 are LLMs built on an [encoder–decoder](../sequence-to-sequence-models/) backbone, with a masked span-denoising pretraining objective. Mamba, Jamba, and RWKV are LLMs whose backbone replaces attention with [state-space scans](../state-space-models/) — no transformer at all. What makes something an LLM is the autoregressive objective applied at scale, not the particular module stack underneath.

## Where you'll see it

Every major conversational AI product — GPT-4, Claude, Gemini, Llama — is built on this family. LLMs also serve as the language backbone of [vision-language models](../vision-language-models/), which pair a vision encoder with an LLM decoder to process images, and [vision-language-action models](../vision-language-action-model/), which extend that to robotics.

## Related concepts

- [decoder](../decoder/) — the generating module that LLMs are built from
- [attention mechanisms](../attention-mechanisms/) — the core operation enabling long-range context
- [embeddings](../embeddings/) — how tokens are represented as vectors inside the model
- [sequence-to-sequence models](../sequence-to-sequence-models/) — the encoder–decoder alternative, still used in some LLMs
- [state-space models](../state-space-models/) — the non-transformer backbone used in Mamba-class LLMs
- [mixture of experts](../mixture-of-experts/) — a common scaling strategy that routes tokens to specialized sub-networks
