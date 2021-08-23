## how to

Schema -> scan each definition -> do something with result

if it is errored, return all errors
if there are no errors, then compile each type in its own context, which will collect refs and tools and will generate imports based on it. Then imports and code will be merge into a single code and that's it, module is done.
Then flat modules tree will be composed into a nested modules tree. And this is the final result. Also there should be a special actor that will create `index.ts` files for each dir.
