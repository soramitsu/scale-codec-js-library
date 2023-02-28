import{_ as e,c as t,o as a,a as r}from"./app.d4652f87.js";const y=JSON.parse('{"title":"Module: @scale-codec/util","description":"","frontmatter":{},"headers":[{"level":2,"title":"Table of contents","slug":"table-of-contents","link":"#table-of-contents","children":[{"level":3,"title":"Functions","slug":"functions","link":"#functions","children":[]}]},{"level":2,"title":"Functions","slug":"functions-1","link":"#functions-1","children":[{"level":3,"title":"assert","slug":"assert","link":"#assert","children":[]},{"level":3,"title":"concatBytes","slug":"concatbytes","link":"#concatbytes","children":[]},{"level":3,"title":"fromHex","slug":"fromhex","link":"#fromhex","children":[]},{"level":3,"title":"mapGetUnwrap","slug":"mapgetunwrap","link":"#mapgetunwrap","children":[]},{"level":3,"title":"toHex","slug":"tohex","link":"#tohex","children":[]}]}],"relativePath":"api/modules/scale_codec_util.md"}'),s={name:"api/modules/scale_codec_util.md"},n=r(`<p><a href="./../">Scale JS</a> / @scale-codec/util</p><h1 id="module-scale-codec-util" tabindex="-1">Module: @scale-codec/util <a class="header-anchor" href="#module-scale-codec-util" aria-hidden="true">#</a></h1><p><code>@scale-codec/*</code> shared utility functions</p><h2 id="table-of-contents" tabindex="-1">Table of contents <a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a></h2><h3 id="functions" tabindex="-1">Functions <a class="header-anchor" href="#functions" aria-hidden="true">#</a></h3><ul><li><a href="./scale_codec_util.html#assert">assert</a></li><li><a href="./scale_codec_util.html#concatbytes">concatBytes</a></li><li><a href="./scale_codec_util.html#fromhex">fromHex</a></li><li><a href="./scale_codec_util.html#mapgetunwrap">mapGetUnwrap</a></li><li><a href="./scale_codec_util.html#tohex">toHex</a></li></ul><h2 id="functions-1" tabindex="-1">Functions <a class="header-anchor" href="#functions-1" aria-hidden="true">#</a></h2><h3 id="assert" tabindex="-1">assert <a class="header-anchor" href="#assert" aria-hidden="true">#</a></h3><p>▸ <strong>assert</strong>(<code>condition</code>, <code>message</code>): asserts condition</p><p>Good-old assert</p><h4 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-hidden="true">#</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th></tr></thead><tbody><tr><td style="text-align:left;"><code>condition</code></td><td style="text-align:left;"><code>unknown</code></td></tr><tr><td style="text-align:left;"><code>message</code></td><td style="text-align:left;"><code>string</code> | () =&gt; <code>string</code></td></tr></tbody></table><h4 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-hidden="true">#</a></h4><p>asserts condition</p><h4 id="defined-in" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in" aria-hidden="true">#</a></h4><p><a href="https://github.com/soramitsu/scale-codec-js-library/blob/aa2972c/packages/util/src/lib.ts#L9" target="_blank" rel="noreferrer">packages/util/src/lib.ts:9</a></p><hr><h3 id="concatbytes" tabindex="-1">concatBytes <a class="header-anchor" href="#concatbytes" aria-hidden="true">#</a></h3><p>▸ <strong>concatBytes</strong>(<code>iterable</code>): <code>Uint8Array</code></p><p>Creates a concatenated <code>Uint8Array</code> from the inputs.</p><h4 id="parameters-1" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-1" aria-hidden="true">#</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th></tr></thead><tbody><tr><td style="text-align:left;"><code>iterable</code></td><td style="text-align:left;"><code>Iterable</code>&lt;<code>Uint8Array</code>&gt; | <code>Uint8Array</code>[]</td></tr></tbody></table><h4 id="returns-1" tabindex="-1">Returns <a class="header-anchor" href="#returns-1" aria-hidden="true">#</a></h4><p><code>Uint8Array</code></p><h4 id="defined-in-1" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-1" aria-hidden="true">#</a></h4><p><a href="https://github.com/soramitsu/scale-codec-js-library/blob/aa2972c/packages/util/src/lib.ts#L18" target="_blank" rel="noreferrer">packages/util/src/lib.ts:18</a></p><hr><h3 id="fromhex" tabindex="-1">fromHex <a class="header-anchor" href="#fromhex" aria-hidden="true">#</a></h3><p>▸ <strong>fromHex</strong>(<code>hex</code>): <code>Uint8Array</code></p><p>Parses pretty space-separated hex into bytes</p><p><strong><code>Example</code></strong></p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#82AAFF;">fromHex</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">01 02 03</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">) </span><span style="color:#676E95;font-style:italic;">// new Uint8Array([1, 2, 3])</span></span>
<span class="line"></span></code></pre></div><h4 id="parameters-2" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-2" aria-hidden="true">#</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>hex</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;">Space-separated bytes in hex repr</td></tr></tbody></table><h4 id="returns-2" tabindex="-1">Returns <a class="header-anchor" href="#returns-2" aria-hidden="true">#</a></h4><p><code>Uint8Array</code></p><h4 id="defined-in-2" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-2" aria-hidden="true">#</a></h4><p><a href="https://github.com/soramitsu/scale-codec-js-library/blob/aa2972c/packages/util/src/lib.ts#L75" target="_blank" rel="noreferrer">packages/util/src/lib.ts:75</a></p><hr><h3 id="mapgetunwrap" tabindex="-1">mapGetUnwrap <a class="header-anchor" href="#mapgetunwrap" aria-hidden="true">#</a></h3><p>▸ <strong>mapGetUnwrap</strong>&lt;<code>K</code>, <code>V</code>&gt;(<code>map</code>, <code>key</code>): <code>V</code></p><p>Returns value from <code>map</code> by <code>key</code> and throws if there is no such key</p><h4 id="type-parameters" tabindex="-1">Type parameters <a class="header-anchor" href="#type-parameters" aria-hidden="true">#</a></h4><table><thead><tr><th style="text-align:left;">Name</th></tr></thead><tbody><tr><td style="text-align:left;"><code>K</code></td></tr><tr><td style="text-align:left;"><code>V</code></td></tr></tbody></table><h4 id="parameters-3" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-3" aria-hidden="true">#</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th></tr></thead><tbody><tr><td style="text-align:left;"><code>map</code></td><td style="text-align:left;"><code>Map</code>&lt;<code>K</code>, <code>V</code>&gt;</td></tr><tr><td style="text-align:left;"><code>key</code></td><td style="text-align:left;"><code>K</code></td></tr></tbody></table><h4 id="returns-3" tabindex="-1">Returns <a class="header-anchor" href="#returns-3" aria-hidden="true">#</a></h4><p><code>V</code></p><h4 id="defined-in-3" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-3" aria-hidden="true">#</a></h4><p><a href="https://github.com/soramitsu/scale-codec-js-library/blob/aa2972c/packages/util/src/lib.ts#L50" target="_blank" rel="noreferrer">packages/util/src/lib.ts:50</a></p><hr><h3 id="tohex" tabindex="-1">toHex <a class="header-anchor" href="#tohex" aria-hidden="true">#</a></h3><p>▸ <strong>toHex</strong>(<code>v</code>): <code>string</code></p><p>Makes pretty-hex from bytes array, like <code>01 a5 f0</code></p><p><strong><code>Example</code></strong></p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#82AAFF;">toHex</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">new</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">Uint8Array</span><span style="color:#A6ACCD;">([</span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">11</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;">])) </span><span style="color:#676E95;font-style:italic;">// &#39;01 a1 03&#39;</span></span>
<span class="line"></span></code></pre></div><h4 id="parameters-4" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-4" aria-hidden="true">#</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th></tr></thead><tbody><tr><td style="text-align:left;"><code>v</code></td><td style="text-align:left;"><code>Uint8Array</code></td></tr></tbody></table><h4 id="returns-4" tabindex="-1">Returns <a class="header-anchor" href="#returns-4" aria-hidden="true">#</a></h4><p><code>string</code></p><h4 id="defined-in-4" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-4" aria-hidden="true">#</a></h4><p><a href="https://github.com/soramitsu/scale-codec-js-library/blob/aa2972c/packages/util/src/lib.ts#L63" target="_blank" rel="noreferrer">packages/util/src/lib.ts:63</a></p>`,62),l=[n];function d(c,o,i,h,p,f){return a(),t("div",null,l)}const b=e(s,[["render",d]]);export{y as __pageData,b as default};
