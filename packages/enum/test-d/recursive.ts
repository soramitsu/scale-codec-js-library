import { Option, variant } from '../src/lib'

interface Recursive {
  inner: Option<Recursive>
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
