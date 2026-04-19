import removeMd from 'remove-markdown';

/** Deteksi kemungkinan HTML dari LLM / email. */
function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

/** HTML → teks polos (aman untuk clipboard, tanpa tag). */
export function stripHtmlToPlainText(html: string): string {
  const raw = html.trim();
  if (!raw) return '';
  if (typeof document !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(`<div>${raw}</div>`, 'text/html');
      const text = doc.body.textContent ?? '';
      return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    } catch {
      /* fall through */
    }
  }
  return raw
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type SceneRow = Record<string, unknown>;

/** Ekstrak objek JSON pertama yang seimbang (untuk respons LLM yang punya teks sebelum/sesudah JSON). */
function extractFirstJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function stripMarkdownJsonFence(s: string): string {
  const t = s.trim();
  const m = /^```(?:json)?\s*([\s\S]*?)\s*```$/iu.exec(t);
  return m ? m[1].trim() : t;
}

/**
 * Parse `result` skrip video: JSON murni, atau ada fence ```json, atau ada narasi sebelum `{...}`.
 */
export function parseVideoScriptPayload(raw: string): { scenes: SceneRow[] } | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;

  let t = stripMarkdownJsonFence(trimmed);

  const tryParse = (s: string): { scenes?: unknown[] } | null => {
    try {
      const o = JSON.parse(s) as { scenes?: unknown };
      if (o && typeof o === 'object' && Array.isArray(o.scenes) && o.scenes.length > 0) {
        return o as { scenes: unknown[] };
      }
    } catch {
      return null;
    }
    return null;
  };

  let p = tryParse(t);
  if (p) return { scenes: p.scenes as SceneRow[] };

  const extracted = extractFirstJsonObject(t);
  if (extracted) {
    p = tryParse(extracted);
    if (p) return { scenes: p.scenes as SceneRow[] };
  }

  return null;
}

function formatScenesPlainText(scenes: SceneRow[]): string {
  const lines: string[] = [];
  scenes.forEach((scene, i) => {
    lines.push(`--- Adegan ${String(scene.scene_number ?? i + 1)} (${String(scene.duration_seconds ?? '—')} dtk) ---`);
    lines.push(`Visual: ${String(scene.visual_description ?? '')}`);
    lines.push(`Teks layar: ${String(scene.on_screen_text ?? '')}`);
    lines.push(`Narasi: ${String(scene.voice_over ?? '')}`);
    lines.push(`Musik: ${String(scene.background_music ?? '')}`);
    lines.push(`Transisi: ${String(scene.transition ?? '')}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}

/**
 * Teks rapi untuk salin/unduh dari JSON skrip video (bukan Markdown).
 * Mengabaikan teks di luar JSON (mis. sisa instruksi LLM) jika masih ada objek `scenes` yang valid.
 */
export function formatVideoScriptPlainText(raw: string): string {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return '';
  const payload = parseVideoScriptPayload(trimmed);
  if (payload) return formatScenesPlainText(payload.scenes);
  return trimmed;
}

/** Ringkasan brief dari form (Bahasa Indonesia) — bukan template prompt bahasa Inggris ke LLM. */
export type VideoScriptExportBrief = {
  topic?: string | null;
  target_audience?: string | null;
  video_platform?: string | null;
  video_key_message?: string | null;
  video_cta?: string | null;
  tone?: string | null;
};

function platformLabelForExport(platform: string | null | undefined): string {
  if (!platform?.trim()) return '—';
  const p = platform.trim().toLowerCase();
  const map: Record<string, string> = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
  };
  return map[p] ?? platform.trim();
}

function briefHasAnyField(b: VideoScriptExportBrief): boolean {
  return Boolean(
    b.topic?.trim() ||
      b.target_audience?.trim() ||
      b.video_platform?.trim() ||
      b.video_key_message?.trim() ||
      b.video_cta?.trim() ||
      b.tone?.trim(),
  );
}

/**
 * Salin/ekspor: optional BRIEF (metadata konten) + blok adegan yang sama seperti di UI.
 */
export function formatVideoScriptWithBrief(raw: string, brief: VideoScriptExportBrief): string {
  const scenesText = formatVideoScriptPlainText(raw);
  if (!briefHasAnyField(brief)) return scenesText;

  const parts: string[] = [];
  parts.push('BRIEF');
  parts.push('=====');
  if (brief.topic?.trim()) parts.push(`Topik: ${brief.topic.trim()}`);
  if (brief.target_audience?.trim()) parts.push(`Target audiens: ${brief.target_audience.trim()}`);
  if (brief.video_platform?.trim()) parts.push(`Platform: ${platformLabelForExport(brief.video_platform)}`);
  if (brief.video_key_message?.trim()) parts.push(`Pesan utama: ${brief.video_key_message.trim()}`);
  if (brief.video_cta?.trim()) parts.push(`Call to action: ${brief.video_cta.trim()}`);
  if (brief.tone?.trim()) parts.push(`Nada: ${brief.tone.trim()}`);
  parts.push('');
  parts.push('SKRIP ADEGAN');
  parts.push('============');
  parts.push('');
  parts.push(scenesText);
  return parts.join('\n').trim();
}

export type FormatResultForClipboardOptions = {
  /** Untuk `video_script`: sertakan brief + skrip adegan (bukan raw JSON saja). */
  videoBrief?: VideoScriptExportBrief;
};

/** True jika string terlihat seperti JSON skrip video (mis. content_type hilang di respons). */
function looksLikeVideoScriptJson(raw: string): boolean {
  return /"scenes"\s*:\s*\[/i.test(raw);
}

export function formatResultForClipboard(
  raw: string,
  contentType: string,
  options?: FormatResultForClipboardOptions,
): string {
  let t = raw?.trim() ?? '';
  if (!t) return '';

  const treatAsVideoScript = contentType === 'video_script' || looksLikeVideoScriptJson(t);

  if (treatAsVideoScript) {
    const brief = options?.videoBrief;
    if (brief && briefHasAnyField(brief)) {
      return formatVideoScriptWithBrief(t, brief);
    }
    return formatVideoScriptPlainText(t);
  }

  if (looksLikeHtml(t)) {
    t = stripHtmlToPlainText(t);
  }

  /* Tautan Markdown → "teks (https://...)" sebelum strip, supaya URL tidak hilang saat posting */
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  t = removeMd(t, {
    gfm: true,
    stripListLeaders: false,
    replaceLinksWithURL: false,
    useImgAltText: true,
  });

  t = t.replace(/\r\n/g, '\n');
  t = t.replace(/[ \t]+\n/g, '\n');
  t = t.replace(/\n{3,}/g, '\n\n').trim();

  if (contentType === 'x' || contentType === 'thread') {
    t = t.replace(/[ \t]{2,}/g, ' ');
  }

  if (contentType === 'email_marketing') {
    t = t.replace(/\n\n\n+/g, '\n\n');
  }

  return t;
}

/** Nama file aman untuk unduhan .txt (topik + id singkat). */
export function buildExportTxtFilename(topic: string, id: string): string {
  const base = topic
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'content';
  const short = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12);
  return `${base}-${short}.txt`;
}

/** Unduh teks polos sebagai file .txt (tanpa server). */
export function downloadPlainTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Jumlah kata (dipisah whitespace), selaras dengan validasi backend MaxWords. */
export function countWords(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/u).length;
}
