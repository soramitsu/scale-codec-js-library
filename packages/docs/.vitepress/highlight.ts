import { getHighlighter } from 'shiki'

// const htmlEscapes: Record<string, string> = {
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     '"': '&quot;',
//     "'": '&#39;',
// }

// function escapeHtml(html: string) {
//     return html.replace(/[&<>"']/g, (chr) => htmlEscapes[chr])
// }

const THEME = 'github-light'

export default async () => {
  const highlighter = await getHighlighter({
    themes: [THEME],
  })

  return (code: string, lang: string) => {
    const light = highlighter
      .codeToHtml(code, { lang, theme: THEME })
      .replace('<pre class="shiki"', '<pre v-pre class="shiki"')

    return light
  }
}
