defmodule NamespaceCodegenTest do
  use ExUnit.Case

  # test "Simple schema" do
  #   schema = %{
  #     "Person" => %{
  #       "name" => "Alice",
  #       "age" => 13
  #     }
  #   }

  #   expected = """
  #   import {
  #   } from '@scale-codec/namespace-next';

  #   export namespace Example {
  #       export namespace Person {
  #           export type Pure = {
  #               name: Example.str.Pure;
  #               age: Example.u8.Pure;
  #           };

  #           export type Encodable = {

  #           }
  #       }
  #   }
  #   """

  #   assert NamespaceCodegen.generate_with_schema(schema, root_namespace_name: "Example") == """
  #          import {
  #          } from '@scale-codec/namespace-next';

  #          export namespace Example {
  #              export namespace Person {

  #              }
  #          }
  #          """
  # end
end
