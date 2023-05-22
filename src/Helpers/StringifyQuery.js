/**
 * Create string by any query.
 */
export default class StringifyQuery {
    /**
     * Gen string for something.
     * @param query
     * @returns {string}
     */
    static stringify (query) {
        let s
        if (Array.isArray(query) || typeof query === 'object' && query !== null) {
            const predefinedId = query['id'] ?? query ['ID'] ?? query['Id'] ?? null
            s = predefinedId ? String(predefinedId) : JSON.stringify(query)
        } else {
            s = String(query)
        }

        return s
    }
}