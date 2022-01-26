use parity_scale_codec::{Compact, Encode};
use serde::Serialize;
use std::env;
use std::fmt::{Debug, Display};

fn main() {
    match parse_args().unwrap() {
        RunCommand::Compact => compact::run(),
        RunCommand::Int => int::run(),
        RunCommand::String => string::run(),
    }
}

enum RunCommand {
    Int,
    Compact,
    String,
}

fn parse_args() -> Result<RunCommand, String> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        return Err("Expected one command: ints | compacts | strings".to_owned());
    }

    let command = &args[1];
    if command == "ints" {
        Ok(RunCommand::Int)
    } else if command == "compacts" {
        Ok(RunCommand::Compact)
    } else if command == "strings" {
        Ok(RunCommand::String)
    } else {
        Err(format!("Unknown command: {}", command))
    }
}

mod string {
    use super::*;

    #[derive(Debug, Serialize)]
    struct EncodedInfo {
        src: String,
        hex_pure: String,
        hex_scale: String,
    }

    pub fn run() {
        let items: Vec<&str> = vec![
            "Hello, world!",
            "Привет, мир!",
            "😀🥳👀🤦‍♂️",
            "日本語で何か",
            "中文的東西",
            r##""Припоминаю теперь, с каким жадным интересом я стал следить тогда за ихнею жизнью; такого интереса прежде не бывало. Я с нетерпением и с бранью ждал иногда Колю, когда сам становился так болен, что не мог выходить из комнаты. Я до того вникал во все мелочи, интересовался всякими слухами, что, кажется, сделался сплетником. Я не понимал, например, как эти люди, имея столько жизни, не умеют сделаться богачами (впрочем, не понимаю и теперь). Я знал одного бедняка, про которого мне потом рассказывали, что он умер с голоду, и, помню, это вывело меня из себя: если бы можно было этого бедняка оживить, я бы, кажется, казнил его. Мне иногда становилось легче на целые недели, и я мог выходить на улицу; но улица стала наконец производить во мне такое озлобление, что я по целым дням нарочно сидел взаперти, хотя и мог выходить, как и все. Я не мог выносить этого шныряющего, суетящегося, вечно озабоченного, угрюмого и встревоженного народа, который сновал около меня по тротуарам. К чему их вечная печаль, вечная их тревога и суета; вечная, угрюмая злость их (потому что они злы, злы, злы)? Кто виноват, что они несчастны и не умеют жить, имея впереди по шестидесяти лет жизни? Зачем Зарницын допустил себя умереть с голоду, имея у себя шестьдесят лет впереди? И каждый-то показывает свое рубище, свои рабочие руки, злится и кричит: «Мы работаем как волы, мы трудимся, мы голодны как собаки и бедны! Другие не работают и не трудятся, а они богаты!» (Вечный припев!) Рядом с ними бегает и суетится с утра до ночи какой-нибудь несчастный сморчок «из благородных», Иван Фомич Суриков, – в нашем доме, над нами живет, – вечно с продранными локтями, с обсыпавшимися пуговицами, у разных людей на посылках, по чьим-нибудь поручениям, да еще с утра до ночи. Разговоритесь с ним: «Беден, нищ и убог, умерла жена, лекарства купить было не на что, а зимой заморозили ребенка; старшая дочь на содержанье пошла…»; вечно хнычет, вечно плачется! О, никакой, никакой во мне не было жалости к этим дуракам, ни теперь, ни прежде, – я с гордостью это говорю! Зачем же он сам не Ротшильд? Кто виноват, что у него нет миллионов, как у Ротшильда, что у него нет горы золотых империалов и наполеондоров, такой горы, такой точно высокой горы, как на масленице под балаганами! Коли он живет, стало быть, всё в его власти! Кто виноват, что он этого не понимает?" ©"##,
            // https://www.w3.org/2001/06/utf-8-test/UTF-8-demo.html
            r#"
            Greek anthem
            Σὲ γνωρίζω ἀπὸ τὴν κόψη
            τοῦ σπαθιοῦ τὴν τρομερή,
            σὲ γνωρίζω ἀπὸ τὴν ὄψη
            ποὺ μὲ βία μετράει τὴ γῆ.
            "#,
            r#"
            Proverbs in the Amharic language:

            ሰማይ አይታረስ ንጉሥ አይከሰስ።
            ብላ ካለኝ እንደአባቴ በቆመጠኝ።
            ጌጥ ያለቤቱ ቁምጥና ነው።
            ደሀ በሕልሙ ቅቤ ባይጠጣ ንጣት በገደለው።
            የአፍ ወለምታ በቅቤ አይታሽም።
            አይጥ በበላ ዳዋ ተመታ።
            ሲተረጉሙ ይደረግሙ።
            ቀስ በቀስ፥ ዕንቁላል በእግሩ ይሄዳል።
            ድር ቢያብር አንበሳ ያስር።
            ሰው እንደቤቱ እንጅ እንደ ጉረቤቱ አይተዳደርም።
            እግዜር የከፈተውን ጉሮሮ ሳይዘጋው አይድርም።
            የጎረቤት ሌባ፥ ቢያዩት ይስቅ ባያዩት ያጠልቅ።
            ሥራ ከመፍታት ልጄን ላፋታት።
            ዓባይ ማደሪያ የለው፥ ግንድ ይዞ ይዞራል።
            የእስላም አገሩ መካ የአሞራ አገሩ ዋርካ።
            ተንጋሎ ቢተፉ ተመልሶ ባፉ።
            ወዳጅህ ማር ቢሆን ጨርስህ አትላሰው።
            እግርህን በፍራሽህ ልክ ዘርጋ።
            "#,
            r#"
            Mathematics and Sciences:

                ∮ E⋅da = Q,  n → ∞, ∑ f(i) = ∏ g(i), ∀x∈ℝ: ⌈x⌉ = −⌊−x⌋, α ∧ ¬β = ¬(¬α ∨ β),

                ℕ ⊆ ℕ₀ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ, ⊥ < a ≠ b ≡ c ≤ d ≪ ⊤ ⇒ (A ⇔ B),

                2H₂ + O₂ ⇌ 2H₂O, R = 4.7 kΩ, ⌀ 200 mm

            Linguistics and dictionaries:

                ði ıntəˈnæʃənəl fəˈnɛtık əsoʊsiˈeıʃn
                Y [ˈʏpsilɔn], Yen [jɛn], Yoga [ˈjoːgɑ]

                APL:

                ((V⍳V)=⍳⍴V)/V←,V    ⌷←⍳→⍴∆∇⊃‾⍎⍕⌈
            "#,
            "ᚻᛖ ᚳᚹᚫᚦ ᚦᚫᛏ ᚻᛖ ᛒᚢᛞᛖ ᚩᚾ ᚦᚫᛗ ᛚᚪᚾᛞᛖ ᚾᚩᚱᚦᚹᛖᚪᚱᛞᚢᛗ ᚹᛁᚦ ᚦᚪ ᚹᛖᛥᚫ",
            r#"
            ⡌⠁⠧⠑ ⠼⠁⠒  ⡍⠜⠇⠑⠹⠰⠎ ⡣⠕⠌

            ⡍⠜⠇⠑⠹ ⠺⠁⠎ ⠙⠑⠁⠙⠒ ⠞⠕ ⠃⠑⠛⠔ ⠺⠊⠹⠲ ⡹⠻⠑ ⠊⠎ ⠝⠕ ⠙⠳⠃⠞
            ⠱⠁⠞⠑⠧⠻ ⠁⠃⠳⠞ ⠹⠁⠞⠲ ⡹⠑ ⠗⠑⠛⠊⠌⠻ ⠕⠋ ⠙⠊⠎ ⠃⠥⠗⠊⠁⠇ ⠺⠁⠎
            ⠎⠊⠛⠝⠫ ⠃⠹ ⠹⠑ ⠊⠇⠻⠛⠹⠍⠁⠝⠂ ⠹⠑ ⠊⠇⠻⠅⠂ ⠹⠑ ⠥⠝⠙⠻⠞⠁⠅⠻⠂
            ⠁⠝⠙ ⠹⠑ ⠡⠊⠑⠋ ⠍⠳⠗⠝⠻⠲ ⡎⠊⠗⠕⠕⠛⠑ ⠎⠊⠛⠝⠫ ⠊⠞⠲ ⡁⠝⠙
            ⡎⠊⠗⠕⠕⠛⠑⠰⠎ ⠝⠁⠍⠑ ⠺⠁⠎ ⠛⠕⠕⠙ ⠥⠏⠕⠝ ⠰⡡⠁⠝⠛⠑⠂ ⠋⠕⠗ ⠁⠝⠹⠹⠔⠛ ⠙⠑ 
            ⠡⠕⠎⠑ ⠞⠕ ⠏⠥⠞ ⠙⠊⠎ ⠙⠁⠝⠙ ⠞⠕⠲

            ⡕⠇⠙ ⡍⠜⠇⠑⠹ ⠺⠁⠎ ⠁⠎ ⠙⠑⠁⠙ ⠁⠎ ⠁ ⠙⠕⠕⠗⠤⠝⠁⠊⠇⠲

            ⡍⠔⠙⠖ ⡊ ⠙⠕⠝⠰⠞ ⠍⠑⠁⠝ ⠞⠕ ⠎⠁⠹ ⠹⠁⠞ ⡊ ⠅⠝⠪⠂ ⠕⠋ ⠍⠹
            ⠪⠝ ⠅⠝⠪⠇⠫⠛⠑⠂ ⠱⠁⠞ ⠹⠻⠑ ⠊⠎ ⠏⠜⠞⠊⠊⠥⠇⠜⠇⠹ ⠙⠑⠁⠙ ⠁⠃⠳⠞
            ⠁ ⠙⠕⠕⠗⠤⠝⠁⠊⠇⠲ ⡊ ⠍⠊⠣⠞ ⠙⠁⠧⠑ ⠃⠑⠲ ⠔⠊⠇⠔⠫⠂ ⠍⠹⠎⠑⠇⠋⠂ ⠞⠕
            ⠗⠑⠛⠜⠙ ⠁ ⠊⠕⠋⠋⠔⠤⠝⠁⠊⠇ ⠁⠎ ⠹⠑ ⠙⠑⠁⠙⠑⠌ ⠏⠊⠑⠊⠑ ⠕⠋ ⠊⠗⠕⠝⠍⠕⠝⠛⠻⠹ 
            ⠔ ⠹⠑ ⠞⠗⠁⠙⠑⠲ ⡃⠥⠞ ⠹⠑ ⠺⠊⠎⠙⠕⠍ ⠕⠋ ⠳⠗ ⠁⠝⠊⠑⠌⠕⠗⠎ 
            ⠊⠎ ⠔ ⠹⠑ ⠎⠊⠍⠊⠇⠑⠆ ⠁⠝⠙ ⠍⠹ ⠥⠝⠙⠁⠇⠇⠪⠫ ⠙⠁⠝⠙⠎
            ⠩⠁⠇⠇ ⠝⠕⠞ ⠙⠊⠌⠥⠗⠃ ⠊⠞⠂ ⠕⠗ ⠹⠑ ⡊⠳⠝⠞⠗⠹⠰⠎ ⠙⠕⠝⠑ ⠋⠕⠗⠲ ⡹⠳
            ⠺⠊⠇⠇ ⠹⠻⠑⠋⠕⠗⠑ ⠏⠻⠍⠊⠞ ⠍⠑ ⠞⠕ ⠗⠑⠏⠑⠁⠞⠂ ⠑⠍⠏⠙⠁⠞⠊⠊⠁⠇⠇⠹⠂ ⠹⠁⠞
            ⡍⠜⠇⠑⠹ ⠺⠁⠎ ⠁⠎ ⠙⠑⠁⠙ ⠁⠎ ⠁ ⠙⠕⠕⠗⠤⠝⠁⠊⠇⠲
            "#,
        ];
        let items: Vec<EncodedInfo> = items
            .iter()
            .map(|s| EncodedInfo {
                src: s.to_string(),
                hex_pure: to_hex(&s.as_bytes().to_vec()),
                hex_scale: to_hex(&Encode::encode(s)),
            })
            .collect();

        println!("{}", serde_json::to_string_pretty(&items).unwrap());
    }
}

mod compact {
    use super::*;

    #[derive(Serialize)]
    struct EncodedInfo {
        num: String,
        hex: String,
    }

    pub fn run() {
        let nums: Vec<u128> = vec![
            0,
            u128::pow(2, 8 - 2) - 5,
            u128::pow(2, 14 - 2) - 5,
            u128::pow(2, 16 - 2) - 5,
            u128::pow(2, 24 - 2) - 5,
            u128::pow(2, 32 - 2) - 5,
            u128::pow(2, 40 - 2) - 5,
            u128::pow(2, 48 - 2) - 5,
            u128::pow(2, 64 - 2) - 5,
            u128::MAX,
        ];

        let info: Vec<EncodedInfo> = nums
            .iter()
            .map(|x| EncodedInfo {
                num: x.to_string(),
                hex: to_hex(&(Compact::from(*x).encode())),
            })
            .collect();

        println!("{}", serde_json::to_string_pretty(&info).unwrap());
    }
}

mod int {
    use super::*;
    use generic_nums::*;

    macro_rules! collect_encoded_info_as_vec {
        [$($num:expr),*] => {
            vec![$(collect_int_encoded_info($num)),*]
        };
    }

    pub fn run() {
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
            -1234i32,
            -123i64,
            u8::MAX,
            u16::MAX,
            u32::MAX,
            u64::MAX,
            u128::MAX,
            i8::MAX,
            i16::MAX,
            i32::MAX,
            i64::MAX,
            i128::MAX,
            i8::MIN,
            i16::MIN,
            i32::MIN,
            i64::MIN,
            i128::MIN
        ];

        println!("{}", serde_json::to_string_pretty(&nums).unwrap());
    }

    #[derive(Debug, Serialize)]
    struct IntEncodedInfo {
        decimal: String,
        bits: u32,
        signed: bool,
        le: String,
        be: String,
    }

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
}

fn to_hex(val: &Vec<u8>) -> String {
    let mut parts: Vec<String> = Vec::with_capacity(val.len());

    for byte in val {
        parts.push(format!("{:0>2x}", byte));
    }

    parts.join(" ")
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
