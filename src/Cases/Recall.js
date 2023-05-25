import StringifyQuery from "../Helpers/StringifyQuery.js";

/**
 * Case for recalling data, saved before.
 */
export default class Recall {
    _memorySeries

    _queryString

    /**
     * Init recalling data.
     * @param {MemorySeries} memorySeries
     */
    constructor(memorySeries) {
        this._memorySeries = memorySeries
    }

    /**
     * Get array of data, saved before.
     * @param query
     * @param withRelevance
     * @param anyway
     * @returns {*[]|null}
     */
    recall(query = null, withRelevance = false, anyway = false) {
        this._queryString = query === null ? null : StringifyQuery.stringify(query)

        if (anyway || this._memorySeries.shortIsRelevant(this._queryString)) {
            return this._memorySeries.pullShort(this._queryString, withRelevance)
        }

        return null
    }
}