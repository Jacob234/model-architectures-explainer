---
title: layer normalization
tier: primitive
summary: Rescales each token's activations to zero mean and unit variance at every layer, keeping training stable as networks grow deep.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
---

Deep networks have a training problem: as activations flow through dozens of layers, their distributions shift in unpredictable ways. A layer that expects inputs centered near zero might receive values an order of magnitude larger, pushing activations into saturation or instability. Layer normalization fixes this by standardizing each token's representation at every layer — zero mean, unit variance — before passing it to the next operation.

## How it works

For each token at each layer, compute the mean and variance across all activation dimensions, then normalize:

```
LayerNorm(x) = γ ⊙ (x − μ) / √(σ² + ε) + β
```

The learned parameters γ (scale) and β (shift) let the network undo the normalization if that turns out to be optimal — so the model has the *option* of normalized representations, not the obligation. The small constant ε prevents division by zero.

**Why not batch normalization?** Batch norm normalizes across the *batch* dimension, which is natural for fixed-size images but breaks for sequences: lengths vary, batches can be small, and inference statistics may not match training. Layer norm normalizes across *features* for each example independently, making it the right choice for sequence models.

**RMSNorm — the modern simplification.** Root Mean Square Layer Normalization drops the mean-centering step entirely, normalizing only by the root mean square of the activations. It is faster to compute and empirically equivalent in quality. Llama, Mistral, DeepSeek, and most contemporary large language models use RMSNorm rather than full layer norm.

**Pre-norm vs post-norm.** The original transformer applied normalization *after* the residual addition (post-norm). Modern models apply it *before* the sub-layer (pre-norm): `output = x + Sublayer(LayerNorm(x))`. Pre-norm keeps the residual path clean, giving gradients an unobstructed highway through the network. Post-norm models struggle to train beyond about 12 layers; pre-norm models train stably at 100+ layers.

## Where you'll see it

Layer normalization appears at every sub-layer in every transformer block, always paired with [residual connections](../residual-connections/). [Encoders](../encoder/) and [decoders](../decoder/) both apply it around their attention and feed-forward sub-layers. [Vision Transformers](../vision-transformer/) apply the same pattern to image patches.

## Related concepts

- [residual connections](../residual-connections/) — always paired with layer norm; together they make deep stacks trainable
- [feed-forward networks](../feed-forward-networks/) — one of the two sub-layers layer norm wraps in each block
- [attention mechanisms](../attention-mechanisms/) — the other sub-layer layer norm wraps
