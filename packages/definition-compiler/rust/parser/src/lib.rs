use std::num::NonZeroU32;

use eyre::{eyre, Context, Report, Result};
use pest::iterators::{Pair, Pairs};
use pest_derive::Parser;

#[derive(Parser)]
#[grammar = "grammar.pest"]
struct ScaleNamespaceParser;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct NamespaceDefinition<'i> {
    types: Vec<ScaleType<'i>>,
}

impl<'i> TryFrom<Pairs<'i, Rule>> for NamespaceDefinition<'i> {
    type Error = Report;

    fn try_from(mut pairs: Pairs<'i, Rule>) -> Result<Self> {
        let main = pairs.next().unwrap();

        let types = main
            .into_inner()
            .map(|pair| match pair.as_rule() {
                Rule::EOI => Ok(None),
                _ => Ok(Some(
                    ScaleType::try_from(pair).wrap_err("failed to parse ScaleType")?,
                )),
            })
            .filter_map(|item| match item {
                Ok(None) => None,
                Ok(Some(ty)) => Some(Ok(ty)),
                Err(err) => Some(Err(err)),
            })
            .collect::<Result<Vec<_>>>()
            .wrap_err("failed to parse types")?;

        Ok(Self { types })
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct Identifier<'i>(&'i str);

impl<'i> TryFrom<Pair<'i, Rule>> for Identifier<'i> {
    type Error = Report;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::identifier => Ok(Identifier(pair.as_str())),
            x => Err(eyre!("expected identifier, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct TypeId<'i> {
    id: Identifier<'i>,
    generics: Vec<TypeId<'i>>,
}

impl<'i> TryFrom<Pair<'i, Rule>> for TypeId<'i> {
    type Error = Report;

    fn try_from(value: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match value.as_rule() {
            Rule::type_id => {
                let mut pairs = value.into_inner();

                let id = pairs
                    .next()
                    .ok_or(eyre!("expected to get identifier name"))
                    .and_then(Identifier::try_from)?;

                let generics = {
                    match pairs.next() {
                        None => Vec::new(),
                        Some(item) => match item.as_rule() {
                            Rule::generics_list => item
                                .into_inner()
                                .map(TypeId::try_from)
                                .collect::<Result<Vec<_>>>()
                                .wrap_err("failed to parse generics")?,
                            x => return Err(eyre!("expected generics_list, got {x:?}")),
                        },
                    }
                };

                Ok(Self { id, generics })
            }
            x => Err(eyre!("expected identifier_with_generics, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum ScaleType<'i> {
    Enum(ScaleEnum<'i>),
    Struct(ScaleStruct<'i>),
    Alias { id: TypeId<'i>, to: ValueType<'i> },
}

impl<'i> TryFrom<Pair<'i, Rule>> for ScaleType<'i> {
    type Error = Report;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::def_struct => {
                let parsed_struct =
                    ScaleStruct::try_from(pair.into_inner()).wrap_err("failed to parse struct")?;
                Ok(Self::Struct(parsed_struct))
            }
            Rule::def_enum => {
                let parsed_enum =
                    ScaleEnum::try_from(pair.into_inner()).wrap_err("failed to parse enum")?;
                Ok(Self::Enum(parsed_enum))
            }
            Rule::def_alias => {
                let mut pairs = pair.into_inner();

                let id = pairs
                    .next()
                    .ok_or(eyre!("item expected"))
                    .and_then(TypeId::try_from)
                    .wrap_err("failed to parse value type")?;

                let value_type = pairs
                    .next()
                    .ok_or(eyre!("item expected"))
                    .and_then(ValueType::try_from)
                    .wrap_err("failed to parse value type")?;

                Ok(Self::Alias { id, to: value_type })
            }
            x => Err(eyre!("unexpected rule: {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct ScaleEnum<'i> {
    id: TypeId<'i>,
    variants: Vec<EnumVariantWithValidDiscriminant<'i>>,
}

impl<'i> TryFrom<Pairs<'i, Rule>> for ScaleEnum<'i> {
    type Error = Report;

    fn try_from(mut pairs: Pairs<'i, Rule>) -> Result<Self> {
        let id = pairs
            .next()
            .ok_or(eyre!("item expected"))
            .and_then(TypeId::try_from)?;

        let variants = pairs
            .map(EnumVariantParsed::try_from)
            .collect::<Result<Vec<_>>>()?;

        let variants = EnumVariantWithValidDiscriminant::try_from_parsed_list(variants)?;

        Ok(Self { id, variants })
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct ScaleStruct<'i> {
    id: TypeId<'i>,
    content: EitherStructOrTupleValues<'i>,
}

impl<'i> TryFrom<Pairs<'i, Rule>> for ScaleStruct<'i> {
    type Error = Report;

    fn try_from(mut pairs: Pairs<'i, Rule>) -> Result<Self> {
        let id = pairs
            .next()
            .ok_or(eyre!("item expected"))
            .and_then(TypeId::try_from)?;

        let content = pairs
            .next()
            .ok_or(eyre!("item expected"))?
            .try_into()
            .wrap_err("failed to parse struct content")?;

        Ok(Self { id, content })
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum EitherStructOrTupleValues<'i> {
    Struct(StructValues<'i>),
    Tuple(TupleValues<'i>),
}

impl<'i> TryFrom<Pair<'i, Rule>> for EitherStructOrTupleValues<'i> {
    type Error = Report;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self> {
        match pair.as_rule() {
            Rule::struct_values => Ok(EitherStructOrTupleValues::Struct(
                pair.try_into().wrap_err("failed to parse struct values")?,
            )),
            Rule::tuple_values => Ok(EitherStructOrTupleValues::Tuple(
                pair.try_into().wrap_err("failed to parse tuple values")?,
            )),
            x => Err(eyre!("expected struct content, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct TupleValues<'i>(Vec<ValueType<'i>>);

impl<'i> TryFrom<Pair<'i, Rule>> for TupleValues<'i> {
    type Error = Report;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self> {
        match pair.as_rule() {
            Rule::tuple_values => {
                let items = pair
                    .into_inner()
                    .map(ValueType::try_from)
                    .collect::<Result<Vec<_>>>()
                    .wrap_err("failed to extract struct tuple items")?;

                Ok(Self(items))
            }
            x => Err(eyre!("expected tuple_values, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct StructValues<'i>(Vec<NamedField<'i>>);

impl<'i> TryFrom<Pair<'i, Rule>> for StructValues<'i> {
    type Error = Report;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self> {
        match pair.as_rule() {
            Rule::struct_values => {
                let fields = pair
                    .into_inner()
                    .map(|pair| match pair.as_rule() {
                        Rule::named_field => {
                            let mut pairs = pair.into_inner();

                            let name = pairs
                                .next()
                                .ok_or(eyre!("item expected"))
                                .and_then(Identifier::try_from)?;

                            let value = pairs
                                .next()
                                .ok_or(eyre!("item expected"))
                                .and_then(ValueType::try_from)?;

                            Ok(NamedField { name, value })
                        }
                        x => Err(eyre!("expected named_field, got {x:?}")),
                    })
                    .collect::<Result<Vec<_>>>()
                    .wrap_err("failed to parse struct named fields")?;

                Ok(Self(fields))
            }
            x => Err(eyre!("expected tuple_values, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct NamedField<'i> {
    name: Identifier<'i>,
    value: ValueType<'i>,
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum ValueType<'i> {
    Reference(TypeId<'i>),
    Array {
        inner: Box<ValueType<'i>>,
        len: NonZeroU32,
    },
}

impl<'i> From<TypeId<'i>> for ValueType<'i> {
    fn from(id: TypeId<'i>) -> Self {
        Self::Reference(id)
    }
}

impl<'i> TryFrom<Pair<'i, Rule>> for ValueType<'i> {
    type Error = Report;

    fn try_from(value: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match value.as_rule() {
            Rule::value_type => {
                let pair = value.into_inner().next().ok_or(eyre!("item expected"))?;

                match pair.as_rule() {
                    Rule::type_id => {
                        let id = TypeId::try_from(pair).wrap_err("failed to parse id")?;
                        Ok(Self::Reference(id))
                    }
                    Rule::array => {
                        let mut pairs = pair.into_inner();

                        let inner = pairs
                            .next()
                            .ok_or(eyre!("item expected"))
                            .and_then(ValueType::try_from)
                            .wrap_err("failed to parse inner array value")?;

                        let len = pairs
                            .next()
                            .ok_or(eyre!("item expected"))
                            .and_then(|pair| match pair.as_rule() {
                                Rule::non_zero_integer => pair
                                    .as_str()
                                    .parse()
                                    .wrap_err("failed to parse non-zero-u32"),
                                x => Err(eyre!("expected non zero integer, got {x:?}")),
                            })
                            .wrap_err("failed to parse array len")?;

                        Ok(Self::Array {
                            inner: Box::new(inner),
                            len,
                        })
                    }
                    x => Err(eyre!("expected id with generics, got {x:?}")),
                }
            }
            x => Err(eyre!("expected value type, got {x:?}")),
        }
    }
}

#[derive(Debug)]
struct EnumVariantParsed<'i> {
    name: Identifier<'i>,
    discriminant: Option<u32>,
    content: Option<EitherStructOrTupleValues<'i>>,
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct EnumVariantWithValidDiscriminant<'i> {
    name: Identifier<'i>,
    discriminant: u32,
    content: Option<EitherStructOrTupleValues<'i>>,
}

impl<'i> EnumVariantWithValidDiscriminant<'i> {
    fn try_from_parsed_list(
        items: impl IntoIterator<Item = EnumVariantParsed<'i>>,
    ) -> Result<Vec<Self>> {
        let mut previous_discriminant = None;

        let mapped: Vec<_> = items
            .into_iter()
            .map(|item| {
                let discriminant = match item.discriminant {
                    None => previous_discriminant.map(|x| x + 1).unwrap_or(0),
                    Some(x) => x,
                };

                previous_discriminant = Some(discriminant);

                Self {
                    name: item.name,
                    discriminant,
                    content: item.content,
                }
            })
            .collect();

        // checking for discriminants uniqueness
        {
            let mut items = mapped.iter().map(|x| x.discriminant).collect::<Vec<_>>();
            items.sort();
            let mut items = items.iter();

            if let Some(first) = items.next() {
                let mut previous = first;
                for i in items {
                    if i == previous {
                        return Err(eyre!("duplicate discriminant found: {i}"));
                    }
                    previous = i;
                }
            }
        }

        Ok(mapped)
    }
}

impl<'i> TryFrom<Pair<'i, Rule>> for EnumVariantParsed<'i> {
    type Error = Report;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self> {
        match pair.as_rule() {
            Rule::enum_variant => {
                let mut pairs = pair.into_inner();

                let first = pairs.next().ok_or(eyre!("item expected"))?;
                let (name, content) = match first.as_rule() {
                    Rule::enum_variant_empty => {
                        let name = first
                            .into_inner()
                            .next()
                            .ok_or(eyre!("item expected"))
                            .and_then(Identifier::try_from)?;
                        (name, None)
                    }
                    Rule::enum_variant_tuple => {
                        let mut pairs = first.into_inner();
                        let name = pairs
                            .next()
                            .ok_or(eyre!("item expected"))
                            .and_then(Identifier::try_from)?;

                        let values =
                            TupleValues::try_from(pairs.next().ok_or(eyre!("item expected"))?)?;

                        (name, Some(EitherStructOrTupleValues::Tuple(values)))
                    }
                    Rule::enum_variant_struct => {
                        let mut pairs = first.into_inner();
                        let name = pairs
                            .next()
                            .ok_or(eyre!("item expected"))
                            .and_then(Identifier::try_from)?;

                        let values =
                            StructValues::try_from(pairs.next().ok_or(eyre!("item expected"))?)?;

                        (name, Some(EitherStructOrTupleValues::Struct(values)))
                    }
                    x => return Err(eyre!("expected some of enum variants, got {x:?}")),
                };

                let discriminant = pairs
                    .next()
                    .map(|pair| match pair.as_rule() {
                        Rule::enum_discriminant => Ok(pair
                            .as_str()
                            .parse::<u32>()
                            .wrap_err("failed to parse enum discriminant")),
                        x => Err(eyre!("expected enum_discriminant, got {x:?}")),
                    })
                    .transpose()?
                    .transpose()?;

                Ok(Self {
                    name,
                    discriminant,
                    content,
                })
            }
            x => Err(eyre!("expected enum variant, got {x:?}")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pest::Parser;

    impl<'i> From<&'i str> for Identifier<'i> {
        fn from(value: &'i str) -> Self {
            Identifier(value)
        }
    }

    impl<'i> TypeId<'i> {
        fn new(id: &'i str) -> Self {
            Self {
                id: Identifier(id),
                generics: Vec::new(),
            }
        }

        fn and(mut self, generic: TypeId<'i>) -> Self {
            self.generics.push(generic);
            self
        }
    }

    fn assert_parsing(input: &str, expected: NamespaceDefinition) -> Result<()> {
        let parsed =
            ScaleNamespaceParser::parse(Rule::main, input).wrap_err("failed to parse input")?;
        let actual = NamespaceDefinition::try_from(parsed).wrap_err("failed to map parsed data")?;

        assert_eq!(actual, expected);

        Ok(())
    }

    fn assert_mapping_fails(input: &str) -> Result<()> {
        let parsed =
            ScaleNamespaceParser::parse(Rule::main, input).wrap_err("failed to parse input")?;
        let _err = NamespaceDefinition::try_from(parsed)
            .err()
            .ok_or(eyre!("expect mapping to fail"))?;
        Ok(())
    }

    #[test]
    fn struct_with_simple_refs() -> Result<()> {
        assert_parsing(
            r#"
            struct Person {
                name: String,
                age: u8
            }
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Struct(ScaleStruct {
                    id: TypeId::new("Person"),
                    content: EitherStructOrTupleValues::Struct(StructValues(vec![
                        NamedField {
                            name: "name".into(),
                            value: ValueType::Reference(TypeId::new("String")),
                        },
                        NamedField {
                            name: "age".into(),
                            value: ValueType::Reference(TypeId::new("u8")),
                        },
                    ])),
                })],
            },
        )
    }

    #[test]
    fn struct_with_generics() -> Result<()> {
        assert_parsing(
            r#"
            struct Message<T, U> {
                content: T,
                user: Option<U>,
                parents: HashMap<Str, Str>
            }
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Struct(ScaleStruct {
                    id: TypeId::new("Message")
                        .and(TypeId::new("T"))
                        .and(TypeId::new("U")),
                    content: EitherStructOrTupleValues::Struct(StructValues(vec![
                        NamedField {
                            name: "content".into(),
                            value: ValueType::Reference(TypeId::new("T")),
                        },
                        NamedField {
                            name: "user".into(),
                            value: ValueType::Reference(
                                TypeId::new("Option").and(TypeId::new("U")),
                            ),
                        },
                        NamedField {
                            name: "parents".into(),
                            value: ValueType::Reference(
                                TypeId::new("HashMap")
                                    .and(TypeId::new("Str"))
                                    .and(TypeId::new("Str")),
                            ),
                        },
                    ])),
                })],
            },
        )
    }

    #[test]
    fn tuple_struct() -> Result<()> {
        assert_parsing(
            r#"
            struct BizarreTuple(u8, Str, Option<T>, [Option<T>; 45]);
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Struct(ScaleStruct {
                    id: TypeId::new("BizarreTuple"),
                    content: EitherStructOrTupleValues::Tuple(TupleValues(vec![
                        ValueType::Reference(TypeId::new("u8")),
                        ValueType::Reference(TypeId::new("Str")),
                        ValueType::Reference(TypeId::new("Option").and(TypeId::new("T"))),
                        ValueType::Array {
                            inner: Box::new(ValueType::Reference(
                                TypeId::new("Option").and(TypeId::new("T")),
                            )),
                            len: 45.try_into().unwrap(),
                        },
                    ])),
                })],
            },
        )
    }

    #[test]
    fn tuple_struct_with_generics() -> Result<()> {
        assert_parsing(
            r#"
            struct NewType<T>(T);
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Struct(ScaleStruct {
                    id: TypeId::new("NewType").and(TypeId::new("T")),
                    content: EitherStructOrTupleValues::Tuple(TupleValues(vec![
                        ValueType::Reference(TypeId::new("T")),
                    ])),
                })],
            },
        )
    }

    #[test]
    fn alias_simple() -> Result<()> {
        assert_parsing(
            r#"
            type A = B;
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Alias {
                    id: TypeId::new("A"),
                    to: ValueType::Reference(TypeId::new("B")),
                }],
            },
        )
    }

    #[test]
    fn alias_complex() -> Result<()> {
        assert_parsing(
            r#"
            type A<T, U> = [Result<T, U>; 25];
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Alias {
                    id: TypeId::new("A").and(TypeId::new("T")).and(TypeId::new("U")),
                    to: ValueType::Array {
                        inner: Box::new(ValueType::Reference(
                            TypeId::new("Result")
                                .and(TypeId::new("T"))
                                .and(TypeId::new("U")),
                        )),
                        len: 25.try_into().unwrap(),
                    },
                }],
            },
        )
    }

    #[test]
    fn multiple_types() -> Result<()> {
        assert_parsing(
            r#"
            type A<T, U> = Map<T, U>;
            type B = A;
            struct A(B, C);
            "#,
            NamespaceDefinition {
                types: vec![
                    ScaleType::Alias {
                        id: TypeId::new("A").and(TypeId::new("T")).and(TypeId::new("U")),
                        to: ValueType::Reference(
                            TypeId::new("Map")
                                .and(TypeId::new("T"))
                                .and(TypeId::new("U")),
                        ),
                    },
                    ScaleType::Alias {
                        id: TypeId::new("B"),
                        to: ValueType::Reference(TypeId::new("A")),
                    },
                    ScaleType::Struct(ScaleStruct {
                        id: TypeId::new("A"),
                        content: EitherStructOrTupleValues::Tuple(TupleValues(vec![
                            ValueType::Reference(TypeId::new("B")),
                            ValueType::Reference(TypeId::new("C")),
                        ])),
                    }),
                ],
            },
        )
    }

    #[test]
    fn generics_with_inner_generics() -> Result<()> {
        assert_parsing(
            "type A = Option<Map<Option<Option<u8>>, Str>>;",
            NamespaceDefinition {
                types: vec![ScaleType::Alias {
                    id: TypeId::new("A"),
                    to: ValueType::Reference(
                        TypeId::new("Option").and(
                            TypeId::new("Map")
                                .and(
                                    TypeId::new("Option")
                                        .and(TypeId::new("Option").and(TypeId::new("u8"))),
                                )
                                .and(TypeId::new("Str")),
                        ),
                    ),
                }],
            },
        )
    }

    #[test]
    fn enum_with_different_variants() -> Result<()> {
        assert_parsing(
            "enum Test { First, Second(u8, u9), Third { whatever: FooBar<T> } }",
            NamespaceDefinition {
                types: vec![ScaleType::Enum(ScaleEnum {
                    id: TypeId::new("Test"),
                    variants: vec![
                        EnumVariantWithValidDiscriminant {
                            name: Identifier("First"),
                            discriminant: 0,
                            content: None,
                        },
                        EnumVariantWithValidDiscriminant {
                            name: Identifier("Second"),
                            discriminant: 1,
                            content: Some(EitherStructOrTupleValues::Tuple(TupleValues(vec![
                                TypeId::new("u8").into(),
                                TypeId::new("u9").into(),
                            ]))),
                        },
                        EnumVariantWithValidDiscriminant {
                            name: Identifier("Third"),
                            discriminant: 2,
                            content: Some(EitherStructOrTupleValues::Struct(StructValues(vec![
                                NamedField {
                                    name: Identifier("whatever"),
                                    value: TypeId::new("FooBar").and(TypeId::new("T")).into(),
                                },
                            ]))),
                        },
                    ],
                })],
            },
        )
    }

    #[test]
    fn enum_custom_discriminant() -> Result<()> {
        assert_parsing(
            "enum Test { First, Second = 5, Third }",
            NamespaceDefinition {
                types: vec![ScaleType::Enum(ScaleEnum {
                    id: TypeId::new("Test"),
                    variants: vec![
                        EnumVariantWithValidDiscriminant {
                            name: Identifier("First"),
                            discriminant: 0,
                            content: None,
                        },
                        EnumVariantWithValidDiscriminant {
                            name: Identifier("Second"),
                            discriminant: 5,
                            content: None,
                        },
                        EnumVariantWithValidDiscriminant {
                            name: Identifier("Third"),
                            discriminant: 6,
                            content: None,
                        },
                    ],
                })],
            },
        )
    }

    #[test]
    fn enum_custom_discriminant_collision() -> Result<()> {
        assert_mapping_fails(
            "
            enum SharedDiscriminantError {
                SharedA = 1,
                SharedB = 1
            }
            ",
        )
    }

    #[test]
    fn enum_custom_discriminant_collision_2() -> Result<()> {
        assert_mapping_fails(
            "
            enum SharedDiscriminantError2 {
                Zero,    
                One,
                OneToo = 1
            }
            ",
        )
    }

    #[test]
    #[ignore = "todo"]
    fn array_with_wrong_len() {}
}
