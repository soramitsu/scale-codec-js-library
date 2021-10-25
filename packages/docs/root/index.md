# About

Here is the documentation for packages that implement SCALE codec in JavaScript.

More about SCALE itself: [Substrate SCALE Codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec).

## Preamble

All packages from this docs are available at NPM Registry. You can install them with your favorite package manager, e.g.:

```shell
pnpm add @scale-codec/core
```

Current list of packages:

<ul>
    <li
        v-for="i in ['core', 'enum', 'definition-runtime', 'definition-compiler', 'util']"
        :key="i"
    >
        <code>@scale-codec/{{ i }}</code>
    </li>
</ul>
