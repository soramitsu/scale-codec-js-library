defmodule NamespaceCodegenSchemaScanTest do
  use ExUnit.Case
  alias NamespaceCodegen.Schema.Scan
  alias NamespaceCodegen.Schema.Scan.Errors

  def scan(schema) do
    Scan.scan_schema(schema)
  end

  test "Scans valid Person with str and u8 correctly" do
    assert scan(%{
             "Person" => %{
               "t" => "struct",
               "fields" => [
                 %{
                   "name" => "name",
                   "ref" => "str"
                 },
                 %{
                   "name" => "age",
                   "ref" => "u8"
                 }
               ]
             }
           }) ==
             {
               :ok,
               # used std codecs
               MapSet.new([{:int, 8}, :str]),
               # parsed schema
               %{
                 ["Person"] => %{
                   t: :struct,
                   fields: [
                     %{
                       name: "name",
                       ref: ["str"]
                     },
                     %{
                       name: "age",
                       ref: ["u8"]
                     }
                   ]
                 }
               }
             }
  end

  describe "Undefined references in different defs" do
    def assert_errors_found(schema, errors) do
      assert scan(schema) == {:errors_found, errors}
    end

    test "In alias" do
      assert_errors_found(
        %{"BadString" => "string"},
        Errors.new() |> Errors.put_broken_reference("alias BadString", "string")
      )
    end

    test "In array" do
      assert_errors_found(
        %{
          "Arr" => %{
            "t" => "array",
            "item" => "nowhere",
            "len" => 32
          }
        },
        Errors.new() |> Errors.put_broken_reference("array Arr", "nowhere")
      )
    end

    test "In vec" do
      assert_errors_found(
        %{
          "Vec<Magic>" => %{
            "t" => "vec",
            "item" => "Magic"
          }
        },
        Errors.new() |> Errors.put_broken_reference("vec Vec<Magic>", "Magic")
      )
    end

    test "In tuple (multiple)" do
      assert_errors_found(
        %{
          "Tuple_str_num_bigint" => %{
            "t" => "tuple",
            "items" => ["str", "num", "bigint"]
          }
        },
        Errors.new()
        |> Errors.put_broken_reference("tuple Tuple_str_num_bigint (pos 1)", "num")
        |> Errors.put_broken_reference("tuple Tuple_str_num_bigint (pos 2)", "bigint")
      )
    end

    test "In struct (multiple)" do
      assert_errors_found(
        %{
          "Person" => %{
            "t" => "struct",
            "fields" => [
              %{
                "name" => "name",
                "ref" => "some.undefined.ref"
              }
            ]
          },
          "School.Person" => %{
            "t" => "struct",
            "fields" => [
              %{
                "name" => "persons",
                "ref" => "Vec<Person>"
              }
            ]
          }
        },
        Errors.new()
        |> Errors.put_broken_reference("struct Person -> name", "some.undefined.ref")
        |> Errors.put_broken_reference("struct School.Person -> persons", "Vec<Person>")
      )
    end
  end

  test "Parses nested (with dots) type name correctly" do
    assert scan(%{
             "MyModule.str.String" => "str"
           }) ==
             {:ok, MapSet.new([:str]),
              %{
                ["MyModule", "str", "String"] => ["str"]
              }}
  end

  test "Parses nested ref correctly" do
    assert scan(%{
             "pipeline.Event" => "bool",
             "Event" => %{
               "t" => "enum",
               "variants" => [
                 %{
                   "name" => "Pipeline",
                   "discriminant" => 0,
                   "ref" => "pipeline.Event"
                 }
               ]
             }
           }) ==
             {:ok, MapSet.mew([:bool]),
              %{
                ["pipeline", "Event"] => "bool",
                ["Event"] => %{
                  t: :enum,
                  variants: [
                    %{
                      name: "Pipeline",
                      discriminant: 0,
                      ef: ["pipeline", "Event"]
                    }
                  ]
                }
              }}
  end

  test "Detects invalid type name" do
    assert scan(%{
             "data_model::Event" => %{
               "t" => "struct",
               "fields" => []
             }
           }) ==
             {:errors_found, MapSet.new([{:invalid_identifier, type: "data_model::Event"}])}
  end

  test "Detects unparsable type struct" do
    assert scan(%{
             "Person" => %{}
           }) == {:errors_found, MapSet.new([{:unknown_definition, type: "Person"}])}
  end
end
