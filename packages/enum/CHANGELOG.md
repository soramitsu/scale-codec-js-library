# @scale-codec/enum

## 1.0.2

### Patch Changes

-   1f92e19: **types**: extend `Enum.variant()` typing

## 1.0.1

### Patch Changes

-   eeeb481: **fix**: fix typing for `.as()` return value

## 1.0.0

### Major Changes

-   **feat**: **BREAKING** `Enum` now uses new definitions approach.

    For example, instead of:

    ```ts
    type OptNum = Enum<{
        None: null
        Some: { value: number }
    }>
    ```

    it should be:

    ```ts
    type OptNum = Enum<'None' | ['Some', number]>
    ```

    This definition way is much more easier for TypeScript to handle, and it allows to avoid some constraints and auto-inference problems

-   **feat**: **BREAKING** `empty()` and `valuable()` static methods are replaced with a single `variant()` creation factory. It is type-safe and easy to use thanks to the new definitions approach.

    For example, instead of:

    ```ts
    type OptNum = Option<number>

    const opt1: OptNum = Enum.empty('None')
    const opt2: OptNum = Enum.valuable('Some', 42)
    ```

    it should be:

    ```ts
    const opt3: OptNum = Enum.variant('None')
    const opt4: OptNum = Enum.variant('Some', 42)
    ```

## 0.2.2

### Patch Changes

-   b4c91cf: **feat**: better error messages when use `.as(tag)`

## 0.2.1

### Patch Changes

-   27b7927: Add build status badge to the README

## 0.2.0

### Minor Changes

-   c78d861: **Breaking changes**:

    -   drop `create()` static method, add `valuable()` and `empty()` instead
    -   update internal fields which are used by other packages

### Patch Changes

-   26c9dd0: Update readme and `homepage` at `package.json`
-   334a28d: Add keywords to package.json

## 0.1.1

### Patch Changes

-   b79934e: Add more inline documentation
