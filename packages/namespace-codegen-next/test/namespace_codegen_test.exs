defmodule NamespaceCodegenTest do
  use ExUnit.Case
  doctest NamespaceCodegen

  test "greets the world" do
    assert NamespaceCodegen.hello() == :world
  end
end
