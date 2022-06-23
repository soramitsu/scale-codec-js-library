use error_stack::{Context, IntoReport, Report, Result as ReportResult, ResultExt};
use parse_display::Display;
use pest::{
    iterators::{Pair, Pairs},
    RuleType, Span,
};
use pest_derive::Parser;
use std::num::NonZeroU32;
use std::{fmt, num::ParseIntError};

#[derive(Parser)]
#[grammar = "grammar.pest"]
struct SyntaxParser;

#[derive(Debug)]
struct ParseError {}

struct SyntaxErrorLoc {
    start: usize,
    end: usize,
}

impl fmt::Display for ParseError {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt.write_str("todo")
    }
}

impl Context for ParseError {}

impl From<Span<'_>> for SyntaxErrorLoc {
    fn from(span: Span<'_>) -> Self {
        Self::from(&span)
    }
}

impl From<&Span<'_>> for SyntaxErrorLoc {
    fn from(span: &Span<'_>) -> Self {
        Self {
            start: span.start(),
            end: span.end(),
        }
    }
}

impl<R> From<&Pair<'_, R>> for SyntaxErrorLoc
where
    R: RuleType,
{
    fn from(pair: &Pair<'_, R>) -> Self {
        Self::from(pair.as_span())
    }
}

impl<T> From<ParseError> for ReportResult<T, ParseError> {
    fn from(err: ParseError) -> Self {
        Err(err).report()
    }
}

impl ParseError {
    pub fn syntax_unexpected_rule(span: SyntaxErrorLoc, err: UnexpectedRuleError) -> Self {
        unimplemented!()
    }

    pub fn syntax_item_expected(span: SyntaxErrorLoc) -> Self {
        unimplemented!()
    }

    pub fn syntax_invalid_integer(span: SyntaxErrorLoc, err: ParseIntError) -> Self {
        unimplemented!()
    }

    pub fn into_report<T>(self) -> ReportResult<T, Self> {
        ParseError::into(self)
    }
}

#[derive(parse_display::Display, Debug)]
#[display("Unexpected rule: {unexpected:?}")]
struct UnexpectedRuleError {
    unexpected: Rule,
}

impl UnexpectedRuleError {
    pub fn new(unexpected: Rule) -> Self {
        Self { unexpected }
    }
}

impl From<Rule> for UnexpectedRuleError {
    fn from(value: Rule) -> Self {
        Self::new(value)
    }
}

trait PairsIteratorExt<'i, R> {
    fn next_or_report<F: Fn() -> SyntaxErrorLoc>(
        &mut self,
        location: F,
    ) -> Result<Pair<'i, R>, ParseErrorReport>;
}

impl<'i, R> PairsIteratorExt<'i, R> for Pairs<'i, R>
where
    R: RuleType,
{
    fn next_or_report<F: Fn() -> SyntaxErrorLoc>(
        &mut self,
        location: F,
    ) -> Result<Pair<'i, R>, ParseErrorReport> {
        self.next()
            .ok_or_else(|| ParseError::syntax_item_expected(location()))
            .report()
    }
}

type ParseErrorReport = Report<ParseError>;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct SyntaxNamespace<'i> {
    types: Vec<SyntaxType<'i>>,
}

impl<'i> TryFrom<Pairs<'i, Rule>> for SyntaxNamespace<'i> {
    type Error = ParseErrorReport;

    fn try_from(mut pairs: Pairs<'i, Rule>) -> Result<Self, Self::Error> {
        let main = pairs.next().unwrap();

        let types = main
            .into_inner()
            .map(|pair| match pair.as_rule() {
                Rule::EOI => Ok(None),
                _ => Ok(Some(
                    SyntaxType::try_from(pair).attach_printable("failed to parse ScaleType")?,
                )),
            })
            .filter_map(|item| match item {
                Ok(None) => None,
                Ok(Some(ty)) => Some(Ok(ty)),
                Err(err) => Some(Err(err)),
            })
            .collect::<Result<Vec<_>, _>>()
            .attach_printable("failed to parse types")?;

        Ok(Self { types })
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct SyntaxIdentifier<'i>(&'i str);

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxIdentifier<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::identifier => Ok(SyntaxIdentifier(pair.as_str())),
            x => ParseError::syntax_unexpected_rule(
                SyntaxErrorLoc::from(&pair),
                UnexpectedRuleError::new(x),
            )
            .into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct SyntaxTypeId<'i> {
    id: SyntaxIdentifier<'i>,
    generics: Vec<SyntaxTypeId<'i>>,
}

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxTypeId<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::type_id => {
                let span = &pair.as_span();
                let mut pairs = pair.into_inner();

                let id = pairs
                    .next_or_report(|| span.into())
                    .and_then(SyntaxIdentifier::try_from)?;

                let generics = {
                    match pairs.next() {
                        None => Vec::new(),
                        Some(item) => match item.as_rule() {
                            Rule::generics_list => item
                                .into_inner()
                                .map(SyntaxTypeId::try_from)
                                .collect::<Result<Vec<_>, _>>()
                                .attach_printable("failed to parse generics")?,
                            x => {
                                return ParseError::syntax_unexpected_rule(
                                    span.into(),
                                    UnexpectedRuleError::new(x),
                                )
                                .into()
                            }
                        },
                    }
                };

                Ok(Self { id, generics })
            }
            x => ParseError::syntax_unexpected_rule((&pair).into(), UnexpectedRuleError::new(x))
                .into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum SyntaxType<'i> {
    Enum(SyntaxEnum<'i>),
    Struct(SyntaxStruct<'i>),
    Alias {
        id: SyntaxTypeId<'i>,
        to: SyntaxValueType<'i>,
    },
}

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxType<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::def_struct => {
                let parsed_struct =
                    SyntaxStruct::try_from(pair).attach_printable("failed to parse struct")?;
                Ok(Self::Struct(parsed_struct))
            }
            Rule::def_enum => {
                let parsed_enum =
                    SyntaxEnum::try_from(pair).attach_printable("failed to parse enum")?;
                Ok(Self::Enum(parsed_enum))
            }
            Rule::def_alias => {
                let span = &pair.as_span();
                let mut pairs = pair.into_inner();

                let id = pairs
                    .next_or_report(|| span.into())
                    .and_then(SyntaxTypeId::try_from)
                    .attach_printable("failed to parse type id")?;

                let value_type = pairs
                    .next_or_report(|| span.into())
                    .and_then(SyntaxValueType::try_from)
                    .attach_printable("failed to parse value type")?;

                Ok(Self::Alias { id, to: value_type })
            }
            x => ParseError::syntax_unexpected_rule((&pair).into(), UnexpectedRuleError::new(x))
                .into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct SyntaxEnum<'i> {
    id: SyntaxTypeId<'i>,
    variants: Vec<EnumVariantWithResolvedDiscriminant<'i>>,
}

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxEnum<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        let span = &pair.as_span();
        let mut pairs = pair.into_inner();

        let id = pairs
            .next_or_report(|| span.into())
            .and_then(SyntaxTypeId::try_from)?;

        let variants = pairs
            .map(SyntaxEnumVariant::try_from)
            .collect::<Result<Vec<_>, _>>()?;

        let variants = EnumVariantWithResolvedDiscriminant::try_from_parsed_list(variants)
            .change_context(ParseError)?;

        Ok(Self { id, variants })
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct SyntaxStruct<'i> {
    id: SyntaxTypeId<'i>,
    content: EitherStructOrTupleValues<'i>,
}

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxStruct<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        let span = &pair.as_span();
        let mut pairs = pair.into_inner();

        let id = pairs
            .next_or_report(|| span.into())
            .and_then(SyntaxTypeId::try_from)
            .attach_printable("failed to parse type id")?;

        let content = pairs
            .next_or_report(|| span.into())?
            .try_into()
            .attach_printable("failed to parse struct content")?;

        Ok(Self { id, content })
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum EitherStructOrTupleValues<'i> {
    Struct(StructValues<'i>),
    Tuple(TupleValues<'i>),
}

impl<'i> TryFrom<Pair<'i, Rule>> for EitherStructOrTupleValues<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::struct_values => Ok(EitherStructOrTupleValues::Struct(
                pair.try_into()
                    .attach_printable("failed to parse struct values")?,
            )),
            Rule::tuple_values => Ok(EitherStructOrTupleValues::Tuple(
                pair.try_into()
                    .attach_printable("failed to parse tuple values")?,
            )),
            x => ParseError::syntax_unexpected_rule((&pair).into(), UnexpectedRuleError::new(x))
                .into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct TupleValues<'i>(Vec<SyntaxValueType<'i>>);

impl<'i> TryFrom<Pair<'i, Rule>> for TupleValues<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::tuple_values => {
                let items = pair
                    .into_inner()
                    .map(SyntaxValueType::try_from)
                    .collect::<Result<Vec<_>, _>>()
                    .attach_printable("failed to extract struct tuple items")?;

                Ok(Self(items))
            }
            x => ParseError::syntax_unexpected_rule((&pair).into(), UnexpectedRuleError::new(x))
                .into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct StructValues<'i>(Vec<NamedField<'i>>);

impl<'i> TryFrom<Pair<'i, Rule>> for StructValues<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::struct_values => {
                let fields = pair
                    .into_inner()
                    .map(|pair| match pair.as_rule() {
                        Rule::named_field => {
                            let span = &pair.as_span();
                            let mut pairs = pair.into_inner();

                            let name = pairs
                                .next_or_report(|| span.into())
                                .and_then(SyntaxIdentifier::try_from)?;

                            let value = pairs
                                .next_or_report(|| span.into())
                                .and_then(SyntaxValueType::try_from)?;

                            Ok(NamedField { name, value })
                        }
                        x => ParseError::syntax_unexpected_rule(
                            (&pair).into(),
                            UnexpectedRuleError::new(x),
                        )
                        .into(),
                    })
                    .collect::<Result<Vec<_>, _>>()
                    .attach_printable("failed to parse struct named fields")?;

                Ok(Self(fields))
            }
            x => ParseError::syntax_unexpected_rule((&pair).into(), UnexpectedRuleError::new(x))
                .into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct NamedField<'i> {
    name: SyntaxIdentifier<'i>,
    value: SyntaxValueType<'i>,
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
enum SyntaxValueType<'i> {
    Reference(SyntaxTypeId<'i>),
    Array {
        inner: Box<SyntaxValueType<'i>>,
        len: NonZeroU32,
    },
}

impl<'i> From<SyntaxTypeId<'i>> for SyntaxValueType<'i> {
    fn from(id: SyntaxTypeId<'i>) -> Self {
        Self::Reference(id)
    }
}

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxValueType<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::value_type => {
                let pair = pair.into_inner().next_or_report(|| (&pair).into())?;

                match pair.as_rule() {
                    Rule::type_id => {
                        let id =
                            SyntaxTypeId::try_from(pair).attach_printable("failed to parse id")?;
                        Ok(Self::Reference(id))
                    }
                    Rule::array => {
                        let span = &pair.as_span();
                        let mut pairs = pair.into_inner();

                        let inner = pairs
                            .next_or_report(|| span.into())
                            .and_then(SyntaxValueType::try_from)
                            .attach_printable("failed to parse inner array value")?;

                        let len = pairs
                            .next_or_report(|| span.into())
                            .and_then(|pair| match pair.as_rule() {
                                Rule::non_zero_integer => pair
                                    .as_str()
                                    .parse()
                                    .map_err(|err| {
                                        ParseError::syntax_invalid_integer(span.into(), err)
                                    })
                                    .report()
                                    .attach_printable("failed to parse non-zero-u32"),
                                x => {
                                    ParseError::syntax_unexpected_rule(span.into(), x.into()).into()
                                }
                            })
                            .attach_printable("failed to parse array len")?;

                        Ok(Self::Array {
                            inner: Box::new(inner),
                            len,
                        })
                    }
                    x => ParseError::syntax_unexpected_rule((&pair).into(), x.into()).into(),
                }
            }
            x => ParseError::syntax_unexpected_rule((&pair).into(), x.into()).into(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct EnumVariantWithResolvedDiscriminant<'i> {
    name: SyntaxIdentifier<'i>,
    discriminant: u32,
    content: Option<EitherStructOrTupleValues<'i>>,
}

#[derive(thiserror::Error, Debug)]
enum DiscriminantResolutionError {
    #[error("duplicate discriminant found: {0}")]
    Duplicated(u32),
}

// impl Context for DiscriminantResolutionError {}

// impl fmt::Display for DiscriminantResolutionError {
//     fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
//         unimplemented!()
//     }
// }

impl<'i> EnumVariantWithResolvedDiscriminant<'i> {
    fn try_from_parsed_list(
        items: impl IntoIterator<Item = SyntaxEnumVariant<'i>>,
    ) -> Result<Vec<Self>, DiscriminantResolutionError> {
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
                        return Err(DiscriminantResolutionError::Duplicated(*i));
                    }
                    previous = i;
                }
            }
        }

        Ok(mapped)
    }
}

#[derive(Debug)]
struct SyntaxEnumVariant<'i> {
    name: SyntaxIdentifier<'i>,
    discriminant: Option<u32>,
    content: Option<EitherStructOrTupleValues<'i>>,
}

impl<'i> TryFrom<Pair<'i, Rule>> for SyntaxEnumVariant<'i> {
    type Error = ParseErrorReport;

    fn try_from(pair: Pair<'i, Rule>) -> Result<Self, Self::Error> {
        match pair.as_rule() {
            Rule::enum_variant => {
                let span = &pair.as_span();
                let mut pairs = pair.into_inner();

                let first = pairs.next_or_report(|| span.into())?;
                let (name, content) = match first.as_rule() {
                    Rule::enum_variant_empty => {
                        let name = first
                            .into_inner()
                            .next_or_report(|| span.into())
                            .and_then(SyntaxIdentifier::try_from)?;
                        (name, None)
                    }
                    Rule::enum_variant_tuple => {
                        let span = &first.as_span();
                        let mut pairs = first.into_inner();
                        let name = pairs
                            .next_or_report(|| span.into())
                            .and_then(SyntaxIdentifier::try_from)?;

                        let values = TupleValues::try_from(pairs.next_or_report(|| span.into())?)?;

                        (name, Some(EitherStructOrTupleValues::Tuple(values)))
                    }
                    Rule::enum_variant_struct => {
                        let mut pairs = first.into_inner();
                        let name = pairs
                            .next_or_report(|| span.into())
                            .and_then(SyntaxIdentifier::try_from)?;

                        let values = StructValues::try_from(pairs.next_or_report(|| span.into())?)?;

                        (name, Some(EitherStructOrTupleValues::Struct(values)))
                    }
                    x => return ParseError::syntax_unexpected_rule(span.into(), x.into()).into(),
                };

                let discriminant = pairs
                    .next()
                    .map(|pair| match pair.as_rule() {
                        Rule::enum_discriminant => Ok(pair
                            .as_str()
                            .trim()
                            .parse::<u32>()
                            .map_err(|err| ParseError::syntax_invalid_integer((&pair).into(), err))
                            .report()
                            .attach_printable("failed to parse enum discriminant")),
                        x => {
                            ParseError::syntax_unexpected_rule(span.into(), x.into()).into_report()
                        }
                    })
                    .transpose()?
                    .transpose()?;

                Ok(Self {
                    name,
                    discriminant,
                    content,
                })
            }
            x => ParseError::syntax_unexpected_rule((&pair).into(), x.into()).into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pest::Parser;

    impl<'i> From<&'i str> for SyntaxIdentifier<'i> {
        fn from(value: &'i str) -> Self {
            SyntaxIdentifier(value)
        }
    }

    impl<'i> SyntaxTypeId<'i> {
        fn new(id: &'i str) -> Self {
            Self {
                id: SyntaxIdentifier(id),
                generics: Vec::new(),
            }
        }

        fn and(mut self, generic: SyntaxTypeId<'i>) -> Self {
            self.generics.push(generic);
            self
        }
    }

    fn assert_parsing(input: &str, expected: SyntaxNamespace) {
        let parsed = SyntaxParser::parse(Rule::main, input).wrap_err("failed to parse input")?;
        let actual = SyntaxNamespace::try_from(parsed).wrap_err("failed to map parsed data")?;

        assert_eq!(actual, expected);
    }

    fn assert_mapping_fails(input: &str) {
        let parsed = SyntaxParser::parse(Rule::main, input).wrap_err("failed to parse input")?;
        let _err = SyntaxNamespace::try_from(parsed)
            .err()
            .ok_or(eyre!("expect mapping to fail"))?;
    }

    #[test]
    fn struct_with_simple_refs() {
        assert_parsing(
            r#"
            struct Person {
                name: String,
                age: u8
            }
            "#,
            SyntaxNamespace {
                types: vec![SyntaxType::Struct(SyntaxStruct {
                    id: SyntaxTypeId::new("Person"),
                    content: EitherStructOrTupleValues::Struct(StructValues(vec![
                        NamedField {
                            name: "name".into(),
                            value: SyntaxValueType::Reference(SyntaxTypeId::new("String")),
                        },
                        NamedField {
                            name: "age".into(),
                            value: SyntaxValueType::Reference(SyntaxTypeId::new("u8")),
                        },
                    ])),
                })],
            },
        )
    }

    #[test]
    fn struct_with_generics() {
        assert_parsing(
            r#"
            struct Message<T, U> {
                content: T,
                user: Option<U>,
                parents: HashMap<Str, Str>
            }
            "#,
            SyntaxNamespace {
                types: vec![SyntaxType::Struct(SyntaxStruct {
                    id: SyntaxTypeId::new("Message")
                        .and(SyntaxTypeId::new("T"))
                        .and(SyntaxTypeId::new("U")),
                    content: EitherStructOrTupleValues::Struct(StructValues(vec![
                        NamedField {
                            name: "content".into(),
                            value: SyntaxValueType::Reference(SyntaxTypeId::new("T")),
                        },
                        NamedField {
                            name: "user".into(),
                            value: SyntaxValueType::Reference(
                                SyntaxTypeId::new("Option").and(SyntaxTypeId::new("U")),
                            ),
                        },
                        NamedField {
                            name: "parents".into(),
                            value: SyntaxValueType::Reference(
                                SyntaxTypeId::new("HashMap")
                                    .and(SyntaxTypeId::new("Str"))
                                    .and(SyntaxTypeId::new("Str")),
                            ),
                        },
                    ])),
                })],
            },
        )
    }

    #[test]
    fn tuple_struct() {
        assert_parsing(
            r#"
            struct BizarreTuple(u8, Str, Option<T>, [Option<T>; 45]);
            "#,
            SyntaxNamespace {
                types: vec![SyntaxType::Struct(SyntaxStruct {
                    id: SyntaxTypeId::new("BizarreTuple"),
                    content: EitherStructOrTupleValues::Tuple(TupleValues(vec![
                        SyntaxValueType::Reference(SyntaxTypeId::new("u8")),
                        SyntaxValueType::Reference(SyntaxTypeId::new("Str")),
                        SyntaxValueType::Reference(
                            SyntaxTypeId::new("Option").and(SyntaxTypeId::new("T")),
                        ),
                        SyntaxValueType::Array {
                            inner: Box::new(SyntaxValueType::Reference(
                                SyntaxTypeId::new("Option").and(SyntaxTypeId::new("T")),
                            )),
                            len: 45.try_into().unwrap(),
                        },
                    ])),
                })],
            },
        )
    }

    #[test]
    fn tuple_struct_with_generics() {
        assert_parsing(
            r#"
            struct NewType<T>(T);
            "#,
            SyntaxNamespace {
                types: vec![SyntaxType::Struct(SyntaxStruct {
                    id: SyntaxTypeId::new("NewType").and(SyntaxTypeId::new("T")),
                    content: EitherStructOrTupleValues::Tuple(TupleValues(vec![
                        SyntaxValueType::Reference(SyntaxTypeId::new("T")),
                    ])),
                })],
            },
        )
    }

    #[test]
    fn alias_simple() {
        assert_parsing(
            r#"
            type A = B;
            "#,
            SyntaxNamespace {
                types: vec![SyntaxType::Alias {
                    id: SyntaxTypeId::new("A"),
                    to: SyntaxValueType::Reference(SyntaxTypeId::new("B")),
                }],
            },
        )
    }

    #[test]
    fn alias_complex() {
        assert_parsing(
            r#"
            type A<T, U> = [Result<T, U>; 25];
            "#,
            SyntaxNamespace {
                types: vec![SyntaxType::Alias {
                    id: SyntaxTypeId::new("A")
                        .and(SyntaxTypeId::new("T"))
                        .and(SyntaxTypeId::new("U")),
                    to: SyntaxValueType::Array {
                        inner: Box::new(SyntaxValueType::Reference(
                            SyntaxTypeId::new("Result")
                                .and(SyntaxTypeId::new("T"))
                                .and(SyntaxTypeId::new("U")),
                        )),
                        len: 25.try_into().unwrap(),
                    },
                }],
            },
        )
    }

    #[test]
    fn multiple_types() {
        assert_parsing(
            r#"
            type A<T, U> = Map<T, U>;
            type B = A;
            struct A(B, C);
            "#,
            SyntaxNamespace {
                types: vec![
                    SyntaxType::Alias {
                        id: SyntaxTypeId::new("A")
                            .and(SyntaxTypeId::new("T"))
                            .and(SyntaxTypeId::new("U")),
                        to: SyntaxValueType::Reference(
                            SyntaxTypeId::new("Map")
                                .and(SyntaxTypeId::new("T"))
                                .and(SyntaxTypeId::new("U")),
                        ),
                    },
                    SyntaxType::Alias {
                        id: SyntaxTypeId::new("B"),
                        to: SyntaxValueType::Reference(SyntaxTypeId::new("A")),
                    },
                    SyntaxType::Struct(SyntaxStruct {
                        id: SyntaxTypeId::new("A"),
                        content: EitherStructOrTupleValues::Tuple(TupleValues(vec![
                            SyntaxValueType::Reference(SyntaxTypeId::new("B")),
                            SyntaxValueType::Reference(SyntaxTypeId::new("C")),
                        ])),
                    }),
                ],
            },
        )
    }

    #[test]
    fn generics_with_inner_generics() {
        assert_parsing(
            "type A = Option<Map<Option<Option<u8>>, Str>>;",
            SyntaxNamespace {
                types: vec![SyntaxType::Alias {
                    id: SyntaxTypeId::new("A"),
                    to: SyntaxValueType::Reference(
                        SyntaxTypeId::new("Option").and(
                            SyntaxTypeId::new("Map")
                                .and(
                                    SyntaxTypeId::new("Option").and(
                                        SyntaxTypeId::new("Option").and(SyntaxTypeId::new("u8")),
                                    ),
                                )
                                .and(SyntaxTypeId::new("Str")),
                        ),
                    ),
                }],
            },
        )
    }

    #[test]
    fn enum_with_different_variants() {
        assert_parsing(
            "enum Test { First, Second(u8, u9), Third { whatever: FooBar<T> } }",
            SyntaxNamespace {
                types: vec![SyntaxType::Enum(SyntaxEnum {
                    id: SyntaxTypeId::new("Test"),
                    variants: vec![
                        EnumVariantWithResolvedDiscriminant {
                            name: SyntaxIdentifier("First"),
                            discriminant: 0,
                            content: None,
                        },
                        EnumVariantWithResolvedDiscriminant {
                            name: SyntaxIdentifier("Second"),
                            discriminant: 1,
                            content: Some(EitherStructOrTupleValues::Tuple(TupleValues(vec![
                                SyntaxTypeId::new("u8").into(),
                                SyntaxTypeId::new("u9").into(),
                            ]))),
                        },
                        EnumVariantWithResolvedDiscriminant {
                            name: SyntaxIdentifier("Third"),
                            discriminant: 2,
                            content: Some(EitherStructOrTupleValues::Struct(StructValues(vec![
                                NamedField {
                                    name: SyntaxIdentifier("whatever"),
                                    value: SyntaxTypeId::new("FooBar")
                                        .and(SyntaxTypeId::new("T"))
                                        .into(),
                                },
                            ]))),
                        },
                    ],
                })],
            },
        )
    }

    #[test]
    fn enum_custom_discriminant() {
        assert_parsing(
            "enum Test { First, Second /* #_DISC = 5 */, Third }",
            SyntaxNamespace {
                types: vec![SyntaxType::Enum(SyntaxEnum {
                    id: SyntaxTypeId::new("Test"),
                    variants: vec![
                        EnumVariantWithResolvedDiscriminant {
                            name: SyntaxIdentifier("First"),
                            discriminant: 0,
                            content: None,
                        },
                        EnumVariantWithResolvedDiscriminant {
                            name: SyntaxIdentifier("Second"),
                            discriminant: 5,
                            content: None,
                        },
                        EnumVariantWithResolvedDiscriminant {
                            name: SyntaxIdentifier("Third"),
                            discriminant: 6,
                            content: None,
                        },
                    ],
                })],
            },
        )
    }

    #[test]
    fn enum_custom_discriminant_collision() {
        assert_mapping_fails(
            "
            enum SharedDiscriminantError {
                SharedA /* #_DISC = 1 */,
                SharedB /* #_DISC = 1 */
            }
            ",
        )
    }

    #[test]
    fn enum_custom_discriminant_collision_2() {
        assert_mapping_fails(
            "
            enum SharedDiscriminantError2 {
                Zero,
                One,
                OneToo /* #_DISC = 1 */
            }
            ",
        )
    }

    #[test]
    #[ignore = "todo"]
    fn array_with_wrong_len() {}
}
