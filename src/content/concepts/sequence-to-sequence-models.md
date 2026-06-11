---
title: encoder–decoder (seq2seq)
tier: family
kind: architecture
summary: An encoder reads the source sequence; a decoder generates the target while cross-attending to it — the original Transformer wiring for translation, summarization, and T5/BART. Decoding is autoregressive, but pretraining objectives vary.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
    type: paper
  - label: "Sequence to Sequence Learning with Neural Networks (Sutskever et al., 2014)"
    url: "https://arxiv.org/abs/1409.3215"
    type: paper
  - label: "Neural Machine Translation by Jointly Learning to Align and Translate (Bahdanau et al., 2014)"
    url: "https://arxiv.org/abs/1409.0473"
    type: paper
  - label: "Visualizing a Neural Machine Translation Model (Jay Alammar, 2018)"
    url: "https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/"
    type: explainer
---

An encoder–decoder (or seq2seq) model splits the work of reading and writing between two separate networks. The [encoder](../encoder/) processes the full input at once and produces a contextual representation. The [decoder](../decoder/) then generates the output one token at a time, attending to the encoder's representation at every step via cross-attention. This architecture handles variable-length inputs and outputs naturally — a 5-word source sentence can produce a 12-word translation — and it was the design that drove machine translation, summarization, and dialogue from the mid-2010s onward.

## How it works

In the transformer form, the encoder is a standard bidirectional stack: every input token attends to every other, producing rich contextualized representations. The decoder runs autoregressively — each new token attends only to previously generated tokens (causal masking), plus it runs a cross-attention layer over the encoder output at each step. That cross-attention is the bridge: it lets the decoder ask "which parts of the source are relevant to what I'm generating right now?" at every position.

The training objective is not fixed and varies by use case. Translation systems are typically trained with next-token prediction on target sentences directly (standard autoregressive loss). T5 and BART use span-denoising instead: corrupt the input by masking spans, then train the decoder to reconstruct those spans. The same architecture supports both, which is what makes encoder–decoder models versatile.

## Why the explicit split matters

Decoder-only [large language models](../large-language-models/) dropped the encoder entirely — they process prompt and response as a single autoregressive sequence. This simplification works at scale because a large enough decoder stack can implicitly encode an input while also generating an output. But the encoder–decoder wiring is not obsolete: it remains the natural fit for translation-style tasks, produces stronger cross-lingual representations, and is easier to condition on structured inputs (code, tables) through the cross-attention interface.

## Where you'll see it

T5 and BART are the dominant pretrained encoder–decoder models; Flan-T5 and mT5 are multilingual extensions. The architecture also appears in speech (Whisper uses it to map audio encoder states to text decoder outputs) and in multimodal systems where an image or audio encoder feeds a text decoder through cross-attention.

## Related concepts

- [encoder](../encoder/) — the reading half; processes source input bidirectionally
- [decoder](../decoder/) — the generating half; autoregressive, cross-attends to encoder output
- [attention mechanisms](../attention-mechanisms/) — cross-attention is the glue between the two halves
- [large language models](../large-language-models/) — the decoder-only simplification of this architecture
- [recurrent neural networks](../recurrent-neural-networks/) — the original seq2seq implementation before transformers
- [bert](../bert/) — the encoder-only endpoint: drop the decoder entirely
