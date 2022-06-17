import{_ as s,c as n,o as a,a as l}from"./app.aaf606c4.js";var p="/scale-codec-js-library/assets/logger-output-cli.61c94fbd.png",o="/scale-codec-js-library/assets/logger-output-devtools.f332119f.png";const f='{"title":"Compiler","description":"","frontmatter":{},"headers":[{"level":2,"title":"Runtime","slug":"runtime"},{"level":2,"title":"Compiler","slug":"compiler-1"},{"level":3,"title":"Example: schema & compiled output","slug":"example-schema-compiled-output"},{"level":2,"title":"Predefined Builders","slug":"predefined-builders"},{"level":2,"title":"Debugging","slug":"debugging"},{"level":3,"title":"Custom Trackers","slug":"custom-trackers"},{"level":3,"title":"Possible questions","slug":"possible-questions"},{"level":2,"title":"Also","slug":"also"}],"relativePath":"guide/compiler.md"}',e={},c=l(`<h1 id="compiler" tabindex="-1">Compiler <a class="header-anchor" href="#compiler" aria-hidden="true">#</a></h1><div class="info custom-block"><p class="custom-block-title">INFO</p><p>Design of this part of the library is still debatable. If you have any suggestions, <a href="https://github.com/soramitsu/scale-codec-js-library/issues" target="_blank" rel="noopener noreferrer">you are welcome</a>!</p></div><h2 id="runtime" tabindex="-1">Runtime <a class="header-anchor" href="#runtime" aria-hidden="true">#</a></h2><p>It is a wrapper around <a href="./core.html">Core</a> library that provides:</p><ul><li><code>Codec</code>s, that are a combination of encode &amp; decode and some sugar</li><li>Optional tracking functionality for debugging purposes.</li><li><a href="#predefined-builders">Predefined</a> non-parametrized codecs, such as <code>Str</code>, <code>Bool</code> etc</li></ul><p>Available on NPM:</p><div class="language-bash"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#24292F;">npm i @scale-codec/definition-runtime</span></span>
<span class="line"></span></code></pre></div><h2 id="compiler-1" tabindex="-1">Compiler <a class="header-anchor" href="#compiler-1" aria-hidden="true">#</a></h2><p>The main usa case for SCALE is to use type schema from Rust in another language, in our case in JavaScript. Compiler receives such schema and generates TypeScript code that is compatible with Runtime package.</p><p>The package is vailable on NPM:</p><div class="language-bash"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#24292F;">npm i --save-dev @scale-codec/definition-compiler</span></span>
<span class="line"></span></code></pre></div><h3 id="example-schema-compiled-output" tabindex="-1">Example: schema &amp; compiled output <a class="header-anchor" href="#example-schema-compiled-output" aria-hidden="true">#</a></h3><p><strong>Rust types definition:</strong></p><div class="language-rust"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#6E7781;">// struct</span></span>
<span class="line"><span style="color:#CF222E;">struct</span><span style="color:#24292F;"> </span><span style="color:#953800;">Person</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">    name</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">String</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    age</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">u8</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    document</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonDocument</span></span>
<span class="line"><span style="color:#24292F;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// enum</span></span>
<span class="line"><span style="color:#CF222E;">enum</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonDocument</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#8250DF;">Id</span><span style="color:#24292F;">(</span><span style="color:#953800;">u8</span><span style="color:#24292F;">),</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#8250DF;">Passport</span><span style="color:#24292F;">(</span><span style="color:#953800;">Passport</span><span style="color:#24292F;">)</span></span>
<span class="line"><span style="color:#24292F;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// tuple of passport nums</span></span>
<span class="line"><span style="color:#CF222E;">struct</span><span style="color:#24292F;"> </span><span style="color:#953800;">Passport</span><span style="color:#24292F;">(</span><span style="color:#953800;">u32</span><span style="color:#24292F;">, </span><span style="color:#953800;">u32</span><span style="color:#24292F;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Map</span></span>
<span class="line"><span style="color:#CF222E;">type</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonsMap</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#953800;">HashMap</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">u8</span><span style="color:#24292F;">, </span><span style="color:#953800;">Person</span><span style="color:#24292F;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Vec</span></span>
<span class="line"><span style="color:#CF222E;">type</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonsVec</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#953800;">Vec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Person</span><span style="color:#24292F;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">struct</span><span style="color:#24292F;"> </span><span style="color:#953800;">PublicKey</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#6E7781;">    // Fixed-len array</span></span>
<span class="line"><span style="color:#24292F;">    payload</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> [</span><span style="color:#953800;">u8</span><span style="color:#24292F;">; </span><span style="color:#0550AE;">32</span><span style="color:#24292F;">]</span></span>
<span class="line"><span style="color:#24292F;">}</span></span>
<span class="line"></span></code></pre></div><p><strong>Definition for Compiler:</strong></p><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> { NamespaceDefinition } </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-compiler&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">schema</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">NamespaceDefinition</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">  Person: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;struct&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    fields: [</span></span>
<span class="line"><span style="color:#24292F;">      {</span></span>
<span class="line"><span style="color:#24292F;">        name: </span><span style="color:#0A3069;">&#39;name&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        ref: </span><span style="color:#0A3069;">&#39;Str&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">      },</span></span>
<span class="line"><span style="color:#24292F;">      {</span></span>
<span class="line"><span style="color:#24292F;">        name: </span><span style="color:#0A3069;">&#39;age&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        ref: </span><span style="color:#0A3069;">&#39;U8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">      },</span></span>
<span class="line"><span style="color:#24292F;">      {</span></span>
<span class="line"><span style="color:#24292F;">        name: </span><span style="color:#0A3069;">&#39;document&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        ref: </span><span style="color:#0A3069;">&#39;PersonDocument&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">      },</span></span>
<span class="line"><span style="color:#24292F;">    ],</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">  PersonDocument: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;enum&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    variants: [</span></span>
<span class="line"><span style="color:#24292F;">      {</span></span>
<span class="line"><span style="color:#24292F;">        name: </span><span style="color:#0A3069;">&#39;Id&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        discriminant: </span><span style="color:#0550AE;">0</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        ref: </span><span style="color:#0A3069;">&#39;U8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">      },</span></span>
<span class="line"><span style="color:#24292F;">      {</span></span>
<span class="line"><span style="color:#24292F;">        name: </span><span style="color:#0A3069;">&#39;Passport&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        discriminant: </span><span style="color:#0550AE;">1</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        ref: </span><span style="color:#0A3069;">&#39;Passport&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">      },</span></span>
<span class="line"><span style="color:#24292F;">    ],</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">  Passport: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;tuple&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    items: [</span><span style="color:#0A3069;">&#39;U32&#39;</span><span style="color:#24292F;">, </span><span style="color:#0A3069;">&#39;U32&#39;</span><span style="color:#24292F;">],</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">  PersonsMap: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;map&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    key: </span><span style="color:#0A3069;">&#39;U8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    value: </span><span style="color:#0A3069;">&#39;Person&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">  PersonsVec: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;vec&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    item: </span><span style="color:#0A3069;">&#39;Person&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">  PublicKey: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;struct&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    fields: [</span></span>
<span class="line"><span style="color:#24292F;">      {</span></span>
<span class="line"><span style="color:#24292F;">        name: </span><span style="color:#0A3069;">&#39;payload&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        ref: </span><span style="color:#0A3069;">&#39;Array_u8_32&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">      },</span></span>
<span class="line"><span style="color:#24292F;">    ],</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">  Array_u8_32: {</span></span>
<span class="line"><span style="color:#24292F;">    t: </span><span style="color:#0A3069;">&#39;array&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    item: </span><span style="color:#0A3069;">&#39;U8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">    len: </span><span style="color:#0550AE;">32</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">export</span><span style="color:#953800;"> </span><span style="color:#CF222E;">default</span><span style="color:#953800;"> </span><span style="color:#24292F;">schema</span></span>
<span class="line"></span></code></pre></div><p><strong>Compilation code:</strong></p><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> { renderNamespaceDefinition } </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-compiler&#39;</span></span>
<span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> schema </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;./schema&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">code</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">renderNamespaceDefinition</span><span style="color:#24292F;">(schema)</span></span>
<span class="line"><span style="color:#24292F;">console.</span><span style="color:#8250DF;">log</span><span style="color:#24292F;">(code)</span></span>
<span class="line"></span></code></pre></div><p><strong>Compiled output:</strong></p><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> { Enum, Str, U32, U8, createArrayCodec, createEnumCodec, createMapCodec, createStructCodec, createTupleCodec, createVecCodec, dynCodec } </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-runtime&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">type</span><span style="color:#24292F;"> { ArrayCodecAndFactory, EnumCodecAndFactory, MapCodecAndFactory, Opaque, StructCodecAndFactory } </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-runtime&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Dynamic codecs</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">__dyn_PersonDocument</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">dynCodec</span><span style="color:#24292F;">(() </span><span style="color:#CF222E;">=&gt;</span><span style="color:#24292F;"> PersonDocument)</span></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">__dyn_Passport</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">dynCodec</span><span style="color:#24292F;">(() </span><span style="color:#CF222E;">=&gt;</span><span style="color:#24292F;"> Passport)</span></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">__dyn_Person</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">dynCodec</span><span style="color:#24292F;">(() </span><span style="color:#CF222E;">=&gt;</span><span style="color:#24292F;"> Person)</span></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">__dyn_Array_u8_32</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">dynCodec</span><span style="color:#24292F;">(() </span><span style="color:#CF222E;">=&gt;</span><span style="color:#24292F;"> Array_u8_32)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: Array_u8_32</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">Array_u8_32__actual</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Array</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">U8</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">Array_u8_32</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Array_u8_32__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Array_u8_32</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Array_u8_32</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">ArrayCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Array_u8_32__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Array_u8_32</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createArrayCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Array_u8_32__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Array_u8_32</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;Array_u8_32&#39;</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">U8</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">32</span><span style="color:#24292F;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: Passport</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">type</span><span style="color:#24292F;"> </span><span style="color:#953800;">Passport__actual</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> [</span><span style="color:#953800;">U32</span><span style="color:#24292F;">, </span><span style="color:#953800;">U32</span><span style="color:#24292F;">]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">Passport</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Passport__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Passport</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Passport</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">ArrayCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Passport__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Passport</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createTupleCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Passport__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Passport</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;Passport&#39;</span><span style="color:#24292F;">, [</span><span style="color:#0550AE;">U32</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">U32</span><span style="color:#24292F;">])</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: Person</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">Person__actual</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#953800;">name</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">Str</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#953800;">age</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">U8</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#953800;">document</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonDocument</span></span>
<span class="line"><span style="color:#24292F;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">Person</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Person__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Person</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Person</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">StructCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Person__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Person</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createStructCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">Person__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">Person</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;Person&#39;</span><span style="color:#24292F;">, [</span></span>
<span class="line"><span style="color:#24292F;">    [</span><span style="color:#0A3069;">&#39;name&#39;</span><span style="color:#24292F;">, Str],</span></span>
<span class="line"><span style="color:#24292F;">    [</span><span style="color:#0A3069;">&#39;age&#39;</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">U8</span><span style="color:#24292F;">],</span></span>
<span class="line"><span style="color:#24292F;">    [</span><span style="color:#0A3069;">&#39;document&#39;</span><span style="color:#24292F;">, __dyn_PersonDocument]</span></span>
<span class="line"><span style="color:#24292F;">])</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: PersonDocument</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">type</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonDocument__actual</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#953800;">Enum</span><span style="color:#24292F;">&lt;</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#CF222E;">|</span><span style="color:#24292F;"> [</span><span style="color:#0A3069;">&#39;Id&#39;</span><span style="color:#24292F;">, </span><span style="color:#953800;">U8</span><span style="color:#24292F;">]</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#CF222E;">|</span><span style="color:#24292F;"> [</span><span style="color:#0A3069;">&#39;Passport&#39;</span><span style="color:#24292F;">, </span><span style="color:#953800;">Passport</span><span style="color:#24292F;">]</span></span>
<span class="line"><span style="color:#24292F;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonDocument</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonDocument__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonDocument</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">PersonDocument</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">EnumCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonDocument</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createEnumCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonDocument__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonDocument</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;PersonDocument&#39;</span><span style="color:#24292F;">, [</span></span>
<span class="line"><span style="color:#24292F;">    [</span><span style="color:#0550AE;">0</span><span style="color:#24292F;">, </span><span style="color:#0A3069;">&#39;Id&#39;</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">U8</span><span style="color:#24292F;">],</span></span>
<span class="line"><span style="color:#24292F;">    [</span><span style="color:#0550AE;">1</span><span style="color:#24292F;">, </span><span style="color:#0A3069;">&#39;Passport&#39;</span><span style="color:#24292F;">, __dyn_Passport]</span></span>
<span class="line"><span style="color:#24292F;">])</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: PersonsMap</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">type</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonsMap__actual</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#953800;">Map</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">U8</span><span style="color:#24292F;">, </span><span style="color:#953800;">Person</span><span style="color:#24292F;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonsMap</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonsMap__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonsMap</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">PersonsMap</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">MapCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonsMap__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonsMap</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createMapCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonsMap__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonsMap</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;PersonsMap&#39;</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">U8</span><span style="color:#24292F;">, __dyn_Person)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: PersonsVec</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">type</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonsVec__actual</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#953800;">Person</span><span style="color:#24292F;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">PersonsVec</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonsVec__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonsVec</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">PersonsVec</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">ArrayCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonsVec__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonsVec</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createVecCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PersonsVec__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PersonsVec</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;PersonsVec&#39;</span><span style="color:#24292F;">, __dyn_Person)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Type: PublicKey</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">PublicKey__actual</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#953800;">payload</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">Array_u8_32</span></span>
<span class="line"><span style="color:#24292F;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">interface</span><span style="color:#24292F;"> </span><span style="color:#953800;">PublicKey</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">extends</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Opaque</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PublicKey__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PublicKey</span><span style="color:#24292F;">&gt; {}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">PublicKey</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">StructCodecAndFactory</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PublicKey__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PublicKey</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createStructCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#953800;">PublicKey__actual</span><span style="color:#24292F;">, </span><span style="color:#953800;">PublicKey</span><span style="color:#24292F;">&gt;(</span><span style="color:#0A3069;">&#39;PublicKey&#39;</span><span style="color:#24292F;">, [</span></span>
<span class="line"><span style="color:#24292F;">    [</span><span style="color:#0A3069;">&#39;payload&#39;</span><span style="color:#24292F;">, __dyn_Array_u8_32]</span></span>
<span class="line"><span style="color:#24292F;">])</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Exports</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">export</span><span style="color:#24292F;"> { Array_u8_32, Passport, Person, PersonDocument, PersonsMap, PersonsVec, PublicKey }</span></span></code></pre></div><p>Now the code is usable, and its execution depends on you!</p><h2 id="predefined-builders" tabindex="-1">Predefined Builders <a class="header-anchor" href="#predefined-builders" aria-hidden="true">#</a></h2><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#6E7781;">/**</span></span>
<span class="line"><span style="color:#6E7781;"> * Set of types defined in the \`@scale-codec/definition-runtime\`</span></span>
<span class="line"><span style="color:#6E7781;"> */</span></span>
<span class="line"><span style="color:#CF222E;">export</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">DefaultAvailableBuilders</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">new</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Set</span><span style="color:#24292F;">([</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;Str&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;Bool&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;Void&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;Compact&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;VecU8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;U8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;U16&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;U32&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;U64&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;U128&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;I8&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;I16&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;I32&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;I64&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#0A3069;">&#39;I128&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">])</span></span>
<span class="line"></span></code></pre></div><p>These builders <strong>defined</strong> at Runtime and Compiler <strong>knows</strong> about them. Anyway, you can customize both runtime lib and known types (see <a href="/scale-codec-js-library/api/definition-compiler.rendernamespacedefinitionparams.html">rendering params at API section</a>).</p><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> { Str } </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-runtime&#39;</span></span>
<span class="line"></span></code></pre></div><h2 id="debugging" tabindex="-1">Debugging <a class="header-anchor" href="#debugging" aria-hidden="true">#</a></h2><p><code>@scale-codec/definition-runtime</code> provides special Tracking API and one of its possible implementations - Logger. With it, you can enable logging of decode process and/or decode failures. Its usage may look like this:</p><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">  Enum,</span></span>
<span class="line"><span style="color:#24292F;">  EnumCodec,</span></span>
<span class="line"><span style="color:#24292F;">  Logger,</span></span>
<span class="line"><span style="color:#24292F;">  Str,</span></span>
<span class="line"><span style="color:#24292F;">  StructCodec,</span></span>
<span class="line"><span style="color:#24292F;">  U8,</span></span>
<span class="line"><span style="color:#24292F;">  createEnumCodec,</span></span>
<span class="line"><span style="color:#24292F;">  createStructCodec,</span></span>
<span class="line"><span style="color:#24292F;">} </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-runtime&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Codecs</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Gender</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">EnumCodec</span><span style="color:#24292F;">&lt;</span><span style="color:#0A3069;">&#39;Male&#39;</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">|</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;Female&#39;</span><span style="color:#24292F;">&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createEnumCodec</span><span style="color:#24292F;">(</span><span style="color:#0A3069;">&#39;Gender&#39;</span><span style="color:#24292F;">, [</span></span>
<span class="line"><span style="color:#24292F;">  [</span><span style="color:#0550AE;">0</span><span style="color:#24292F;">, </span><span style="color:#0A3069;">&#39;Male&#39;</span><span style="color:#24292F;">],</span></span>
<span class="line"><span style="color:#24292F;">  [</span><span style="color:#0550AE;">1</span><span style="color:#24292F;">, </span><span style="color:#0A3069;">&#39;Female&#39;</span><span style="color:#24292F;">],</span></span>
<span class="line"><span style="color:#24292F;">])</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">Person</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#953800;">StructCodec</span><span style="color:#24292F;">&lt;{</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#953800;">name</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">typeof</span><span style="color:#24292F;"> Str</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#953800;">age</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">typeof</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">U8</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#953800;">gender</span><span style="color:#CF222E;">:</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">typeof</span><span style="color:#24292F;"> Gender</span></span>
<span class="line"><span style="color:#24292F;">}&gt; </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">createStructCodec</span><span style="color:#24292F;">(</span><span style="color:#0A3069;">&#39;Person&#39;</span><span style="color:#24292F;">, [</span></span>
<span class="line"><span style="color:#24292F;">  [</span><span style="color:#0A3069;">&#39;name&#39;</span><span style="color:#24292F;">, Str],</span></span>
<span class="line"><span style="color:#24292F;">  [</span><span style="color:#0A3069;">&#39;age&#39;</span><span style="color:#24292F;">, </span><span style="color:#0550AE;">U8</span><span style="color:#24292F;">],</span></span>
<span class="line"><span style="color:#24292F;">  [</span><span style="color:#0A3069;">&#39;gender&#39;</span><span style="color:#24292F;">, Gender],</span></span>
<span class="line"><span style="color:#24292F;">])</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6E7781;">// Act</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">new</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">Logger</span><span style="color:#24292F;">({</span></span>
<span class="line"><span style="color:#24292F;">  logDecodeSuccesses: </span><span style="color:#0550AE;">true</span><span style="color:#24292F;">,</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#6E7781;">// default</span></span>
<span class="line"><span style="color:#24292F;">  logDecodeErrors: </span><span style="color:#0550AE;">true</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">}).</span><span style="color:#8250DF;">mount</span><span style="color:#24292F;">()</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CF222E;">const</span><span style="color:#24292F;"> </span><span style="color:#0550AE;">buff</span><span style="color:#24292F;"> </span><span style="color:#CF222E;">=</span><span style="color:#24292F;"> Person.</span><span style="color:#8250DF;">toBuffer</span><span style="color:#24292F;">({</span></span>
<span class="line"><span style="color:#24292F;">  name: </span><span style="color:#0A3069;">&#39;John&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  age: </span><span style="color:#0550AE;">55</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">  gender: Enum.</span><span style="color:#8250DF;">variant</span><span style="color:#24292F;">(</span><span style="color:#0A3069;">&#39;Male&#39;</span><span style="color:#24292F;">),</span></span>
<span class="line"><span style="color:#24292F;">})</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292F;">Person.</span><span style="color:#8250DF;">fromBuffer</span><span style="color:#24292F;">(buff)</span></span>
<span class="line"></span></code></pre></div><p>Output in CLI:</p><p><img src="`+p+'" alt=""></p><p>Output in Browser DevTools:</p><p><img src="'+o+`" alt=""></p><h3 id="custom-trackers" tabindex="-1">Custom Trackers <a class="header-anchor" href="#custom-trackers" aria-hidden="true">#</a></h3><p>You can use Tracking API to implement any logic you need. Example of usage:</p><div class="language-ts"><pre class="shiki" style="background-color:#ffffff;"><code><span class="line"><span style="color:#CF222E;">import</span><span style="color:#24292F;"> { setCurrentTracker } </span><span style="color:#CF222E;">from</span><span style="color:#24292F;"> </span><span style="color:#0A3069;">&#39;@scale-codec/definition-runtime&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#8250DF;">setCurrentTracker</span><span style="color:#24292F;">({</span></span>
<span class="line"><span style="color:#24292F;">  </span><span style="color:#8250DF;">decode</span><span style="color:#24292F;">(</span><span style="color:#953800;">loc</span><span style="color:#24292F;">, </span><span style="color:#953800;">walker</span><span style="color:#24292F;">, </span><span style="color:#953800;">decode</span><span style="color:#24292F;">) {</span></span>
<span class="line"><span style="color:#24292F;">    </span><span style="color:#CF222E;">try</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">      console.</span><span style="color:#8250DF;">log</span><span style="color:#24292F;">(</span></span>
<span class="line"><span style="color:#24292F;">        </span><span style="color:#0A3069;">&#39;Decode location: %s. Walker idx: %s&#39;</span><span style="color:#24292F;">,</span></span>
<span class="line"><span style="color:#24292F;">        loc,</span></span>
<span class="line"><span style="color:#24292F;">        walker.idx,</span></span>
<span class="line"><span style="color:#24292F;">      )</span></span>
<span class="line"><span style="color:#24292F;">      </span><span style="color:#CF222E;">return</span><span style="color:#24292F;"> </span><span style="color:#8250DF;">decode</span><span style="color:#24292F;">(walker)</span></span>
<span class="line"><span style="color:#24292F;">    } </span><span style="color:#CF222E;">catch</span><span style="color:#24292F;"> (err) {</span></span>
<span class="line"><span style="color:#24292F;">      </span><span style="color:#CF222E;">debugger</span></span>
<span class="line"><span style="color:#24292F;">    } </span><span style="color:#CF222E;">finally</span><span style="color:#24292F;"> {</span></span>
<span class="line"><span style="color:#24292F;">      console.</span><span style="color:#8250DF;">log</span><span style="color:#24292F;">(</span><span style="color:#0A3069;">&#39;Walker idx then: %s&#39;</span><span style="color:#24292F;">, walker.idx)</span></span>
<span class="line"><span style="color:#24292F;">    }</span></span>
<span class="line"><span style="color:#24292F;">  },</span></span>
<span class="line"><span style="color:#24292F;">})</span></span>
<span class="line"></span></code></pre></div><h3 id="possible-questions" tabindex="-1">Possible questions <a class="header-anchor" href="#possible-questions" aria-hidden="true">#</a></h3><ul><li><p>Is there any runtime overhead if I don&#39;t use tracking?</p><p>Yes, there is some, but it is reduced as possible.</p></li><li><p>Is <code>Logger</code> tree-shakable?</p><p>Yes, it is.</p></li><li><p>Why encoding is not tracked?</p><p>There was no any reason to do so yet. It is possible to implement.</p></li></ul><h2 id="also" tabindex="-1">Also <a class="header-anchor" href="#also" aria-hidden="true">#</a></h2><ul><li><a href="./../api/definition-runtime.html">Runtime&#39;s API</a></li><li><a href="./../api/definition-compiler.html">Compiler&#39;s API</a></li><li><a href="https://github.com/polkadot-js/api/tree/master/packages/types" target="_blank" rel="noopener noreferrer">@polkadot/types</a> - another implementation of SCALE codec with a different namespaces approach</li><li><a href="https://www.npmjs.com/package/@josepot/ts-scale-codec" target="_blank" rel="noopener noreferrer">ts-scale-codec</a>- another lightweight implementation of SCALE</li><li><a href="https://protobufjs.github.io/protobuf.js/index.html" target="_blank" rel="noopener noreferrer">Protobuf.js</a> - implementation not of SCALE, but of Protobuf spec. Their specs have a lot in common.</li></ul>`,39),t=[c];function r(y,i,F,d,u,E){return a(),n("div",null,t)}var C=s(e,[["render",r]]);export{f as __pageData,C as default};
