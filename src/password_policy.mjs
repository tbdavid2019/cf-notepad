export const resolvePasswordRole = async (password, metadata = {}, passwordMatches) => {
    if (typeof passwordMatches !== 'function') throw new TypeError('passwordMatches must be a function')
    if (metadata.pw && await passwordMatches(password, metadata.pw)) return 'edit'
    if (metadata.vpw && await passwordMatches(password, metadata.vpw)) {
        return metadata.pw ? 'view' : 'edit'
    }
    return null
}
