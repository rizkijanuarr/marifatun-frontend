import { useMemo } from 'react';
import { useI18n } from '../../../../components/i18n/useI18n';
import { parseVideoScriptPayload } from '../utils/contentResultFormat';

type SceneRow = {
  scene_number?: number;
  duration_seconds?: number;
  visual_description?: string;
  on_screen_text?: string;
  voice_over?: string;
  background_music?: string;
  transition?: string;
};

type Props = {
  source: string;
};

function parseScenes(source: string): { scenes: SceneRow[]; error: boolean } {
  const trimmed = source?.trim() ?? '';
  if (!trimmed) return { scenes: [], error: false };
  const payload = parseVideoScriptPayload(trimmed);
  if (!payload) return { scenes: [], error: true };
  return { scenes: payload.scenes as SceneRow[], error: false };
}

export function VideoScriptScenes({ source }: Props) {
  const { t } = useI18n();
  const { scenes, error } = useMemo(() => parseScenes(source), [source]);

  if (error) {
    return (
      <div className="video-script-scenes video-script-scenes--error" role="alert">
        <p className="content-result-editor__empty">{t('back-desk.feature-content.view.video_script_parse_error')}</p>
        <pre className="video-script-scenes__raw">{source.trim()}</pre>
      </div>
    );
  }

  if (scenes.length === 0) {
    return <p className="content-result-editor__empty">{t('back-desk.feature-content.view.video_script_empty')}</p>;
  }

  return (
    <div className="video-script-scenes">
      {scenes.map((scene, idx) => (
        <article key={idx} className="video-script-scenes__card">
          <header className="video-script-scenes__head">
            <span className="video-script-scenes__badge">
              {t('back-desk.feature-content.view.video_scene_title').replace(
                '{n}',
                String(scene.scene_number ?? idx + 1),
              )}
            </span>
            <span className="video-script-scenes__dur">
              {t('back-desk.feature-content.view.video_scene_duration').replace(
                '{s}',
                String(scene.duration_seconds ?? '—'),
              )}
            </span>
          </header>
          <dl className="video-script-scenes__dl">
            <div className="video-script-scenes__row">
              <dt>{t('back-desk.feature-content.view.video_field_visual')}</dt>
              <dd>{scene.visual_description ?? '—'}</dd>
            </div>
            <div className="video-script-scenes__row">
              <dt>{t('back-desk.feature-content.view.video_field_on_screen')}</dt>
              <dd>{scene.on_screen_text ?? '—'}</dd>
            </div>
            <div className="video-script-scenes__row">
              <dt>{t('back-desk.feature-content.view.video_field_voice')}</dt>
              <dd>{scene.voice_over ?? '—'}</dd>
            </div>
            <div className="video-script-scenes__row">
              <dt>{t('back-desk.feature-content.view.video_field_music')}</dt>
              <dd>{scene.background_music ?? '—'}</dd>
            </div>
            <div className="video-script-scenes__row">
              <dt>{t('back-desk.feature-content.view.video_field_transition')}</dt>
              <dd>{scene.transition ?? '—'}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
