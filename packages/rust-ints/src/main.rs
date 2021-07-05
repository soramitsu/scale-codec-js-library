use serde::Serialize;
use std::fmt::{Debug, Display};

#[derive(Debug, Serialize)]
struct IntEncodedInfo {
    decimal: String,
    bits: u32,
    signed: bool,
    le: String,
    be: String,
}

macro_rules! collect_encoded_info_as_vec {
    [$($num:expr),*] => {
        vec![$(collect_int_encoded_info($num)),*]
    };
}

fn main() {
    let nums: Vec<IntEncodedInfo> = collect_encoded_info_as_vec![
        0u8,
        0u16,
        0u32,
        0u64,
        0u128,
        0i8,
        0i16,
        0i32,
        0i64,
        0i128,
        -1i8,
        -1i16,
        -1i32,
        -1i64,
        -1i128,
        255u8,
        255u16,
        255u32,
        255u64,
        255u128,
        127i8,
        255i16,
        255i32,
        255i64,
        255i128,
        67u8,
        67u16,
        67u32,
        67u128,
        0x12345678u32,
        0x12345678i32,
        -0x12345678i32,
        0x12345678u64,
        -512i32,
        -226123i32,
        256u16,
        256i16,
        1234u32,
        -1234i32
    ];

    println!("{}", serde_json::to_string_pretty(&nums).unwrap());
}

mod generic_nums {
    pub struct IntMeta {
        pub bits: u32,
        pub signed: bool,
    }

    pub trait GenericInt {
        fn be(&self) -> Vec<u8>;
        fn le(&self) -> Vec<u8>;
        fn meta(&self) -> IntMeta;
    }

    macro_rules! impl_generic {
        ($int_uint:ty, $bits:expr, $signed:expr) => {
            impl GenericInt for $int_uint {
                fn be(&self) -> Vec<u8> {
                    self.to_be_bytes().into()
                }

                fn le(&self) -> Vec<u8> {
                    self.to_le_bytes().into()
                }

                fn meta(&self) -> IntMeta {
                    IntMeta {
                        bits: $bits,
                        signed: $signed,
                    }
                }
            }
        };
    }

    impl_generic!(u8, 8, false);
    impl_generic!(u16, 16, false);
    impl_generic!(u32, 32, false);
    impl_generic!(u64, 64, false);
    impl_generic!(u128, 128, false);
    impl_generic!(i8, 8, true);
    impl_generic!(i16, 16, true);
    impl_generic!(i32, 32, true);
    impl_generic!(i64, 64, true);
    impl_generic!(i128, 128, true);
}

fn to_hex(val: &Vec<u8>) -> String {
    let mut parts: Vec<String> = Vec::with_capacity(val.len());

    for byte in val {
        parts.push(format!("{:0>2x}", byte));
    }

    parts.join(" ")
}

use generic_nums::*;

fn collect_int_encoded_info<T: GenericInt + Display>(value: T) -> IntEncodedInfo {
    let IntMeta { bits, signed } = value.meta();

    IntEncodedInfo {
        decimal: format!("{}", value),
        bits,
        signed,
        le: to_hex(&value.le()),
        be: to_hex(&value.be()),
    }
}
