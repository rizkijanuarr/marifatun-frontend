import type { ContentTypeId } from '../Model/ContentModel';

/**
 * Contoh brief per tipe konten — dipakai tombol "isi template" di modal buat konten.
 * Teks berbahasa Indonesia (sumber); UI bisa bilingual lewat i18n terpisah jika perlu.
 */
export type BriefTemplateFill = {
  tone: string;
  keywords: string;
  target_audience: string;
  topic: string;
  video_platform?: string;
  video_key_message?: string;
  video_cta?: string;
};

export const BRIEF_TEMPLATES: Record<ContentTypeId, BriefTemplateFill> = {
  linkedin: {
    tone: 'professional',
    keywords: 'personal branding, leadership, insight',
    target_audience: 'Profesional Muslim, founder, dan decision maker',
    topic:
      'Refleksi singkat: bagaimana konsistensi kecil (baca 10 menit, satu ayat) membangun kredibilitas profesional di LinkedIn tanpa terlihat berlebihan.',
  },
  x: {
    tone: 'casual',
    keywords: 'tips, produktif, fokus',
    target_audience: 'Pekerja remote, kreator konten, founder early-stage',
    topic:
      '3 hal kecil yang bisa mengubah fokus kerja di hari sibuk — versi ringkas, actionable, tanpa jargon.',
  },
  thread: {
    tone: 'friendly',
    keywords: 'storytelling, habit, komunitas',
    target_audience: 'Komunitas Muslim muda dan pembaca Threads',
    topic:
      'Struktur thread: masalah yang relatable → satu insight → satu langkah kecil yang bisa dicoba hari ini (dengan contoh singkat).',
  },
  facebook: {
    tone: 'friendly',
    keywords: 'komunitas, keluarga, edukasi',
    target_audience: 'Orang tua, pendidik, dan pengurus komunitas',
    topic:
      'Cerita singkat tentang membangun rutinitas belajar yang menyenangkan untuk anak, tanpa tekanan dan tetap konsisten.',
  },
  email_marketing: {
    tone: 'persuasive',
    keywords: 'newsletter, onboarding, welcome',
    target_audience: 'Pelanggan baru yang baru mendaftar newsletter',
    topic:
      'Email pembuka: sambutan hangat, satu manfaat utama berlangganan, dan satu ajakan kecil (mis. membaca artikel pendek atau mengikuti panduan).',
  },
  video_script: {
    tone: 'inspirational',
    keywords: '',
    target_audience: 'Gen Z dan audiens short-form yang suka konten motivasi ringkas',
    topic:
      'Hook 3 detik yang menghentikan scroll, satu masalah sehari-hari, satu insight, dan penutup yang mengajak interaksi (komentar/simpan).',
    video_platform: 'tiktok',
    video_key_message:
      'Amal kecil yang konsisten lebih berdampak daripada menunggu momen sempurna — sampaikan dengan contoh konkret 15 detik.',
    video_cta: 'Simpan video ini dan coba satu amal kecil hari ini.',
  },
};
