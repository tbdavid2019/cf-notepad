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
export const APP_NAME = (typeof SCN_APP_NAME !== 'undefined') ? SCN_APP_NAME : 'david888 wiki'


// supported language
export const SUPPORTED_LANG = {
    'en': {
        setPW: 'Edit Password',
        changePW: 'Change Password',
        setViewPW: 'View Password',
        changeViewPW: 'Change View PW',
        share: 'Share URL',
        lastModified: 'Last Modified',
        copy: 'Copy',
        emptyPH: 'There are many like it, but this one is mine...',
        tipEncrypt: 'This Note has been encrypted, please enter password!',
        tip404: '404, Nothing here',
    },
    'zh-CN': {
        setPW: '设置编辑密码',
        changePW: '修改编辑密码',
        setViewPW: '设置查看密码',
        changeViewPW: '修改查看密码',
        share: '發布分享',
        lastModified: '上次保存',
        copy: '复制',
        emptyPH: '看来你是第一个到这儿的人，写点什么吧...寫完後，記得按下發布分享按鈕取得URL',
        tipEncrypt: '这是一篇加密笔记，你必须先输入密码',
        tip404: '404，你要找的东西并不存在',
    },
    'zh-TW': {
        setPW: '設定編輯密碼',
        changePW: '修改編輯密碼',
        setViewPW: '設定查看密碼',
        changeViewPW: '修改查看密碼',
        share: '發布分享',
        lastModified: '上次保存',
        copy: '複製',
        emptyPH: '看來你是第一個到這裡的人，寫點什麼吧...寫完後，記得按下發布分享按鈕取得URL',
        tipEncrypt: '這是一篇加密筆記，你必須先輸入密碼',
        tip404: '404，你要找的東西並不存在',
    }
}