import consola from 'consola'
import suite_array_u64_l32 from './array_u64_l32'

async function main() {
    await suite_array_u64_l32()
}

main().catch((err) => {
    consola.fatal(err)
    process.exit(1)
})
