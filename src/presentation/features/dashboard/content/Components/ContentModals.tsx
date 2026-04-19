import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { FilterDrawer } from '../../../../components/FilterDrawer/FilterDrawer';
import { ModalDelete } from '../../../../components/ModalDelete/ModalDelete';
import { useToast } from '../../../../components/Toast/useToast';
import { useI18n } from '../../../../components/i18n/useI18n';
import type { ContentFilterDraft, ContentTypeId } from '../Model/ContentModel';
import { CONTENT_TYPES, TONE_VALUES, VIDEO_PLATFORMS, type ContentRowModel } from '../Model/ContentModel';
import type { ContentApiDto, CreateContentPayload, UpdateContentPayload } from '../Response/ContentResponse';
import {
  buildExportTxtFilename,
  countWords,
  downloadPlainTextFile,
  formatResultForClipboard,
} from '../utils/contentResultFormat';
import { ContentResultBody } from './ContentResultBody';
import { BRIEF_TEMPLATES } from '../utils/contentBriefTemplates';

export type ContentModalState = 'create' | 'edit' | 'view' | 'delete' | null;

type Props = {
  isAdmin: boolean;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  filterDraft: ContentFilterDraft;
  setFilterDraft: Dispatch<SetStateAction<ContentFilterDraft>>;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  modal: ContentModalState;
  selectedRow: ContentRowModel | null;
  onModalClose: () => void;
  onSwitchToEdit: () => void;
  detail: ContentApiDto | null;
  detailLoading: boolean;
  mutationLoading: boolean;
  creatingContentLoading: boolean;
  createContent: (payload: CreateContentPayload) => Promise<void>;
  updateContent: (id: string, payload: UpdateContentPayload) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
};

const isContentType = (v: string): boolean => (CONTENT_TYPES as readonly string[]).includes(v);
const isTone = (v: string): boolean => (TONE_VALUES as readonly string[]).includes(v);

const TOPIC_MAX_WORDS = 1000;

const isVideoScriptType = (v: string): boolean => v === 'video_script';

const formatIso = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const ContentModals = ({
  isAdmin,
  filterOpen,
  setFilterOpen,
  filterDraft,
  setFilterDraft,
  onApplyFilters,
  onResetFilters,
  modal,
  selectedRow,
  onModalClose,
  onSwitchToEdit,
  detail,
  detailLoading,
  mutationLoading,
  creatingContentLoading,
  createContent,
  updateContent,
  deleteContent,
}: Props) => {
  const { t } = useI18n();
  const toast = useToast();

  const [createFormType, setCreateFormType] = useState('');
  const [editFormType, setEditFormType] = useState('');

  /** Blur + dots: create (generating) atau edit (simpan revisi) */
  const showFullScreenLoading = creatingContentLoading || (mutationLoading && modal === 'edit');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showFullScreenLoading) return;
      if (filterOpen) setFilterOpen(false);
      else if (modal) onModalClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFullScreenLoading, filterOpen, modal, setFilterOpen, onModalClose]);

  useEffect(() => {
    if (modal === 'create') setCreateFormType('');
  }, [modal]);

  useEffect(() => {
    if (detail && modal === 'edit') setEditFormType(detail.content_type);
  }, [detail?.id, detail?.content_type, modal]);

  const applyCreateBriefTemplate = () => {
    if (!createFormType || !isContentType(createFormType)) {
      toast.info(t('back-desk.feature-content.toast.template_fill_select_type'));
      return;
    }
    const tpl = BRIEF_TEMPLATES[createFormType as ContentTypeId];
    const toneEl = document.getElementById('ccTone') as HTMLSelectElement | null;
    if (toneEl && isTone(tpl.tone)) toneEl.value = tpl.tone;
    const kw = document.getElementById('ccKeywords') as HTMLInputElement | null;
    if (kw && !isVideoScriptType(createFormType)) kw.value = tpl.keywords;
    const aud = document.getElementById('ccAudience') as HTMLInputElement | null;
    if (aud) aud.value = tpl.target_audience;
    const topicEl = document.getElementById('ccTopic') as HTMLTextAreaElement | null;
    if (topicEl) topicEl.value = tpl.topic;
    if (isVideoScriptType(createFormType)) {
      const vp = document.getElementById('ccVideoPlatform') as HTMLSelectElement | null;
      if (vp && tpl.video_platform) vp.value = tpl.video_platform;
      const vkm = document.getElementById('ccVideoKeyMsg') as HTMLTextAreaElement | null;
      if (vkm && tpl.video_key_message) vkm.value = tpl.video_key_message;
      const vc = document.getElementById('ccVideoCta') as HTMLInputElement | null;
      if (vc && tpl.video_cta) vc.value = tpl.video_cta;
    }
    toast.success(t('back-desk.feature-content.toast.template_fill_applied'));
  };

  const handleCreateSubmit = async () => {
    const el = document.getElementById('content-create-form') as HTMLFormElement | null;
    if (!el) return;
    const fd = new FormData(el);
    const content_type = String(fd.get('content_type') ?? '');
    const tone = String(fd.get('tone') ?? '');
    if (!isContentType(content_type)) {
      toast.error(t('back-desk.feature-content.toast.invalid_content_type'));
      return;
    }
    if (!isTone(tone)) {
      toast.error(t('back-desk.feature-content.toast.invalid_tone'));
      return;
    }
    const topic = String(fd.get('topic') ?? '').trim();
    if (!topic) {
      toast.error(t('back-desk.feature-content.toast.topic_required'));
      return;
    }
    if (countWords(topic) > TOPIC_MAX_WORDS) {
      toast.error(t('back-desk.feature-content.toast.topic_max_words'));
      return;
    }
    if (isVideoScriptType(content_type)) {
      const video_platform = String(fd.get('video_platform') ?? '').trim();
      const video_key_message = String(fd.get('video_key_message') ?? '').trim();
      const video_cta = String(fd.get('video_cta') ?? '').trim();
      if (!video_platform || !video_key_message || !video_cta) {
        toast.error(t('back-desk.feature-content.toast.video_brief_incomplete'));
        return;
      }
    }
    const payload: CreateContentPayload = {
      content_type,
      topic,
      tone,
      keywords: isVideoScriptType(content_type) ? undefined : String(fd.get('keywords') ?? '').trim() || undefined,
      target_audience: String(fd.get('target_audience') ?? '').trim() || undefined,
    };
    if (isVideoScriptType(content_type)) {
      payload.video_platform = String(fd.get('video_platform') ?? '').trim();
      payload.video_key_message = String(fd.get('video_key_message') ?? '').trim();
      payload.video_cta = String(fd.get('video_cta') ?? '').trim();
    }
    try {
      await createContent(payload);
      toast.success(t('back-desk.feature-content.toast.content_created'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('back-desk.feature-content.toast.mutation_failed'));
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    const el = document.getElementById('content-edit-form') as HTMLFormElement | null;
    if (!el) return;
    const fd = new FormData(el);
    const content_type = String(fd.get('content_type') ?? '');
    const tone = String(fd.get('tone') ?? '');
    if (!isContentType(content_type)) {
      toast.error(t('back-desk.feature-content.toast.invalid_content_type'));
      return;
    }
    if (!isTone(tone)) {
      toast.error(t('back-desk.feature-content.toast.invalid_tone'));
      return;
    }
    const topic = String(fd.get('topic') ?? '').trim();
    if (!topic) {
      toast.error(t('back-desk.feature-content.toast.topic_required'));
      return;
    }
    if (countWords(topic) > TOPIC_MAX_WORDS) {
      toast.error(t('back-desk.feature-content.toast.topic_max_words'));
      return;
    }
    if (isVideoScriptType(content_type)) {
      const video_platform = String(fd.get('video_platform') ?? '').trim();
      const video_key_message = String(fd.get('video_key_message') ?? '').trim();
      const video_cta = String(fd.get('video_cta') ?? '').trim();
      if (!video_platform || !video_key_message || !video_cta) {
        toast.error(t('back-desk.feature-content.toast.video_brief_incomplete'));
        return;
      }
    }
    const payload: UpdateContentPayload = {
      content_type,
      topic,
      tone,
      keywords: isVideoScriptType(content_type) ? undefined : String(fd.get('keywords') ?? '').trim() || undefined,
      target_audience: String(fd.get('target_audience') ?? '').trim() || undefined,
    };
    if (isVideoScriptType(content_type)) {
      payload.video_platform = String(fd.get('video_platform') ?? '').trim();
      payload.video_key_message = String(fd.get('video_key_message') ?? '').trim();
      payload.video_cta = String(fd.get('video_cta') ?? '').trim();
    }
    try {
      await updateContent(selectedRow.id, payload);
      toast.success(t('back-desk.feature-content.toast.content_updated'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('back-desk.feature-content.toast.mutation_failed'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    try {
      await deleteContent(selectedRow.id);
      toast.success(t('back-desk.feature-content.toast.content_deactivated'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('back-desk.feature-content.toast.mutation_failed'));
    }
  };

  const copyViewResultToClipboard = async () => {
    const raw = detail?.result?.trim() ?? '';
    if (!raw) {
      toast.error(t('back-desk.feature-content.view.copy_empty'));
      return;
    }
    const text = formatResultForClipboard(raw, detail?.content_type ?? '');
    if (!text) {
      toast.error(t('back-desk.feature-content.view.copy_empty'));
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('back-desk.feature-content.view.copy_toast'));
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast.success(t('back-desk.feature-content.view.copy_toast'));
      } catch {
        toast.error(t('back-desk.feature-content.view.copy_failed'));
      }
    }
  };

  const exportViewResultAsTxt = () => {
    if (!detail) return;
    const raw = detail.result?.trim() ?? '';
    if (!raw) {
      toast.error(t('back-desk.feature-content.view.copy_empty'));
      return;
    }
    const text = formatResultForClipboard(raw, detail.content_type ?? '');
    if (!text) {
      toast.error(t('back-desk.feature-content.view.copy_empty'));
      return;
    }
    const filename = buildExportTxtFilename(detail.topic, detail.id);
    try {
      downloadPlainTextFile(text, filename);
      toast.success(t('back-desk.feature-content.view.export_toast'));
    } catch {
      toast.error(t('back-desk.feature-content.view.export_failed'));
    }
  };

  const generatingOverlay =
    typeof document !== 'undefined' && showFullScreenLoading
      ? createPortal(
          <div
            className="content-generating-overlay"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={t('back-desk.feature-content.generating.overlay_aria')}
          >
            <div className="content-generating-dots" aria-hidden>
              <span className="content-generating-dot">.</span>
              <span className="content-generating-dot">.</span>
              <span className="content-generating-dot">.</span>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {generatingOverlay}
      {isAdmin ? (
        <FilterDrawer
          open={filterOpen}
          title={t('back-desk.feature-content.filter.title')}
          onClose={() => setFilterOpen(false)}
          footer={(
            <>
              <button type="button" className="btn-d btn-d--ghost" onClick={() => onResetFilters()}>
                {t('back-desk.modal-filter.btn_reset')}
              </button>
              <button
                type="button"
                className="btn-d btn-d--primary"
                onClick={() => {
                  onApplyFilters();
                  toast.success(t('back-desk.feature-content.toast.filter_applied'));
                }}
              >
                {t('back-desk.modal-filter.btn_apply')}
              </button>
            </>
          )}
        >
          <div className="filter-group">
            <label className="filter-group__label" htmlFor="cfdSearch">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{t('back-desk.modal-filter.group_search')}</span>
            </label>
            <div className="filter-search">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="cfdSearch"
                className="filter-input"
                type="search"
                value={filterDraft.search}
                onChange={(e) => setFilterDraft((d) => ({ ...d, search: e.target.value }))}
                placeholder={t('back-desk.feature-content.filter.search_placeholder')}
              />
            </div>
            <span className="form-field__hint">{t('back-desk.feature-content.filter.search_hint')}</span>
          </div>

          <div className="filter-group">
            <label className="filter-group__label" htmlFor="cfdContentType">
              {t('back-desk.feature-content.filter.content_type')}
            </label>
            <select
              id="cfdContentType"
              className="filter-input"
              value={filterDraft.content_type}
              onChange={(e) => setFilterDraft((d) => ({ ...d, content_type: e.target.value }))}
            >
              <option value="">{t('back-desk.feature-content.filter.any_type')}</option>
              {CONTENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {t(`back-desk.feature-content.enum.content_type.${ct}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-group__label">{t('back-desk.modal-filter.group_status')}</span>
            <div className="filter-chips">
              <button
                type="button"
                className={`filter-chip ${filterDraft.active === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilterDraft((d) => ({ ...d, active: 'all' }))}
              >
                {t('back-desk.modal-filter.chip_all')}
              </button>
              <button
                type="button"
                className={`filter-chip ${filterDraft.active === 'active' ? 'is-active' : ''}`}
                onClick={() => setFilterDraft((d) => ({ ...d, active: 'active' }))}
              >
                {t('back-desk.modal-filter.chip_active')}
              </button>
              <button
                type="button"
                className={`filter-chip ${filterDraft.active === 'inactive' ? 'is-active' : ''}`}
                onClick={() => setFilterDraft((d) => ({ ...d, active: 'inactive' }))}
              >
                {t('back-desk.modal-filter.chip_inactive')}
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group__label">{t('back-desk.modal-filter.group_range')}</span>
            <div className="filter-range">
              <input
                type="date"
                className="filter-input"
                aria-label={t('back-desk.modal-filter.date_from_label')}
                value={filterDraft.date_from}
                onChange={(e) => setFilterDraft((d) => ({ ...d, date_from: e.target.value }))}
              />
              <input
                type="date"
                className="filter-input"
                aria-label={t('back-desk.modal-filter.date_to_label')}
                value={filterDraft.date_to}
                onChange={(e) => setFilterDraft((d) => ({ ...d, date_to: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label" htmlFor="cfdSortDir">
              {t('back-desk.modal-filter.group_sort')}
            </label>
            <select
              id="cfdSortDir"
              className="filter-input"
              value={filterDraft.sort_direction}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, sort_direction: e.target.value as ContentFilterDraft['sort_direction'] }))
              }
            >
              <option value="asc">{t('back-desk.feature-content.filter.dir_asc')}</option>
              <option value="desc">{t('back-desk.feature-content.filter.dir_desc')}</option>
            </select>
            <span className="form-field__hint">{t('back-desk.feature-content.filter.sort_modified_hint')}</span>
          </div>

          <hr className="filter-divider" />
        </FilterDrawer>
      ) : (
        <FilterDrawer
          open={filterOpen}
          title={t('back-desk.feature-content.filter.title')}
          onClose={() => setFilterOpen(false)}
          footer={(
            <>
              <button type="button" className="btn-d btn-d--ghost" onClick={() => onResetFilters()}>
                {t('back-desk.modal-filter.btn_reset')}
              </button>
              <button
                type="button"
                className="btn-d btn-d--primary"
                onClick={() => {
                  onApplyFilters();
                  toast.success(t('back-desk.feature-content.toast.filter_applied'));
                }}
              >
                {t('back-desk.modal-filter.btn_apply')}
              </button>
            </>
          )}
        >
          <div className="filter-group">
            <label className="filter-group__label" htmlFor="cfdSearchUser">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{t('back-desk.modal-filter.group_search')}</span>
            </label>
            <div className="filter-search">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="cfdSearchUser"
                className="filter-input"
                type="search"
                value={filterDraft.search}
                onChange={(e) => setFilterDraft((d) => ({ ...d, search: e.target.value }))}
                placeholder={t('back-desk.feature-content.filter.search_placeholder_user')}
              />
            </div>
            <span className="form-field__hint">{t('back-desk.feature-content.filter.search_hint_user')}</span>
          </div>

          <div className="filter-group">
            <span className="filter-group__label">{t('back-desk.modal-filter.group_range')}</span>
            <div className="filter-range">
              <input
                type="date"
                className="filter-input"
                aria-label={t('back-desk.modal-filter.date_from_label')}
                value={filterDraft.date_from}
                onChange={(e) => setFilterDraft((d) => ({ ...d, date_from: e.target.value }))}
              />
              <input
                type="date"
                className="filter-input"
                aria-label={t('back-desk.modal-filter.date_to_label')}
                value={filterDraft.date_to}
                onChange={(e) => setFilterDraft((d) => ({ ...d, date_to: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label" htmlFor="cfdSortDirUser">
              {t('back-desk.modal-filter.group_sort')}
            </label>
            <select
              id="cfdSortDirUser"
              className="filter-input"
              value={filterDraft.sort_direction}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, sort_direction: e.target.value as ContentFilterDraft['sort_direction'] }))
              }
            >
              <option value="asc">{t('back-desk.feature-content.filter.dir_asc')}</option>
              <option value="desc">{t('back-desk.feature-content.filter.dir_desc')}</option>
            </select>
            <span className="form-field__hint">{t('back-desk.feature-content.filter.sort_modified_hint_user')}</span>
          </div>

          <hr className="filter-divider" />
        </FilterDrawer>
      )}

      {/* Create */}
      <div
        className={`modal ${modal === 'create' ? 'is-open' : ''}`}
        id="modalContentCreate"
        data-modal
        aria-hidden={modal !== 'create'}
        role="dialog"
        aria-labelledby="modalContentCreateTitle"
      >
        <button type="button" className="modal__backdrop" aria-hidden onClick={onModalClose} />
        <div className="modal__dialog" role="document">
          <div className="modal__header">
            <div className="modal__title-group">
              <h2 className="modal__title" id="modalContentCreateTitle">
                <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t('back-desk.feature-content.modals.create_title')}
              </h2>
              <span className="modal__subtitle">{t('back-desk.feature-content.modals.create_subtitle')}</span>
            </div>
            <button
              type="button"
              className="modal__close"
              onClick={onModalClose}
              aria-label={t('back-desk.modal-create.close_label')}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form
            id="content-create-form"
            className="modal__body"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateSubmit();
            }}
          >
            <p className="content-create-fyi">{t('back-desk.feature-content.modals.create_fyi')}</p>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-field__label" htmlFor="ccType">
                  {t('back-desk.feature-content.form.content_type')}
                </label>
                <select
                  id="ccType"
                  name="content_type"
                  className="filter-input"
                  required
                  value={createFormType}
                  onChange={(e) => setCreateFormType(e.target.value)}
                >
                  <option value="" disabled>
                    {t('back-desk.feature-content.form.select_placeholder')}
                  </option>
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {t(`back-desk.feature-content.enum.content_type.${ct}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-field__label" htmlFor="ccTone">
                  {t('back-desk.feature-content.form.tone')}
                </label>
                <select id="ccTone" name="tone" className="filter-input" required defaultValue="">
                  <option value="" disabled>
                    {t('back-desk.feature-content.form.select_placeholder')}
                  </option>
                  {TONE_VALUES.map((tn) => (
                    <option key={tn} value={tn}>
                      {t(`back-desk.feature-content.enum.tone.${tn}`)}
                    </option>
                  ))}
                </select>
              </div>
              {!isVideoScriptType(createFormType) ? (
                <div className="form-field">
                  <label className="form-field__label" htmlFor="ccKeywords">
                    {t('back-desk.feature-content.form.keywords')}
                  </label>
                  <input
                    id="ccKeywords"
                    name="keywords"
                    className="filter-input"
                    type="text"
                    placeholder={t('back-desk.feature-content.form.keywords_placeholder')}
                  />
                </div>
              ) : null}
              <div className="form-field">
                <label className="form-field__label" htmlFor="ccAudience">
                  {t('back-desk.feature-content.form.target_audience')}
                </label>
                <input
                  id="ccAudience"
                  name="target_audience"
                  className="filter-input"
                  type="text"
                  placeholder={t('back-desk.feature-content.form.target_audience_placeholder')}
                />
              </div>
              <div className="form-field form-field--full">
                <label className="form-field__label" htmlFor="ccTopic">
                  {t('back-desk.feature-content.form.topic')}
                </label>
                <textarea
                  id="ccTopic"
                  name="topic"
                  className="filter-input filter-input--textarea"
                  rows={5}
                  required
                  placeholder={t('back-desk.feature-content.form.topic_placeholder')}
                />
              </div>
              {isVideoScriptType(createFormType) ? (
                <>
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="ccVideoPlatform">
                      {t('back-desk.feature-content.form.video_platform')}
                    </label>
                    <select id="ccVideoPlatform" name="video_platform" className="filter-input" required defaultValue="">
                      <option value="" disabled>
                        {t('back-desk.feature-content.form.select_placeholder')}
                      </option>
                      {VIDEO_PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {t(`back-desk.feature-content.form.video_platform_${p}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field form-field--full">
                    <label className="form-field__label" htmlFor="ccVideoKeyMsg">
                      {t('back-desk.feature-content.form.video_key_message')}
                    </label>
                    <textarea
                      id="ccVideoKeyMsg"
                      name="video_key_message"
                      className="filter-input filter-input--textarea"
                      rows={3}
                      required
                      placeholder={t('back-desk.feature-content.form.video_key_message_placeholder')}
                    />
                  </div>
                  <div className="form-field form-field--full">
                    <label className="form-field__label" htmlFor="ccVideoCta">
                      {t('back-desk.feature-content.form.video_cta')}
                    </label>
                    <input
                      id="ccVideoCta"
                      name="video_cta"
                      className="filter-input"
                      type="text"
                      required
                      placeholder={t('back-desk.feature-content.form.video_cta_placeholder')}
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className="modal__footer modal__footer--split">
              <button
                type="button"
                className="btn-d btn-d--outline"
                onClick={applyCreateBriefTemplate}
                disabled={mutationLoading || creatingContentLoading || !createFormType}
              >
                {t('back-desk.feature-content.modals.template_fill_button')}
              </button>
              <div className="modal__footer-actions">
                <button type="button" className="btn-d btn-d--ghost" onClick={onModalClose}>
                  {t('back-desk.modal-create.btn_cancel')}
                </button>
                <button type="submit" className="btn-d btn-d--primary" disabled={mutationLoading || creatingContentLoading}>
                  {t('back-desk.feature-content.modals.create_submit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Edit */}
      <div
        className={`modal ${modal === 'edit' ? 'is-open' : ''}`}
        id="modalContentEdit"
        aria-hidden={modal !== 'edit'}
        role="dialog"
        aria-labelledby="modalContentEditTitle"
      >
        <button type="button" className="modal__backdrop" aria-hidden onClick={onModalClose} />
        <div className="modal__dialog" role="document">
          <div className="modal__header">
            <div className="modal__title-group">
              <h2 className="modal__title" id="modalContentEditTitle">
                <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {t('back-desk.feature-content.modals.edit_title')}
              </h2>
              <span className="modal__subtitle">{t('back-desk.feature-content.modals.edit_subtitle')}</span>
            </div>
            <button
              type="button"
              className="modal__close"
              onClick={onModalClose}
              aria-label={t('back-desk.modal-edit.close_label')}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form
            id="content-edit-form"
            className="modal__body"
            onSubmit={(e) => {
              e.preventDefault();
              void handleEditSubmit();
            }}
          >
            {detailLoading || !detail ? (
              <p>{t('back-desk.modal-view.loading')}</p>
            ) : (
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-field__label" htmlFor="ceType">
                    {t('back-desk.feature-content.form.content_type')}
                  </label>
                  <select
                    id="ceType"
                    name="content_type"
                    className="filter-input"
                    key={`${detail.id}-type`}
                    required
                    value={editFormType}
                    onChange={(e) => setEditFormType(e.target.value)}
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {t(`back-desk.feature-content.enum.content_type.${ct}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-field__label" htmlFor="ceTone">
                    {t('back-desk.feature-content.form.tone')}
                  </label>
                  <select
                    id="ceTone"
                    name="tone"
                    className="filter-input"
                    key={`${detail.id}-tone`}
                    required
                    defaultValue={detail.tone}
                  >
                    {TONE_VALUES.map((tn) => (
                      <option key={tn} value={tn}>
                        {t(`back-desk.feature-content.enum.tone.${tn}`)}
                      </option>
                    ))}
                  </select>
                </div>
                {!isVideoScriptType(editFormType) ? (
                  <div className="form-field">
                    <label className="form-field__label" htmlFor="ceKeywords">
                      {t('back-desk.feature-content.form.keywords')}
                    </label>
                    <input
                      id="ceKeywords"
                      name="keywords"
                      className="filter-input"
                      type="text"
                      key={`${detail.id}-kw`}
                      defaultValue={detail.keywords ?? ''}
                    />
                  </div>
                ) : null}
                <div className="form-field">
                  <label className="form-field__label" htmlFor="ceAudience">
                    {t('back-desk.feature-content.form.target_audience')}
                  </label>
                  <input
                    id="ceAudience"
                    name="target_audience"
                    className="filter-input"
                    type="text"
                    key={`${detail.id}-aud`}
                    defaultValue={detail.target_audience ?? ''}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label className="form-field__label" htmlFor="ceTopic">
                    {t('back-desk.feature-content.form.topic')}
                  </label>
                  <textarea
                    id="ceTopic"
                    name="topic"
                    className="filter-input filter-input--textarea"
                    rows={5}
                    key={`${detail.id}-topic`}
                    defaultValue={detail.topic}
                    required
                  />
                </div>
                {isVideoScriptType(editFormType) ? (
                  <>
                    <div className="form-field">
                      <label className="form-field__label" htmlFor="ceVideoPlatform">
                        {t('back-desk.feature-content.form.video_platform')}
                      </label>
                      <select
                        id="ceVideoPlatform"
                        name="video_platform"
                        className="filter-input"
                        key={`${detail.id}-vplat`}
                        required
                        defaultValue={detail.video_platform ?? ''}
                      >
                        <option value="" disabled>
                          {t('back-desk.feature-content.form.select_placeholder')}
                        </option>
                        {VIDEO_PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {t(`back-desk.feature-content.form.video_platform_${p}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field form-field--full">
                      <label className="form-field__label" htmlFor="ceVideoKeyMsg">
                        {t('back-desk.feature-content.form.video_key_message')}
                      </label>
                      <textarea
                        id="ceVideoKeyMsg"
                        name="video_key_message"
                        className="filter-input filter-input--textarea"
                        rows={3}
                        key={`${detail.id}-vkm`}
                        required
                        defaultValue={detail.video_key_message ?? ''}
                        placeholder={t('back-desk.feature-content.form.video_key_message_placeholder')}
                      />
                    </div>
                    <div className="form-field form-field--full">
                      <label className="form-field__label" htmlFor="ceVideoCta">
                        {t('back-desk.feature-content.form.video_cta')}
                      </label>
                      <input
                        id="ceVideoCta"
                        name="video_cta"
                        className="filter-input"
                        type="text"
                        key={`${detail.id}-vcta`}
                        required
                        defaultValue={detail.video_cta ?? ''}
                        placeholder={t('back-desk.feature-content.form.video_cta_placeholder')}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            )}

            <div className="modal__footer">
              <button type="button" className="btn-d btn-d--ghost" onClick={onModalClose}>
                {t('back-desk.modal-edit.btn_cancel')}
              </button>
              <button type="submit" className="btn-d btn-d--primary" disabled={mutationLoading || detailLoading || !detail}>
                {t('back-desk.feature-content.modals.edit_submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* View */}
      <div
        className={`modal modal--lg ${modal === 'view' ? 'is-open' : ''}`}
        id="modalContentView"
        aria-hidden={modal !== 'view'}
        role="dialog"
        aria-labelledby="modalContentViewTitle"
      >
        <button type="button" className="modal__backdrop" aria-hidden onClick={onModalClose} />
        <div className="modal__dialog" role="document">
          <div className="modal__header">
            <div className="modal__title-group">
              <h2 className="modal__title" id="modalContentViewTitle">
                <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {t('back-desk.feature-content.modals.view_title')}
              </h2>
              <span className="modal__subtitle">{t('back-desk.feature-content.modals.view_subtitle')}</span>
            </div>
            <button
              type="button"
              className="modal__close"
              onClick={onModalClose}
              aria-label={t('back-desk.modal-view.close_label')}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="modal__body">
            {detailLoading ? <p>{t('back-desk.modal-view.loading')}</p> : null}
            {!detailLoading && detail ? (
              <>
                <dl className="detail-list">
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.topic')}</dt>
                    <dd className="detail-list__topic">{detail.topic}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.content_type')}</dt>
                    <dd>{t(`back-desk.feature-content.enum.content_type.${detail.content_type}`)}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.tone')}</dt>
                    <dd>{t(`back-desk.feature-content.enum.tone.${detail.tone}`)}</dd>
                  </div>
                  {isVideoScriptType(detail.content_type) ? (
                    <>
                      <div className="detail-row">
                        <dt>{t('back-desk.feature-content.view.video_platform')}</dt>
                        <dd>
                          {detail.video_platform
                            ? t(`back-desk.feature-content.form.video_platform_${detail.video_platform}`)
                            : '—'}
                        </dd>
                      </div>
                      <div className="detail-row">
                        <dt>{t('back-desk.feature-content.view.video_key_message')}</dt>
                        <dd className="detail-list__topic">{detail.video_key_message?.trim() || '—'}</dd>
                      </div>
                      <div className="detail-row">
                        <dt>{t('back-desk.feature-content.view.video_cta')}</dt>
                        <dd>{detail.video_cta?.trim() || '—'}</dd>
                      </div>
                    </>
                  ) : (
                    <div className="detail-row">
                      <dt>{t('back-desk.feature-content.view.keywords')}</dt>
                      <dd>{detail.keywords?.trim() || '—'}</dd>
                    </div>
                  )}
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.target_audience')}</dt>
                    <dd>{detail.target_audience?.trim() || '—'}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.owner')}</dt>
                    <dd>
                      {detail.user
                        ? `${detail.user.name} · ${detail.user.email}`
                        : '—'}
                    </dd>
                  </div>
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.created')}</dt>
                    <dd>{formatIso(detail.createdDate)}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>{t('back-desk.feature-content.view.modified')}</dt>
                    <dd>{formatIso(detail.modifiedDate)}</dd>
                  </div>
                </dl>
                <div className="content-result-editor-frame">
                  <div className="content-result-editor-frame__spin" aria-hidden />
                  <section
                    className="content-result-editor"
                    aria-label={t('back-desk.feature-content.view.result_section_aria')}
                  >
                  <div className="content-result-editor__head content-result-editor__head--copy-only">
                    <div className="content-result-editor__actions">
                      <button
                        type="button"
                        className="content-result-editor__copy"
                        onClick={() => void copyViewResultToClipboard()}
                        disabled={!detail.result?.trim()}
                        aria-label={t('back-desk.feature-content.view.copy_aria')}
                      >
                        <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{t('back-desk.feature-content.view.copy_button')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn-d btn-d--outline content-result-editor__export"
                        onClick={exportViewResultAsTxt}
                        disabled={!detail.result?.trim()}
                        aria-label={t('back-desk.feature-content.view.export_aria')}
                      >
                        <svg viewBox="0 0 24 24" width="17" height="17" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>{t('back-desk.feature-content.view.export_button')}</span>
                      </button>
                    </div>
                  </div>
                  <div className="content-result-editor__body-ring">
                    <div className="content-result-editor__body">
                      {detail.result?.trim() ? (
                        <ContentResultBody source={detail.result} contentType={detail.content_type} />
                      ) : (
                        <p className="content-result-editor__empty" id="content-result-placeholder">
                          {t('back-desk.feature-content.view.result_placeholder')}
                        </p>
                      )}
                    </div>
                  </div>
                  </section>
                </div>
              </>
            ) : null}
          </div>

          <div className="modal__footer">
            <button type="button" className="btn-d btn-d--ghost" onClick={onModalClose}>
              {t('back-desk.modal-view.btn_close')}
            </button>
            <button type="button" className="btn-d btn-d--primary" onClick={onSwitchToEdit} disabled={detailLoading || !detail}>
              <svg
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                width={16}
                height={16}
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>{t('back-desk.modal-view.btn_edit')}</span>
            </button>
          </div>
        </div>
      </div>

      <ModalDelete
        open={modal === 'delete'}
        onClose={onModalClose}
        title={t('back-desk.feature-content.modals.delete_title')}
        message={t('back-desk.feature-content.modals.delete_message')}
        submitLabel={t('back-desk.feature-content.modals.delete_submit')}
        disabled={mutationLoading}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </>
  );
};
