import consola from 'consola'
import suite_array_u64_l32 from './array_u64_l32'
import suite_enum_options_chain from './enum_options_chain'
import suite_map_str_bool from './map_str_bool'
import suite_set_compact from './set_compact'
import suite_struct from './struct'
import suite_struct_deep_unit from './struct-deep'

async function main() {
  await suite_array_u64_l32()
  await suite_set_compact()
  await suite_map_str_bool()
  await suite_enum_options_chain()
  await suite_struct()
  await suite_struct_deep_unit()
}

main().catch((err) => {
  consola.fatal(err)
  process.exit(1)
})
