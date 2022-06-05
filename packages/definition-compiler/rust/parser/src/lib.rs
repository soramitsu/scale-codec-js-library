use eyre::{eyre, Context, Report, Result};
use pest::iterators::{Pair, Pairs};
use pest_derive::Parser;

#[derive(Parser)]
#[grammar = "grammar.pest"]
struct ScaleNamespaceParser;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct NamespaceDefinition {
    types: Vec<ScaleType>,
}

impl<'a> TryFrom<Pairs<'a, Rule>> for NamespaceDefinition {
    type Error = Report;

    fn try_from(pairs: Pairs<Rule>) -> Result<Self> {
        let main = pairs.next().unwrap();

        let types = main.into_inner().map(|pair| match pair.as_rule() {
            Rule::EOI => Ok(None),
            x => Ok(Some(
                ScaleType::try_from(pair).wrap_err("failed to parse ScaleType")?,
            )),
        });

        // println!("{value:#?}");

        // let types: Vec<ScaleType> = value.into_iter().map(|pair| {}).collect();

        Err(eyre!("unimplemented"))
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct Identifier(String);

impl<'a> TryFrom<Pair<'a, Rule>> for Identifier {
    type Error = Report;

    fn try_from(pair: Pair<Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::identifier => Ok(Identifier(pair.as_str().to_owned())),
            x => Err(eyre!("expected identifier, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct IdentifierWithGenerics {
    id: Identifier,
    generics: Vec<Identifier>,
}

impl<'a> TryFrom<Pair<'a, Rule>> for IdentifierWithGenerics {
    type Error = Report;

    fn try_from(value: Pair<'a, Rule>) -> Result<Self, Self::Error> {
        match value.as_rule() {
            Rule::identifier_with_generics => {
                let mut pairs = value.into_inner();

                let id = pairs
                    .next()
                    .ok_or(eyre!("expected to get identifier name"))
                    .and_then(Identifier::try_from)?;

                let generics = pairs
                    .into_iter()
                    .map(Identifier::try_from)
                    .collect::<Result<Vec<_>>>()
                    .wrap_err("Failed to map generics")?;

                Ok(Self { id, generics })
            }
            x => Err(eyre!("expected identifier_with_generics, got {x:?}")),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum ScaleType {
    Enum(ScaleEnum),
    Struct(ScaleStruct),
}

impl<'a> TryFrom<Pair<'a, Rule>> for ScaleType {
    type Error = Report;

    fn try_from(value: Pair<'a, Rule>) -> Result<Self, Self::Error> {
        match value.as_rule() {
            Rule::def_struct => {
                let a = value.into_inner();
            }
            _ => unimplemented!(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct ScaleEnum {
    id: IdentifierWithGenerics,
    variants: Vec<ScaleEnumVariant>,
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct ScaleStruct {
    id: IdentifierWithGenerics,
    content: ScaleStructContent,
}

impl<'a> TryFrom<Pairs<'a, Rule>> for ScaleStruct {
    type Error = Report;

    fn try_from(pairs: Pairs<Rule>) -> Result<Self> {
        let id = pairs
            .next()
            .ok_or(eyre!("item expected"))
            .and_then(IdentifierWithGenerics::try_from)?;

        let content_pair = pairs.next().ok_or(eyre!("item expected"))?;

        match content_pair.as_rule() {
            Rule::def_struct_content_named => {
                let fields = content_pair.into_inner().map(|pair| match pair.as_rule() {
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

                        NamedField { name, value }
                    }
                });
            }
        }

        // value.i

        // match value {
        //     Rule::def_struct => {

        //     }
        // }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum ScaleStructContent {
    Named(Vec<NamedField>),
    Tuple(Vec<ValueType>),
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct NamedField {
    name: Identifier,
    value: ValueType,
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum ValueType {
    Reference(IdentifierWithGenerics),
    Array { inner: Box<ValueType>, len: u32 },
}

impl<'a> TryFrom<Pair<'a, Rule>> for ValueType {
    type Error = Report;

    fn try_from(value: Pair<'a, Rule>) -> Result<Self, Self::Error> {
        unimplemented!()
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct ScaleEnumVariant {
    name: Identifier,
    discriminant: u32,
    value: Option<ValueType>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use pest::Parser;

    impl<'a> From<&'a str> for Identifier {
        fn from(value: &'a str) -> Self {
            Identifier(value.to_owned())
        }
    }

    impl IdentifierWithGenerics {
        fn new(name_with_generics: &[&str]) -> Self {
            let id = (*name_with_generics.first().unwrap()).to_owned();
            let generics = (name_with_generics[1..].iter().map(|x| (*x).to_owned()))
                .map(Identifier)
                .collect();
            Self {
                id: Identifier(id),
                generics,
            }
        }
    }

    // impl<'a> TryFrom<&'a str> for IdWithGenerics {
    //     type Error = Report;

    //     fn try_from(value: &'a str) -> Result<Self> {
    //         lazy_static::lazy_static! {
    //             static ref RE: Regex = Regex::new("([A-Za-z0-9_]+)(?:<()(,\s*())*>)?").unwrap();
    //         }

    //         Identifier(value.to_owned())
    //     }
    // }

    fn assert_parsing(input: &str, expected: NamespaceDefinition) {
        let parsed = ScaleNamespaceParser::parse(Rule::main, input).unwrap();
        let actual = NamespaceDefinition::try_from(parsed).unwrap();

        assert_eq!(actual, expected);
    }

    #[test]
    fn sample() {
        assert_parsing(
            r#"
            struct Person {
                name: String,
                age: u8
            }
            "#,
            NamespaceDefinition {
                types: vec![ScaleType::Struct(ScaleStruct {
                    id: IdentifierWithGenerics::new(&["Person"]),
                    content: ScaleStructContent::Named(vec![
                        NamedField {
                            name: "name".into(),
                            value: ValueType::Reference(IdentifierWithGenerics::new(&["String"])),
                        },
                        NamedField {
                            name: "age".into(),
                            value: ValueType::Reference(IdentifierWithGenerics::new(&["u8"])),
                        },
                    ]),
                })],
            },
        );
    }
}
