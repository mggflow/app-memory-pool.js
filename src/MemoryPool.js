import AppMemory from "./AppMemory.js";

/**
 * Similar to factory for creating and storing app memories for different data families.
 */
export default class MemoryPool {
    static _memories = new Map()

    /**
     * Init new app memory for data family.
     * @param dataFamilyName
     * @param appMemoryOptions
     * @returns {AppMemory}
     */
    static init(dataFamilyName, appMemoryOptions = {}) {
        this._memories.set(dataFamilyName, new AppMemory(appMemoryOptions))

        return this.mem(dataFamilyName)
    }

    /**
     * Contact to app memory for data family.
     * @param dataFamilyName
     * @returns {AppMemory|null}
     */
    static mem(dataFamilyName) {
        if (!this._memories.has(dataFamilyName)) return null

        return this._memories.get(dataFamilyName)
    }

    /**
     * Check if pool has app memory for data family.
     * @param dataFamilyName
     * @returns {boolean}
     */
    static has(dataFamilyName) {
        return this._memories.has(dataFamilyName)
    }
}