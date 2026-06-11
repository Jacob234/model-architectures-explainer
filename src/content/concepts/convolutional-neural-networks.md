---
title: convolutional neural networks (CNNs)
tier: family
kind: backbone
summary: Stacks of sliding learned filters that detect local patterns and compose them into global understanding — the vision default before ViT (ResNet, EfficientNet). The training objective is not fixed; the same backbone is used for supervised, self-supervised, and contrastive learning.
---

A convolutional neural network is a neural network that processes spatial data — images, audio, any input with local structure — using a sliding learned filter rather than treating every input position independently. This is both a primitive operation and a full architectural family built on top of it.

## The convolution primitive

The core operation is simple: a small filter (kernel), typically 3×3 pixels, slides across the input. At each position, it computes a dot product between its weights and the local patch, producing one number. Sweep the filter across the full image and you get a feature map — a new image where each pixel encodes how strongly that filter's pattern appeared at that location.

Three properties make this powerful. **Parameter sharing**: the same filter is applied everywhere, so a 3×3 filter has only 9 learned weights regardless of image size. The network is forced to learn features that are useful anywhere in the image, not just at fixed positions. **Local receptive field**: each neuron only sees a small neighborhood, exploiting the spatial locality of natural images (nearby pixels are more often related than distant ones). **Composability**: stack multiple layers and each layer sees combinations of the patterns below it — edges compose into textures, textures into parts, parts into objects.

A single convolutional layer applies many filters in parallel (32, 64, 128 channels), each learning a different feature. The output is a volume: channels × height × width. Pooling operations (typically max pooling over 2×2 regions) downsample the spatial dimensions between layers, reducing computation and building in some translation invariance.

## The CNN family

The CNN architecture emerged from this primitive stacked into deep networks, with each generation of landmark models solving a specific training problem:

**LeNet (1998)** was the proof of concept — convolutional layers for digit recognition. **AlexNet (2012)** scaled to ImageNet and won by a large margin, launching the deep learning era; it established ReLU activations and GPU training as standard. **ResNet (2015)** solved the depth problem: very deep networks degraded in practice because gradients vanished during backpropagation. ResNet added [residual connections](../residual-connections/) — skip connections that add a layer's input directly to its output — letting gradients flow through hundreds of layers. Residual connections became foundational to the entire field, including transformers. **EfficientNet (2019)** introduced principled compound scaling of width, depth, and resolution together, achieving better accuracy at lower compute than prior manual designs.

## The objective is not fixed

Like the [Vision Transformer](../vision-transformer/), a CNN is a backbone — the training objective is separate from the architecture. ResNet can be trained for supervised image classification, for contrastive self-supervised learning (SimCLR), or as the visual encoder in a generative model. CNNs also remain the standard denoiser backbone (U-Net) inside diffusion models, where the generative objective is entirely different from classification.

CNNs have strong built-in inductive biases — locality and translation invariance — that make them data-efficient. ViT lacks these priors and requires large-scale pretraining to match CNN performance. Many modern architectures are hybrids that combine convolutional feature extraction with transformer attention.

## Related concepts

- [vision-transformer](../vision-transformer/) — the attention-based challenger; stronger at scale, weaker on small datasets
- [residual-connections](../residual-connections/) — originated in ResNet; now standard across deep learning
- [diffusion-models](../diffusion-models/) — the U-Net denoiser at their core is a convolutional architecture
- [embeddings](../embeddings/) — CNN feature maps are spatial embeddings; the final pooled vector is a global image embedding
