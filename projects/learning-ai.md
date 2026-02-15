---
layout: default
title: Learning AI
date: 2026-02-15
---

# Learning AI

<p class="meta">Started: 2026-02-15</p>

## Project Overview: From Neurons to Data Centers

This project page documents my deep dive into Artificial Intelligence. Rather than only learning how to write code, I wanted to understand the entire ecosystem, from the mathematical theory of how a machine learns to the physical infrastructure required to run it at scale.

This write-up serves as both a study guide and a design document for a Medical Imaging AI (CNN) project focused on identifying dental health issues.

## File 1: AI (Theory and Infrastructure)

This document acts as the foundational textbook for the project. It focuses on the why and where of AI systems.

- **Core Concepts:** Breaks down the hierarchy of AI, Machine Learning, and Deep Learning, including how neural networks use weights, biases, and backpropagation to learn.
- **The Hardware (HPC):** Explains High-Performance Computing and how supercomputers, GPUs, and FPGAs physically process data.
- **Networking and Storage:** Covers the AI data center backbone, including InfiniBand, RDMA, and NVLink for high-throughput parallel processing.
- **Data Center Design:** Includes a theoretical pod design for powering a dental diagnostic AI, with network topology and hardware direction.

- Download Word file: [AI (Theory and Infrastructure)]({{ '/assets/docs/ai/AI.docx' | relative_url }})

## File 2: AI Cheat Sheet (Implementation)

This document is the practical how-to guide. It focuses on the code, math, and tuning needed to build usable models.

- **Building the Model:** Includes Python/Keras snippets for data pipelines, image preprocessing, and layer design.
- **Tuning the Brain:** Quick reference for hyperparameters like learning rate, batch size, and epochs.
- **Optimization:** Summarizes optimizers (for example Adam and SGD) and activation functions (for example ReLU) used to improve learning efficiency and accuracy.

- Download Word file: [AI Cheat Sheet (Implementation)]({{ '/assets/docs/ai/AI-Cheat-Sheet.docx' | relative_url }})

## Disclaimer

I am not an AI expert. This page and the attached files reflect my personal learning experience and journey.
