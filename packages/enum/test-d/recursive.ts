import { RustOption, variant } from '../src/lib'

interface Recursive {
  inner: RustOption<Recursive>
}

const val: Recursive = {
  inner: variant('Some', {
    inner: variant('Some', {
      inner: variant('Some', {
        inner: variant('Some', {
          inner: variant('Some', {
            inner: variant('Some', {
              inner: variant('Some', {
                inner: variant('Some', {
                  inner: variant('Some', {
                    inner: variant('Some', {
                      inner: variant('Some', {
                        inner: variant('Some', {
                          inner: variant('Some', {
                            inner: variant('None'),
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  }),
}

const err: Recursive = {
  inner: variant('Some', {
    inner: variant('Some', {
      inner: variant('Some', {
        inner: variant('Some', {
          inner: variant('Some', {
            inner: variant('Some', {
              inner: variant('Some', {
                inner: variant('Some', {
                  inner: variant('Some', {
                    inner: variant('Some', {
                      inner: variant('Some', {
                        inner: variant('Some', {
                          inner: variant('Some', {
                            // @ts-expect-error
                            inner: variant('Hey'),
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  }),
}
