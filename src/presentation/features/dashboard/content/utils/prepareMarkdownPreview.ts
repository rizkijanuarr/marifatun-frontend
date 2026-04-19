/**
 * Siapkan string untuk react-markdown: banyak LLM mengembalikan banyak baris `\n`
 * tanpa `\n\n`, sehingga seluruh isi jadi satu &lt;p&gt; (tembok teks).
 * Di sini baris tunggal dijadikan paragraf Markdown terpisah.
 */
export function prepareSourceForMarkdownPreview(raw: string): string {
  let t = raw.replace(/\r\n/g, '\n').trim();
  if (!t) return '';

  t = t.replace(/\n{3,}/g, '\n\n');

  if (/\n\n/.test(t)) {
    return t;
  }

  if (t.includes('\n')) {
    return t
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line, i, arr) => line.length > 0 || i < arr.length - 1)
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  return t;
}
