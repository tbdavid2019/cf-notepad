/**
 * src/templates/pages.js
 * NeedPasswd and Page404 template functions
 */
import { SUPPORTED_LANG } from '../constant'
import { HTML } from './base'

export const NeedPasswd = data => HTML({ tips: SUPPORTED_LANG[data.lang].tipEncrypt, showPwPrompt: true, ...data })
export const Page404 = data => HTML({ tips: SUPPORTED_LANG[data.lang].tip404, ...data })
