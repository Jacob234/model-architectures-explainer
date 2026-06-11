---
title: embeddings
tier: primitive
summary: Dense vectors that represent discrete tokens (words, image patches, users) as points in a continuous space, where geometric closeness reflects semantic similarity.
sources:
  - label: "Efficient Estimation of Word Representations in Vector Space (Mikolov et al., 2013)"
    url: "https://arxiv.org/abs/1301.3781"
    type: paper
  - label: "The Illustrated Word2vec (Jay Alammar, 2019)"
    url: "https://jalammar.github.io/illustrated-word2vec/"
    type: blog
  - label: "Learning Word Embedding (Lilian Weng, 2017)"
    url: "https://lilianweng.github.io/posts/2017-10-15-word-embedding/"
    type: blog
---

Neural networks can only compute with numbers, but the world is full of discrete things — words, tokens, image patches, user IDs. Embeddings are the bridge: a learned mapping from each discrete item to a point in a high-dimensional vector space. The central insight is that similar things end up close together, so the geometry of the space reflects meaning. "Dog" lands near "cat" and far from "democracy."

## How it works

The simplest embedding layer is a lookup table: a matrix of shape (vocabulary size × embedding dimension). Each token ID indexes a row, and that row is the token's vector. These vectors are not hand-crafted — they are learned parameters, adjusted by gradient descent alongside everything else in the network.

**Static vs contextual embeddings.** Early systems like Word2Vec (2013) learned one fixed vector per word from co-occurrence statistics. This works well but breaks on polysemy: "bank" (financial) and "bank" (river) share one vector, blending both senses. Contextual embeddings, introduced with transformer-based models, give each token a *different* vector depending on its surrounding context. The same word in different sentences produces different representations, capturing the actual meaning in use.

**Multimodal embeddings.** The same idea extends beyond text. [CLIP](../clip/) trains a text encoder and an image encoder so that a photo of a dog and the phrase "a dog" end up at nearly the same point in shared space. This makes it possible to search images with text queries and vice versa.

**Similarity.** Once items are embedded, distance becomes a proxy for relatedness. Cosine similarity (the angle between vectors) is the standard metric. Semantic search works by embedding a query and retrieving stored vectors that land nearby.

## Where you'll see it

Embeddings are the entry point into nearly every neural network. In transformers, the first operation is always converting token IDs to vectors via an embedding lookup. Those vectors are then passed through stacked [attention mechanisms](../attention-mechanisms/) and [feed-forward networks](../feed-forward-networks/), which progressively refine them into rich contextual representations.

[Positional encoding](../positional-encoding/) is added on top of token embeddings before the first attention layer to inject order information. [Encoders](../encoder/) produce embeddings of entire sequences; [autoencoders](../autoencoders/) and [variational autoencoders](../variational-autoencoders/) learn compressed latent embeddings of images.

## Related concepts

- [attention mechanisms](../attention-mechanisms/) — refines token embeddings layer by layer
- [positional encoding](../positional-encoding/) — added to token embeddings to inject position
- [clip](../clip/) — trains shared text and image embeddings
- [autoencoders](../autoencoders/) — learn compressed latent representations
