import { build, Format } from 'esbuild'
import path from 'path'
import { PUBLIC_PACKAGES_UNSCOPED, PACKAGE_EXTERNALS, resolvePackageDist, resolvePackageEntrypoint } from '../meta'

const FORMATS: Format[] = ['esm', 'cjs']

export default async function () {
    await Promise.all(
        PUBLIC_PACKAGES_UNSCOPED.map(async (x) => {
            await Promise.all(
                FORMATS.map((format) =>
                    build({
                        entryPoints: [resolvePackageEntrypoint(x)],
                        outfile: path.join(resolvePackageDist(x), `lib.${format}.js`),
                        bundle: true,
                        external: PACKAGE_EXTERNALS[x],
                        logLevel: 'info',
                        target: 'esnext',
                        platform: 'neutral',
                        format,
                    }),
                ),
            )
        }),
    )
}
