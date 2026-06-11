---
title: graph neural networks (GNNs)
tier: family
kind: backbone
summary: Neural networks that operate on graph-structured data by passing messages between connected nodes. The objective varies — node classification, link prediction, or graph classification — making GNNs a backbone, not a single model.
sources:
  - label: "Semi-Supervised Classification with Graph Convolutional Networks (Kipf & Welling, 2017)"
    url: "https://arxiv.org/abs/1609.02907"
    type: paper
  - label: "A Gentle Introduction to Graph Neural Networks (Distill, 2021)"
    url: "https://distill.pub/2021/gnn-intro/"
    type: explainer
  - label: "Understanding Convolutions on Graphs (Distill, 2021)"
    url: "https://distill.pub/2021/understanding-gnns/"
    type: explainer
---

Standard neural networks expect fixed-size vectors or grids. Graphs break both assumptions: a molecule has a variable number of atoms, a social network has a variable number of friends, and both have explicit topology — who is connected to whom. Graph neural networks (GNNs) learn directly from that topology alongside node and edge features, making them the natural choice for chemistry, recommendation systems, knowledge-base reasoning, and any domain where relationships are first-class data.

## How it works

Most GNNs follow the **message-passing** paradigm. In each layer, every node does three things: (1) collects messages from its immediate neighbors, (2) aggregates them — typically by sum, mean, or max — and (3) updates its own representation by combining the aggregated message with its current state via a small MLP (a [feed-forward network](../feed-forward-networks/)). Each node starts as an [embedding](../embeddings/) of its raw features; after *k* layers of message passing, it encodes information from its *k*-hop neighborhood.

Key architectures differ mainly in how they aggregate:

- **GCN** (Graph Convolutional Network) — aggregates using a normalized adjacency matrix. Connects to spectral graph theory: the operation filters signals on the graph's Laplacian.
- **GAT** (Graph Attention Network) — weighs neighbors with learned [attention scores](../attention-mechanisms/) instead of treating all neighbors equally.
- **GraphSAGE** — samples a fixed number of neighbors rather than using all of them, enabling inductive generalization to unseen nodes.
- **GIN** (Graph Isomorphism Network) — designed to match the theoretical expressiveness of the Weisfeiler-Lehman graph isomorphism test.

Node embeddings can be pooled to produce graph-level representations for classifying whole graphs (for example, predicting molecular properties).

## Variants and limits

A known weakness is **over-smoothing**: stack too many layers and every node's representation converges toward the same vector, because each layer widens the neighborhood until every node has seen the entire graph. In practice, GNNs are capped at 2–5 layers, unlike [CNNs](../convolutional-neural-networks/) or transformers that benefit from much greater depth.

Graph transformers blur the line between GNNs and attention: rather than restricting messages to graph neighbors, they apply self-attention across all nodes — sacrificing inductive bias for expressiveness.

## Where you'll see it

Drug discovery (predicting molecular properties and protein interactions), recommendation engines (social and item graphs), traffic and route prediction, and knowledge-graph link prediction are the dominant applications. Any time the data is naturally a set of entities with typed relationships, a GNN is the first architecture to consider.

## Related concepts

- [feed-forward networks](../feed-forward-networks/) — the MLP inside each message-passing update
- [embeddings](../embeddings/) — the per-node vectors GNNs learn and transform
- [attention mechanisms](../attention-mechanisms/) — GAT applies attention to graph neighborhoods; graph transformers extend this further
- [convolutional neural networks](../convolutional-neural-networks/) — CNNs convolve over grids; GNNs generalize convolution to arbitrary topology
