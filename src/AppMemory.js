import MemorySeries from "./Structures/MemorySeries.js";
import Remember from "./Cases/Remember.js";
import Recall from "./Cases/Recall.js";
import RecallIrrelevant from "./Cases/RecallIrrelevant.js";
import MarkIrrelevant from "./Cases/MarkIrrelevant.js";

/**
 * Union of cases for processing app data in memory.
 */
export default class AppMemory {
    options = {}

    /**
     * @type {MemorySeries}
     */
    memorySeries

    /**
     * @type {Remember}
     */
    remembrance
    /**
     * @type {Recall}
     */
    recalling
    /**
     * @type {MarkIrrelevant}
     */
    marking
    /**
     * @type {RecallIrrelevant}
     */
    irrelevant

    /**
     * Init app memory.
     * @param options
     */
    constructor(options = {}) {
        this.options = options
        this.memorySeries = new MemorySeries()

        this.remembrance = new Remember(this.memorySeries)
        this.recalling = new Recall(this.memorySeries)
        this.marking = new MarkIrrelevant(this.memorySeries)
        this.irrelevant = new RecallIrrelevant(this.memorySeries)

        this._setUpOptions()
    }

    _setUpOptions() {
        if (this.options.relevanceTime !== undefined) {
            this.memorySeries.setRelevanceTime(this.options.relevanceTime)
        }
        if (this.options.maxKeyLength !== undefined) {
            this.memorySeries.setMaxKeyLength(this.options.maxKeyLength)
        }
    }

}