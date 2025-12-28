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
export const ENABLE_R2 = SCN_ENABLE_R2 === '1'
export const R2_DOMAIN = SCN_R2_DOMAIN
export const APP_NAME = (typeof SCN_APP_NAME !== 'undefined') ? SCN_APP_NAME : 'david888 wiki'

// supported language
export const SUPPORTED_LANG = {
    'en': {
        setPW: 'Set Password',
        changePW: 'Change Password',
        share: 'Share',
        lastModified: 'Last Modified',
        copy: 'Copy',
        emptyPH: 'There are many like it, but this one is mine...',
        tipEncrypt: 'This Note has been encrypted, please enter password!',
        tip404: '404, Nothing here',
    },
    'zh-CN': {
        setPW: '设置密码',
        changePW: '修改密码',
        share: '分享',
        lastModified: '上次保存',
        copy: '复制',
        emptyPH: '看来你是第一个到这儿的人，写点什么吧...',
        tipEncrypt: '这是一篇加密笔记，你必须先输入密码',
        tip404: '404，你要找的东西并不存在',
    },
    'zh-TW': {
        setPW: '設置密碼',
        changePW: '修改密碼',
        share: '分享',
        lastModified: '上次保存',
        copy: '複製',
        emptyPH: '看來你是第一個到這裡的人，寫點什麼吧...',
        tipEncrypt: '這是一篇加密筆記，你必須先輸入密碼',
        tip404: '404，你要找的東西並不存在',
    }
}