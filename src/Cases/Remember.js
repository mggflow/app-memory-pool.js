import StringifyQuery from "../Helpers/StringifyQuery.js";

/**
 * Case or remembrance date for recalling in the future.
 */
export default class Remember {
    _memorySeries

    /**
     * Array of normalization functions for incoming data.
     * @type {function[]}
     */
    normalizers
    /**
     * Array of callbacks calling after data was remembered.
     * @type {*[]}
     */
    insights

    _dataArr
    _queryString
    _normalizedData

    /**
     * Init data remembrance.
     * @param {MemorySeries} memorySeries
     */
    constructor(memorySeries) {
        this._memorySeries = memorySeries

        this.normalizers = []
        this.insights = []
    }

    /**
     * Add normalization function for incoming data.
     * @param {function} normalizer
     */
    addNormalizer(normalizer) {
        this.normalizers.push(normalizer)
    }

    /**
     * Add callback which will be triggered when data will be remembered.
     * @param {function} insight
     * @param withRelevance
     */
    addInsight(insight, withRelevance = false) {
        this.insights.push([insight, withRelevance])
    }

    /**
     * Remember data by query.
     * @param data
     * @param query
     */
    remember(data, query = null) {
        this._dataArr = Array.isArray(data) ? data : [data]
        this._queryString = query === null ? null : StringifyQuery.stringify(query)

        this._normalize()
        const keys = this._memorySeries.saveAny(
            this._normalizedData ?? this._dataArr,
            this._queryString,
            (new Date()).getTime()
        )
        this._applyInsights()

        return keys
    }

    _normalize() {
        for (let normalizer of this.normalizers) {
            this._normalizedData = normalizer(this._normalizedData ?? this._dataArr)
        }
    }

    _applyInsights() {
        for (let insightPair of this.insights) {
            insightPair[0](this._memorySeries.pullShort(this._queryString, insightPair[1]))
        }
    }
}