---
title: output head
tier: module
summary: The final projection from hidden vectors to actual predictions — logits over a vocabulary, class scores, values, or actions.
---

The output head is the last step in any neural network: the layer that converts the model's final hidden-state vector into something the outside world can use. In a language model that means a probability distribution over the next token; in an image classifier it means class scores; in a reinforcement-learning agent it means a value estimate and an action distribution. The head is the bridge between abstract internal representation and concrete, task-specific output.

## How it works

In a transformer language model, after the final [layer normalization](/concepts/layer-normalization/), the hidden vector is multiplied by an unembedding matrix to produce one logit per vocabulary entry, and a softmax converts those logits into a next-token distribution. This is the mirror image of the input [embeddings](/concepts/embeddings/) layer: where embeddings map tokens into vectors, the output head maps a vector back into a distribution over tokens.

A common optimization is **weight tying** — sharing the unembedding matrix with the transposed input embedding matrix. This saves a large block of parameters and reflects the natural symmetry between reading and predicting tokens.

The pattern generalizes widely. A [BERT](/concepts/bert/)-style [encoder](/concepts/encoder/) attaches a classification head to its `[CLS]` representation. An actor-critic agent runs parallel value and policy heads from a shared trunk. A reward model for RLHF adds a scalar head to a language model backbone. In each case, freezing the backbone and swapping heads is the standard fine-tuning recipe.

## Where you'll see it

Every [large language model](/concepts/large-language-models/) culminates in an output head over its vocabulary. [Vision Transformers](/concepts/vision-transformer/) use a classification head on the patch-sequence representation. The output head is also an interpretability handle: the "logit lens" reads intermediate hidden states through the unembedding to see what the model is already predicting at each layer.

## Related concepts

- [embeddings](/concepts/embeddings/) — the input mirror of the output head
- [decoder](/concepts/decoder/) — the stack the LM head sits on top of
- [encoder](/concepts/encoder/) — classification heads attach to encoder representations
- [large language models](/concepts/large-language-models/) — the LM head produces the next-token distribution
- [predictor](/concepts/predictor/) — the contrasting module: predicts representations, not outputs
