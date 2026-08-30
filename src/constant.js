// static CDN
// static CDN
export const CDN_PREFIX = 'https://cdn.jsdelivr.net/npm'

const readRuntimeVar = name => globalThis?.[name]

// server side salt
export const SALT = readRuntimeVar('SCN_SALT')
// server side secret
export const SECRET = readRuntimeVar('SCN_SECRET')
export const getSalt = () => readRuntimeVar('SCN_SALT')
export const getSecret = () => readRuntimeVar('SCN_SECRET')

// admin
export const getAdminPath = () => readRuntimeVar('SCN_ADMIN_PATH') || '/admin'
export const getAdminPassword = () => readRuntimeVar('SCN_ADMIN_PW')
// Kept for compatibility with callers that import the old constants. Request
// handlers should use the getters because Cloudflare bindings are available
// after the Worker module has been evaluated.
export const ADMIN_PATH = getAdminPath()
export const ADMIN_PW = getAdminPassword()
export const getSlugLength = () => parseInt(readRuntimeVar('SCN_SLUG_LENGTH') || '3', 10)
// Access R2 config at runtime instead of module load time
export const getEnableR2 = () => readRuntimeVar('SCN_ENABLE_R2') === '1'
export const getR2Domain = () => (typeof readRuntimeVar('SCN_R2_DOMAIN') !== 'undefined' ? readRuntimeVar('SCN_R2_DOMAIN') : '')
export const getGaMeasurementId = () => (typeof readRuntimeVar('SCN_GA_MEASUREMENT_ID') !== 'undefined' ? String(readRuntimeVar('SCN_GA_MEASUREMENT_ID') || '').trim() : '')
const WEBTALK_DEFAULTS = {
    scriptUrl: 'https://webtalk-nine.vercel.app/webtalk.js',
    scope: 'meta',
    siteId: 'david888-wiki',
    aiEndpoint: 'https://webtalk-nine.vercel.app/api/webtalk/ai',
}
const getHttpUrl = value => {
    try {
        const url = new URL(String(value || '').trim())
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''
    } catch {
        return ''
    }
}
export const getWebtalkConfig = () => {
    if (readRuntimeVar('SCN_ENABLE_WEBTALK') !== '1') return { enabled: false }

    const scriptUrl = getHttpUrl(readRuntimeVar('SCN_WEBTALK_SCRIPT_URL') ?? WEBTALK_DEFAULTS.scriptUrl)
    const aiEndpoint = getHttpUrl(readRuntimeVar('SCN_WEBTALK_AI_ENDPOINT') ?? WEBTALK_DEFAULTS.aiEndpoint)
    if (!scriptUrl || !aiEndpoint) return { enabled: false }

    return {
        enabled: true,
        scriptUrl,
        scope: String(readRuntimeVar('SCN_WEBTALK_SCOPE') ?? WEBTALK_DEFAULTS.scope).trim(),
        siteId: String(readRuntimeVar('SCN_WEBTALK_SITE_ID') ?? WEBTALK_DEFAULTS.siteId).trim(),
        aiEndpoint,
    }
}
export const APP_NAME = (typeof readRuntimeVar('SCN_APP_NAME') !== 'undefined') ? readRuntimeVar('SCN_APP_NAME') : 'david888 wiki'

// Persisted preview/share widths. Keep the API default aligned with the
// editor's initial desktop preview so a newly published API note renders the
// same way in edit and share views.
export const PREVIEW_WIDTH_VALUES = Object.freeze(['100%', '960px', '1200px', '1440px'])
export const DEFAULT_PREVIEW_WIDTH = '1200px'
export const normalizePreviewWidth = (value, fallback = DEFAULT_PREVIEW_WIDTH) => {
    const safeFallback = PREVIEW_WIDTH_VALUES.includes(fallback) ? fallback : DEFAULT_PREVIEW_WIDTH
    if (value === undefined || value === null || value === '') return safeFallback

    const normalized = String(value).trim()
    return PREVIEW_WIDTH_VALUES.includes(normalized) ? normalized : null
}

// supported language
export const SUPPORTED_LANG = {
    'en-US': {
        setPW: 'Edit Lock',
        changePW: 'Edit Lock',
        setViewPW: 'View Lock',
        changeViewPW: 'View Lock',
        share: 'Share URL',
        preview: 'Preview',
        lastModified: 'Saved',
        copy: 'Copy',
        copied: 'Copied!',
        copyFailed: 'Copy failed',
        emptyPH: 'There are many like it, but this one is mine...',
        tipEncrypt: 'This Note has been encrypted, please enter password!',
        tip404: '404, Nothing here',
        published: 'Published',
        publicIndex: 'Public index',
        publicIndexEnable: 'Add to sitemap',
        publicIndexDisable: 'Remove from sitemap',
        publicIndexOn: 'Indexed',
        publicIndexOff: 'Private',
        publicIndexUpdatedOn: 'Added to public index.',
        publicIndexUpdatedOff: 'Removed from public index.',
        annotations: 'Paragraph annotations',
        annotationsEnable: 'Allow paragraph annotations',
        annotationsDisable: 'Disable paragraph annotations',
        annotationsOn: 'Open',
        annotationsOff: 'Off',
        annotationsUpdatedOn: 'Paragraph annotations are open.',
        annotationsUpdatedOff: 'Paragraph annotations are closed.',
        shareLink: 'Share',
        shareLinkTitle: 'Open shared page in a new tab',
        recentSharesTitle: 'Recent shares',
        editLockTitle: 'Edit lock',
        readLockTitle: 'View lock',
        backToEdit: 'Back to edit',
        present: 'Present',
        presentTitle: 'Open full-screen presentation mode',
        presentationUnavailable: 'No content to present',
        presentationClose: 'Close presentation',
        presentationFailed: 'Presentation failed: ',
        width: 'Width',
        full: 'Full',
        previewDevice: 'Preview device',
        desktop: 'Desktop',
        mobile: 'Mobile',
        skill: 'Skill',
        skillTitle: 'Open AI skill markdown',
        apiDoc: 'API',
        apiDocTitle: 'Open API markdown documentation',
        startRecording: 'Live voice recording',
        importMarkdown: 'Import Office, PDF, Audio (Transcript) or Markdown',
        importFileMarkdown: 'Import file (creates a Markdown note)',
        importAudioMarkdown: 'Import audio (Transcript)',
        importAudioSmartFormatMarkdown: 'Import audio (Smart format)',
        importWebsiteMarkdown: 'Import website (creates a Markdown note)',
        importFileBlock: 'Import file (convert to blocks)',
        importAudioBlock: 'Import audio (Transcript to blocks)',
        importAudioSmartFormatBlock: 'Import audio (Smart format to blocks)',
        importWebsiteBlock: 'Import website (convert to blocks)',
        creatingMarkdownNote: 'Creating Markdown note...',
        importBlockMessage: 'Imported content will be converted into blocks. Some advanced Markdown may be simplified.',
        importActionInsertBlock: 'Insert after current block',
        exportMarkdown: 'Export markdown file',
        exportPdf: 'Print or export PDF',
        convertingDocument: 'Converting document to Markdown...',
        transcribingAudio: 'Transcribing audio to transcript...',
        transcribingAudioSmartFormat: 'Transcribing audio and smart-formatting the content...',
        markdownImported: 'Markdown imported.',
        documentImported: 'Document converted and imported successfully.',
        audioTranscribed: 'Audio transcript generated successfully.',
        audioSmartFormatted: 'Audio transcript was smart-formatted successfully.',
        markdownImportFailed: 'Document conversion or import failed',
        audioTranscribeFailed: 'Audio transcription failed',
        importOptionTitle: 'Import Options',
        importOptionMessage: 'How would you like to handle the imported content?',
        importActionReplace: 'Replace All',
        importActionInsert: 'Insert at Cursor',
        importActionCancel: 'Cancel',
        savedAtTitle: 'Saved at',
        language: 'Language',
        publishNudgeTitle: 'Save and publish this note?',
        publishNudgeText: 'This unpublished note is not saved yet. Publish now to save the current content and get a share URL.',
        publishApplyChoices: 'Apply choices',
        publishPreferencePublish: 'Publish',
        publishPreferencePublishHelp: 'Save the current note and create a public share URL.',
        publishPreferenceAutosave: 'Autosave',
        publishPreferenceAutosaveHelp: 'Save changes 10 seconds after you stop typing.',
        publishPreferencePublicIndex: 'Public index',
        publishPreferencePublicIndexHelp: 'Include the share URL in sitemap.xml so search engines may discover it.',
        publishPreferencesRemembered: 'These choices will be remembered on this device.',
        publicationDraft: 'Draft',
        publicationPublished: 'Published',
        publicationUrl: 'Share URL',
        publicationVersions: 'Retained versions',
        publicationViews: 'Unique views',
        publicationUpdated: 'Last saved',
        publicationPendingHint: 'Publish to show the share URL and reader statistics.',
        later: 'Later',
        unpublishConfirm: 'Unpublish this share link?',
        uploadFailed: 'Upload failed',
        uploadError: 'Upload error: ',
        uploading: 'Uploading...',
        err: 'Error',
        pepw: 'Please enter password.',
        passwordConfirm: 'Continue',
        passwordCancel: 'Cancel',
        pwcnbe: 'Password is empty!',
        enpw: 'Enter a new password (Keeping it empty will remove the current password)',
        pwss: 'Password set successfully.',
        pwrs: 'Password removed successfully.',
        shareAndHistory: 'Shares & history',
        history: 'History',
        historyTitle: 'Version history',
        historyPreview: 'Preview',
        historyRaw: 'Raw',
        historyRefresh: 'Refresh',
        historyRestore: 'Restore',
        historyCopyContent: 'Copy content',
        historyCurrentVersion: 'Current',
        historySelectedVersion: 'Selected',
        historyNoSelection: 'Select a version to compare.',
        historyLoading: 'Loading history...',
        historyEmpty: 'No saved history yet. Once older versions are retained, they will appear here.',
        historyDisabled: 'Note history is disabled for this deployment.',
        historyUnavailableOnShare: 'Version history is only available on the edit page.',
        historyRestoreConfirm: 'Restore this version and overwrite the current note?',
        historyRestoreDone: 'Version restored.',
        historyCopiedContent: 'Content copied.',
        historyChars: 'chars',
    },
    'zh-TW': {
        setPW: '編輯鎖',
        changePW: '編輯鎖',
        setViewPW: '閱讀鎖',
        changeViewPW: '閱讀鎖',
        share: '發布分享',
        preview: '預覽',
        lastModified: '保存',
        copy: '複製',
        copied: '已複製',
        copyFailed: '複製失敗',
        emptyPH: '',
        tipEncrypt: '這是一篇加密筆記，你必須先輸入密碼',
        tip404: '404，你要找的東西並不存在',
        published: '已發布',
        publicIndex: '公開索引',
        publicIndexEnable: '加入 sitemap',
        publicIndexDisable: '移出 sitemap',
        publicIndexOn: '已收錄',
        publicIndexOff: '未收錄',
        publicIndexUpdatedOn: '已加入公開索引。',
        publicIndexUpdatedOff: '已從公開索引移除。',
        annotations: '段落註解',
        annotationsEnable: '開放讀者針對段落註解',
        annotationsDisable: '關閉段落註解',
        annotationsOn: '開放',
        annotationsOff: '關閉',
        annotationsUpdatedOn: '已開放段落註解。',
        annotationsUpdatedOff: '已關閉段落註解。',
        shareLink: '分享頁',
        shareLinkTitle: '另開分頁開啟分享頁',
        recentSharesTitle: '最近分享',
        editLockTitle: '編輯鎖',
        readLockTitle: '閱讀鎖',
        backToEdit: '返回編輯',
        present: '演示',
        presentTitle: '進入全螢幕簡報模式',
        presentationUnavailable: '無內容可演示',
        presentationClose: '結束演示',
        presentationFailed: '啟動失敗: ',
        width: '寬度',
        full: '完整',
        previewDevice: '預覽裝置',
        desktop: '桌面',
        mobile: '手機',
        skill: 'Skill',
        skillTitle: '開啟 AI Skill Markdown',
        apiDoc: 'API',
        apiDocTitle: '開啟 API Markdown 文檔',
        startRecording: '即時錄音',
        importMarkdown: '匯入 Office、PDF、音訊逐字稿或 Markdown 檔案',
        importFileMarkdown: '匯入檔案（建立 Markdown 筆記）',
        importAudioMarkdown: '匯入音訊（逐字稿）',
        importAudioSmartFormatMarkdown: '匯入音訊（智慧排版）',
        importWebsiteMarkdown: '匯入網站（建立 Markdown 筆記）',
        importFileBlock: '匯入檔案（轉成 Block）',
        importAudioBlock: '匯入音訊（逐字稿轉 Block）',
        importAudioSmartFormatBlock: '匯入音訊（智慧排版轉 Block）',
        importWebsiteBlock: '匯入網站（轉成 Block）',
        creatingMarkdownNote: '正在建立 Markdown 筆記...',
        importBlockMessage: '匯入內容會轉換成 Block 區塊，部分特殊 Markdown 可能簡化。',
        importActionInsertBlock: '插入目前區塊後',
        exportMarkdown: '導出 Markdown 文件',
        exportPdf: '列印預覽或導出 PDF',
        convertingDocument: '正在將文件轉換為 Markdown...',
        transcribingAudio: '正在轉錄音訊為逐字稿...',
        transcribingAudioSmartFormat: '正在轉錄音訊並使用 AI 智慧整理排版...',
        markdownImported: '已導入 Markdown。',
        documentImported: '文件已成功轉換並導入。',
        audioTranscribed: '音訊已成功轉錄為逐字稿！',
        audioSmartFormatted: '音訊逐字稿已成功智慧整理排版！',
        markdownImportFailed: '文件轉換或導入失敗',
        audioTranscribeFailed: '音訊轉錄失敗',
        importOptionTitle: '匯入選項',
        importOptionMessage: '請選擇如何處理匯入的文件內容：',
        importActionReplace: '取代全文',
        importActionInsert: '插入游標處',
        importActionCancel: '取消',
        savedAtTitle: '保存時間',
        language: '語言',
        publishNudgeTitle: '要儲存並發布這篇文章嗎？',
        publishNudgeText: '未發布文章目前不會儲存。現在發布即可同步儲存目前內容並取得分享 URL。',
        publishApplyChoices: '套用選擇',
        publishPreferencePublish: '發布',
        publishPreferencePublishHelp: '儲存目前文章並建立公開分享 URL。',
        publishPreferenceAutosave: '自動儲存',
        publishPreferenceAutosaveHelp: '停止輸入 10 秒後自動儲存修改。',
        publishPreferencePublicIndex: '公開索引',
        publishPreferencePublicIndexHelp: '將分享 URL 加入 sitemap.xml，讓搜尋引擎有機會找到。',
        publishPreferencesRemembered: '這些選擇會記錄在這台裝置。',
        publicationDraft: '尚未發布',
        publicationPublished: '已發布',
        publicationUrl: '分享 URL',
        publicationVersions: '保留版本',
        publicationViews: '不重複瀏覽',
        publicationUpdated: '最後儲存',
        publicationPendingHint: '發布後會在這裡顯示分享 URL 與讀者統計。',
        later: '稍後',
        unpublishConfirm: '確定要取消發布此分享連結嗎？',
        uploadFailed: '上傳失敗',
        uploadError: '上傳錯誤: ',
        uploading: '上傳中...',
        err: '出錯了',
        pepw: '請輸入密碼',
        passwordConfirm: '確認',
        passwordCancel: '取消',
        pwcnbe: '密碼不能為空！',
        enpw: '輸入新密碼（留空可清除當前密碼）',
        pwss: '密碼設置成功！',
        pwrs: '密碼清除成功！',
        shareAndHistory: '分享與版本',
        history: '版本',
        historyTitle: '版本紀錄',
        historyPreview: '預覽',
        historyRaw: '原文',
        historyRefresh: '刷新',
        historyRestore: '還原',
        historyCopyContent: '複製內容',
        historyCurrentVersion: '目前版本',
        historySelectedVersion: '選取版本',
        historyNoSelection: '請先選一個版本來比較。',
        historyLoading: '正在讀取版本紀錄...',
        historyEmpty: '目前還沒有可用的歷史版本。之後保留下來的舊版本會顯示在這裡。',
        historyDisabled: '此部署尚未開啟歷史版本功能。',
        historyUnavailableOnShare: '歷史版本只會在編輯頁提供。',
        historyRestoreConfirm: '確定要還原這個版本並覆蓋目前內容嗎？',
        historyRestoreDone: '已還原此版本。',
        historyCopiedContent: '已複製內容。',
        historyChars: '字',
    }
}
