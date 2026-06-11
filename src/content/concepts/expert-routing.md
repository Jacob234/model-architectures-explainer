---
title: expert routing
tier: primitive
summary: Learned switches that decide what flows where — the gates controlling information inside an LSTM cell, and the router picking which experts process each token in a mixture-of-experts model.
---

"Routing" and "gating" are two flavors of the same idea: a learned function decides what information flows forward and what gets suppressed. In recurrent networks, gates control what a cell remembers or forgets from step to step. In [mixture-of-experts](/concepts/mixture-of-experts/) models, a router sends each token to a small subset of specialized sub-networks. Both are mechanisms for selective, conditional computation.

## How it works

**LSTM-style gating.** Long Short-Term Memory networks introduced gating to solve the vanishing gradient problem in [recurrent neural networks](/concepts/recurrent-neural-networks/). Each cell has three gates — input, forget, and output — each a sigmoid function of the current input and previous hidden state. Sigmoid outputs range from 0 to 1, so multiplying the cell state by the forget gate's output decides how much of the previous memory survives. The gates themselves are learned parameters; the network figures out when to remember and when to discard.

**MoE expert routing.** In [mixture-of-experts](/concepts/mixture-of-experts/) models, each transformer block contains many parallel [feed-forward networks](/concepts/feed-forward-networks/) (the experts) plus a small router. The router is typically a single linear projection from the token's hidden representation to a score over all N experts:

```
scores = x · W_g      (a vector of length N)
weights = Softmax(TopK(scores, k))
```

TopK zeros out all but the k highest scores before softmax, producing a sparse probability distribution. Each selected expert receives a weight and computes its output; unselected experts do nothing. The final output is a weighted sum of the selected experts' outputs.

**Choosing k.** With k=1 (Switch Transformer), each token goes to exactly one expert — maximum sparsity and simplest routing. k=2 is the classic choice, giving each token two experts and smoother gradients. Recent models like DeepSeek-V2/V3 use many small experts (160+) with k=6–8; each expert is narrower, but finer-grained specialization compensates.

**Load balancing.** A router left unconstrained will collapse — it learns to always use a few popular experts and starve the rest. A small auxiliary loss during training penalizes unequal expert utilization, pushing the router to distribute tokens more evenly. At inference the auxiliary loss is removed; only the routing weights matter.

**What experts learn.** Trained MoE models develop measurable but fuzzy specialization: some experts handle syntactic patterns, others handle semantic content. Early layers route more uniformly; deeper layers route more selectively.

## Where you'll see it

Gating is foundational to [recurrent neural networks](/concepts/recurrent-neural-networks/). Expert routing is the mechanism that makes [mixture-of-experts](/concepts/mixture-of-experts/) models like Mixtral and DeepSeek computationally tractable at scale — multiplying parameter count while keeping per-token compute roughly constant. [Large language models](/concepts/large-language-models/) increasingly use MoE variants for efficiency at frontier scale.

## Related concepts

- [mixture of experts](/concepts/mixture-of-experts/) — the architecture that expert routing enables
- [feed-forward networks](/concepts/feed-forward-networks/) — the sub-networks that serve as the individual experts
- [recurrent neural networks](/concepts/recurrent-neural-networks/) — where LSTM-style gating originated
- [large language models](/concepts/large-language-models/) — the primary deployment context for MoE routing today
