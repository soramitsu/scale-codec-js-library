# To Do

Here are some ideas how to improve the library and "Developer eXpririence" related to its usage.

-   Make encode/decode debugging easier - more descriptive errors? Something like that:
    ```
    Failed to decode Str (field "name") input="00 91": Invalid UTF-8 Sequence
      at Character (vec item) input="55 c3 6f ff 00 91"
      at VecCharacter input="40 55 c3 6f ff 00 91"
    ```
-   Use native `number` for integers with bits less than 64. Also maybe drop Big-Endian support? It is completely unused + it is easy to replace it with just `leToBe` helper which reverses bytes sequence.
