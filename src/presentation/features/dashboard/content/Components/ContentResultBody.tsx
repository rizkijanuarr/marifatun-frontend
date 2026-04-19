import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { prepareSourceForMarkdownPreview } from '../utils/prepareMarkdownPreview';
import { VideoScriptScenes } from './VideoScriptScenes';

type Props = {
  source: string;
  /** `linkedin` | `x` | `thread` | `facebook` | `email_marketing` | `video_script` */
  contentType: string;
};

/**
 * Render hasil generate: Markdown + GFM (bold, italic, list, heading, tabel ringan).
 * Tanpa HTML mentah dari sumber (react-markdown tidak merender raw HTML).
 */
export function ContentResultBody({ source, contentType }: Props) {
  const trimmed = source?.trim() ?? '';
  if (!trimmed) return null;

  if (contentType === 'video_script') {
    return <VideoScriptScenes source={trimmed} />;
  }

  const md = prepareSourceForMarkdownPreview(trimmed);
  const safeType = /^[\w-]+$/.test(contentType) ? contentType : 'unknown';

  return (
    <div
      className={`content-result-markdown content-result-markdown--${safeType}`}
      tabIndex={0}
      role="article"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{md}</ReactMarkdown>
    </div>
  );
}
