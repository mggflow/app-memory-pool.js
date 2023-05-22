import StringifyQuery from "../Helpers/StringifyQuery.js";

/**
 * Case for recalling irrelevant data.
 */
export default class RecallIrrelevant {
    _memorySeries

    _queryString

    /**
     * Init recalling irrelevant data.
     * @param {MemorySeries} memorySeries
     */
    constructor(memorySeries) {
        this._memorySeries = memorySeries
    }

    /**
     * Recall irrelevant data array.
     * @param query
     * @param withRelevance
     * @param relevanceTime
     * @returns {*[]|null}
     */
    recall(query = null, withRelevance = false, relevanceTime = null) {
        this._queryString = query === null ? null : StringifyQuery.stringify(query)

        return this._memorySeries.pullIrrelevant(this._queryString, withRelevance,
            false, null, relevanceTime)
    }

    /**
     * Recall data array of all irrelevant saved data.
     * @param withRelevance
     * @param relevanceTime
     * @returns {*[]|null}
     */
    recallAll(withRelevance = false, relevanceTime = null) {
        return this._memorySeries.pullIrrelevant(null, withRelevance,
            true, null, relevanceTime)
    }
}