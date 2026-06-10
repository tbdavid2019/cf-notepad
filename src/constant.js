// static CDN
// static CDN
export const CDN_PREFIX = 'https://cdn.jsdelivr.net/npm'

// server side salt
export const SALT = SCN_SALT
// server side secret
export const SECRET = SCN_SECRET

// admin
export const ADMIN_PATH = SCN_ADMIN_PATH || '/admin'
export const ADMIN_PW = SCN_ADMIN_PW
export const SLUG_LENGTH = parseInt(SCN_SLUG_LENGTH || '3')
// Access R2 config at runtime instead of module load time
export const getEnableR2 = () => (typeof SCN_ENABLE_R2 !== 'undefined' && SCN_ENABLE_R2 === '1')
export const getR2Domain = () => (typeof SCN_R2_DOMAIN !== 'undefined' ? SCN_R2_DOMAIN : '')
export const getGaMeasurementId = () => (typeof SCN_GA_MEASUREMENT_ID !== 'undefined' ? String(SCN_GA_MEASUREMENT_ID || '').trim() : '')
export const APP_NAME = (typeof SCN_APP_NAME !== 'undefined') ? SCN_APP_NAME : 'david888 wiki'

// supported language
export const SUPPORTED_LANG = {
    'en-US': {
        setPW: 'Edit Lock',
        changePW: 'Edit Lock',
        setViewPW: 'Read Lock',
        changeViewPW: 'Read Lock',
        share: 'Share URL',
        preview: 'Preview',
        lastModified: 'Saved',
        copy: 'Copy',
        copied: 'Copied!',
        copyFailed: 'Copy failed',
        emptyPH: 'There are many like it, but this one is mine...',
        tipEncrypt: 'This Note has been encrypted, please enter password!',
        tip404: '404, Nothing here',
        published: 'Published:',
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
        language: 'Language',
        publishNudgeTitle: 'Ready to publish?',
        publishNudgeText: 'You have been editing for a while. Publish this note to get a share URL.',
        publishNow: 'Publish',
        later: 'Later',
        unpublishConfirm: 'Unpublish this share link?',
        uploadFailed: 'Upload failed',
        uploadError: 'Upload error: ',
        uploading: 'Uploading...',
        err: 'Error',
        pepw: 'Please enter password.',
        pwcnbe: 'Password is empty!',
        enpw: 'Enter a new password (Keeping it empty will remove the current password)',
        pwss: 'Password set successfully.',
        pwrs: 'Password removed successfully.',
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
        emptyPH: '看來你是第一個到這裡的人，寫點什麼吧...寫完後，記得按下發布分享按鈕取得URL',
        tipEncrypt: '這是一篇加密筆記，你必須先輸入密碼',
        tip404: '404，你要找的東西並不存在',
        published: '已發布:',
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
        language: '語言',
        publishNudgeTitle: '要發布分享嗎？',
        publishNudgeText: '你已在輸入區停留一段時間。發布後即可取得分享 URL。',
        publishNow: '發布',
        later: '稍後',
        unpublishConfirm: '確定要取消發布此分享連結嗎？',
        uploadFailed: '上傳失敗',
        uploadError: '上傳錯誤: ',
        uploading: '上傳中...',
        err: '出錯了',
        pepw: '請輸入密碼',
        pwcnbe: '密碼不能為空！',
        enpw: '輸入新密碼（留空可清除當前密碼）',
        pwss: '密碼設置成功！',
        pwrs: '密碼清除成功！',
    }
}
