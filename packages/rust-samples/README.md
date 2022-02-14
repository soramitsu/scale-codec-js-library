# rust-samples

Tiny crate that generates different integers (with different bit-length, signed/unsigned) and their Little-Endian and Big-Endian bytes representation. Used for tests in `@scale-codec/core`.

Generated data located at `output.json`.

**upd**: also compacts here.

### Regenerate data

```sh
cargo run -- ints > output-ints.json
cargo run -- compacts > output-compacts.json
```
