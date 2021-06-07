# @scale-codec/codecs

### Why `JSBI` for numbers?

Because it can be easily migrated to the native BigInt in the future with babel plugin: https://github.com/GoogleChromeLabs/babel-plugin-transform-jsbi-to-bigint

### TODO

-   [ ] Unify encode-decode to `Encode<T>` and `Decode<T>` types (decodeBool, decodeBigInt)
