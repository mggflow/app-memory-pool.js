/**
 * Create string by any query.
 */
export default class StringifyQuery {
    /**
     * Gen string for something.
     * @param query
     * @returns {?string}
     */
    static stringify(query) {
        if (query === undefined) return null

        return JSON.stringify(query)
    }
}