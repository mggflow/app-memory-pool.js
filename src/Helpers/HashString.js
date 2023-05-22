/**
 * Hashing.
 */
export default class HashString {
    /**
     * Get integer hash of string.
     * @param {string} s
     * @returns {number}
     */
    static hash(s) {
        return [...s].reduce(
            (hash, c) => (Math.imul(31, hash) + c.charCodeAt(0)) | 0,
            0
        )
    }
}