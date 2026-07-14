export const AUTOSAVE_IDLE_MS = 10000

export const canPersistNoteContent = metadata => metadata?.share === true

export const getSaveBlockedMessage = lang => lang === 'zh-TW'
    ? '文章尚未發布，請先發布後再儲存；若不想公開閱讀，可以啟用閱讀鎖。'
    : 'Publish this note before saving. If you do not want public reading, enable the read lock.'
