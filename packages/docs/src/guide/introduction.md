# Introduction

## What is SCALE?

SCALE is an abbreviation for Simple Concatenated Aggregate Little-Endian, and it is a lightweight, efficient, binary serialization and deserialization codec. Originally it comes from [Substrate](https://docs.substrate.io/v3/advanced/scale-codec/). Besides from Substrate, it is generally useful if you need to efficiently communitate with Rust backend due to Codec's Enum support.

## Project Architecture

From low to high:

- Enum library. Rust Enum is not the most trivial thing to work with in TypeScript. This package provides a lightweight class to work with it. Enum codecs in core package built on top of it.
- Core library. It provides a set of functions designed to implement encoding & decoding of any SCALE-spec-compatible primitive or structure in the most efficient way. It is quite low-level and does not provide a lot of conveniences to work with large type namespaces from scratch, but it can be used to build such conveniences with.
- Definition libraries, compiler & its runtime. Helps to deal with large namespaces.

Firstly, let's overview how Enums does work.
