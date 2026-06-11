---
title: Mixture of Experts (MoE)
tier: modifier
summary: Swaps the dense feed-forward block for many routed "expert" MLPs — only a few fire per token, giving a larger model for the same inference cost.
sources:
  - label: "Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer (Shazeer et al., 2017)"
    url: "https://arxiv.org/abs/1701.06538"
  - label: "Switch Transformers: Scaling to Trillion Parameter Models (Fedus et al., 2021)"
    url: "https://arxiv.org/abs/2101.03961"
---

Mixture of Experts is a modifier on the transformer's [feed-forward network](../feed-forward-networks/) block, not a separate architecture family. A standard ("dense") transformer activates every parameter for every token. MoE replaces each dense feed-forward layer with several parallel expert sub-networks and a small router that picks which experts should process each token. The result: a model with the knowledge capacity of a very large network but the inference cost of a much smaller one, because most experts sit idle for any given token.

## How it works

Each MoE layer contains N expert feed-forward networks — identical in shape to the single FFN it replaces, but with independently learned weights. A [**router**](../expert-routing/) (typically a small linear layer) scores each expert for the current token. Only the top-k experts are activated; their outputs are weighted by the router scores and summed. All others contribute nothing.

In practice k=2 is most common: two experts fire per token regardless of N. Mixtral 8×7B illustrates the arithmetic — 8 experts per layer, top-2 routing, ~46.7B total parameters but only ~12.9B active per token, giving 70B-class knowledge at 13B-class inference cost.

The [attention mechanisms](../attention-mechanisms/) layers are **not** replaced — they remain dense and shared. MoE is purely a feed-forward modification.

The main engineering challenge is **load balancing**: if the router sends most tokens to the same few experts, underused experts atrophy and GPU utilization drops. Standard approaches add an auxiliary loss penalizing uneven routing.

## Where you'll see it

MoE is the dominant architecture for frontier [large language models](../large-language-models/): Mixtral, DeepSeek-V2/V3, Qwen-MoE, and Llama 4 all use it. The trend is toward more, finer-grained experts (DeepSeek uses 256 vs. Mixtral's 8). The trade-off is memory: all expert weights must reside in memory even though most are idle at inference time.

## Related concepts

- [feed-forward networks](../feed-forward-networks/) — the block MoE replaces
- [attention mechanisms](../attention-mechanisms/) — unchanged; MoE applies only to the feed-forward sublayer
- [large language models](../large-language-models/) — MoE is the dominant architecture at frontier scale
- [attention head sharing](../attention-head-sharing/) — a complementary modifier: GQA/MLA applies to the attention sublayer
