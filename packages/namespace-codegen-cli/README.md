# @scale-codec/namespace-codegen-cli

**Not used anymore!**

CLI for `@scale-codec/namespace-codegen`.

### Install

```sh
npm i --save-dev @scale-codec/namespace-codegen-cli
```

### Usage (after installation)

```
$ npx generate-scale-namespace --help
generate-scale-namespace/0.1.0

Usage:
  $ generate-scale-namespace

Commands:
    Generate namespace from definition

For more info, run any command with the `--help` flag:
  $ generate-scale-namespace --help

Options:
  -i, --input <file>                   [string] Path to input file with namespace definition. Allowed types: .json, .(c|m)?js, .ts
  -o, --output <file>                  [string] Path to the output TypeScript file
  -f, --force                          [boolean] Force overwrite output path if it exists
  --genNamespaceType <identificator>   [string] Name of generated namespace type
  --genNamespaceValue <identificator>  [string] Name of generated namespace value
  --genImportFrom [packageName]        [string] Library that contains namespace implementation (default: @scale-codec/namespace)
  --genCamel                           [boolean] Use 'camelCase' for struct fields or not
  -h, --help                           Display this message
  -v, --version                        Display version number
```

### TODO

- Maybe use another CLI helper that works fine with required arguments.
