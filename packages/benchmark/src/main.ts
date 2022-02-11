import consola from 'consola'
import suite_array_u64_l32 from './array_u64_l32'
import suite_set_compact from './set_compact'

async function main() {
    await suite_array_u64_l32()
    await suite_set_compact()
}

main().catch((err) => {
    consola.fatal(err)
    process.exit(1)
})
