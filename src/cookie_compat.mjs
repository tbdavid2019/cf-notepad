import { parseCookie, stringifySetCookie } from 'cookie'

export function parseRequestCookies(header) {
    return parseCookie(typeof header === 'string' ? header : '')
}

export function serializeResponseCookie(name, value, options = {}) {
    return stringifySetCookie({
        name,
        value,
        ...options,
    })
}

export const Cookies = {
    parse: parseRequestCookies,
    serialize: serializeResponseCookie,
}
