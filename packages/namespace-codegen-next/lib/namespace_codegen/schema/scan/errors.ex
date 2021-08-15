defmodule NamespaceCodegen.Schema.Scan.Errors do
  alias NamespaceCodegen.Schema.Scan.Errors, as: Self

  defstruct set: MapSet.new()

  def new do
    %Self{}
  end

  def put_broken_reference(%Self{} = self, from, to) do
    self
    |> put_into_set({:broken_reference, from: from, to: to})
  end

  defp put_into_set(%Self{set: set}, err) do
    %Self{
      set: MapSet.put(set, err)
    }
  end
end
