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
    memories

    /**
     * @type {Remember}
     */
    rem
    /**
     * @type {Recall}
     */
    rec
    /**
     * @type {MarkIrrelevant}
     */
    irrMark
    /**
     * @type {RecallIrrelevant}
     */
    irrRec

    /**
     * Init app memory.
     * @param options
     */
    constructor(options = {}) {
        this.options = options
        this.memories = new MemorySeries()

        this.rem = new Remember(this.memories)
        this.rec = new Recall(this.memories)
        this.irrMark = new MarkIrrelevant(this.memories)
        this.irrRec = new RecallIrrelevant(this.memories)

        this._setUpOptions()
    }

    _setUpOptions() {
        if (this.options.relevanceTime !== undefined) {
            this.memories.setRelevanceTime(this.options.relevanceTime)
        }
        if (this.options.maxKeyLength !== undefined) {
            this.memories.setMaxKeyLength(this.options.maxKeyLength)
        }
    }

}