import StringifyQuery from "../Helpers/StringifyQuery.js";

/**
 * Case for marking data as irrelevant.
 */
export default class MarkIrrelevant {
    _memorySeries

    _queryString

    /**
     * Init irrelevant marking.
     * @param {MemorySeries} memorySeries
     */
    constructor(memorySeries) {
        this._memorySeries = memorySeries
    }

    /**
     * Mark data as irrelevant.
     * @param key
     * @param query
     * @param aimObj
     * @returns {boolean|null}
     */
    mark(key = null, query = null, aimObj = null) {
        if (key === null && aimObj === null){
            this._queryString = query === null ? null : StringifyQuery.stringify(query)

            return this._memorySeries.markShortIrrelevant(this._queryString)
        }

        const objKey = key ?? this._memorySeries.genImageKey(aimObj)
        return this._memorySeries.markIrrelevant(String(objKey))
    }
}