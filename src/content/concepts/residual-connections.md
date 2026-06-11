---
title: residual connections
tier: primitive
summary: Adds a layer's input back to its output — y = x + F(x) — giving gradients a direct highway through deep networks and making 100-layer stacks trainable.
sources:
  - label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
---

Before residual connections, networks deeper than about 20 layers were effectively untrainable — adding more layers made performance *worse*, not better. The problem was vanishing gradients: the chain of multiplications through backpropagation shrinks signals exponentially with depth until early layers receive no useful gradient at all. Residual connections, introduced by He et al. (2015) in the ResNet family for computer vision, solved this problem with a single addition: instead of `y = F(x)`, use `y = x + F(x)`.

## How it works

The skip connection adds the input back to the output. This has two critical effects.

**Gradient highway.** The gradient of `y = x + F(x)` with respect to x is `1 + ∂F/∂x`. The "1" means the gradient flows through the skip connection undiminished regardless of what the layer F does. Even when ∂F/∂x is near zero, the gradient is at least 1 — gradients always have a direct path from the loss to every layer.

**Identity as default.** When F(x) ≈ 0, the layer output is just the input unchanged. Each layer only needs to learn *what to add* to the existing representation, not a complete transformation from scratch. Starting from "do nothing" is much easier to optimize than learning a full mapping.

**In transformers**, every sub-layer — both [attention mechanisms](../attention-mechanisms/) and [feed-forward networks](../feed-forward-networks/) — is wrapped in a residual connection, paired with [layer normalization](../layer-normalization/):

```
output = x + Sublayer(LayerNorm(x))   # pre-norm, modern standard
```

This pre-norm variant applies normalization *before* the sub-layer so the residual path stays completely clean. Gradients pass through the addition unaffected by normalization.

**The residual stream.** A useful mental model from interpretability research: think of the token's representation as a vector flowing through a "stream." Each attention and feed-forward layer reads from the stream and *adds* its contribution back in. No layer replaces the stream — it only writes incremental updates. This framing helps explain why information from early layers persists all the way to the output.

## Where you'll see it

Residual connections appear in every modern deep architecture. In [encoders](../encoder/) and [decoders](../decoder/), every block has two residual-wrapped sub-layers. [Vision Transformers](../vision-transformer/) apply the same pattern over image patches. Diffusion architectures use them too, through the [diffusion transformer](../diffusion-transformer/) design.

## Related concepts

- [layer normalization](../layer-normalization/) — always paired with residual connections; together they make deep stacks trainable
- [attention mechanisms](../attention-mechanisms/) — one of the sub-layers wrapped in a residual connection
- [feed-forward networks](../feed-forward-networks/) — the other sub-layer, reading from and writing to the residual stream
- [encoder](../encoder/) — uses residual connections at every block
