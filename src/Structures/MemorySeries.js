import HashString from "../Helpers/HashString.js";

/**
 * Data structure responsible for storing data class objects, naming "images", in associative arrays (Map).
 * Also, it is providing relevance management for storing data images.
 */
export default class MemorySeries {
    /**
     * Max length of key for storing in Maps.
     * @type {number}
     */
    maxKeyLength = 32
    /**
     * Time in sec after that an image will be irrelevant.
     * @type {number}
     */
    relevanceTime = 60

    /**
     * Name of the default data class.
     * @type {string}
     */
    defaultClassKey = 'last'

    /**
     * Custom generator for images Map keys.
     * @type {function}
     */
    customKeyGenerator

    _longMemory
    _relevance
    _shortRelevance

    _shortMemory

    /**
     * Init Memory Series.
     */
    constructor() {
        this.customKeyGenerator = null

        this._longMemory = new Map()
        this._relevance = new Map()

        this._shortMemory = new Map()
        this._shortRelevance = new Map()
    }

    /**
     * Set Relevance time.
     * @param {number} timeSec
     */
    setRelevanceTime(timeSec) {
        this.relevanceTime = timeSec
    }

    /**
     * Set max key length for images storing.
     * @param {number} len
     */
    setMaxKeyLength(len) {
        this.maxKeyLength = len
    }

    /**
     * Set custom key generator for images storing.
     * @param {function} generator
     */
    setKeyGenerator(generator) {
        this.customKeyGenerator = generator
    }

    /**
     * Save one data image.
     * @param {*} image
     * @param classKey
     * @param nowMilli
     * @returns {string}
     */
    save(image, classKey = null, nowMilli = null) {
        const timeStamp = nowMilli ?? (new Date()).getTime()
        const classK = classKey ?? this.defaultClassKey
        const key = this.genImageKey(image)

        this._longMemory.set(key, image)

        this._addToRelevance(classK, key, timeStamp)
        this._addToShortMemory(classK, key, image)

        return key
    }

    /**
     * Save iterable data images.
     * @param images
     * @param classKey
     * @param nowMilli
     * @returns {null}
     */
    saveAny(images, classKey = null, nowMilli = null) {
        this.oblivion(classKey)

        for (let imageIndex in images) {
            this.save(images[imageIndex], classKey, nowMilli)
        }

        return this.getShortMemoryKeys()
    }

    /**
     * Get one data image by its key.
     * @param key
     * @param withRelevance
     * @returns {*|*[]}
     */
    pull(key, withRelevance = false) {
        const image = this._longMemory.has(key) ? this._longMemory.get(key) : null
        if (withRelevance) {
            return [
                image,
                this.getRelevance(key)
            ]
        }

        return image
    }

    /**
     * Get any data images by its keys.
     * @param {string[]} keys
     * @param withRelevance
     * @returns {*[]}
     */
    pullAny(keys, withRelevance = false) {
        return keys.map((key) => this.pull(key, withRelevance))
    }

    /**
     * Get data images from short memory by its data class key.
     * @param {?string} classKey
     * @param withRelevance
     * @returns {*[]|null}
     */
    pullShort(classKey = null, withRelevance = false) {
        const classK = classKey ?? this.defaultClassKey
        if (!this._shortMemory.has(classK)) return null

        return this.pullAny(this._shortMemory.get(classK), withRelevance)
    }

    /**
     * Get all data images storing in this memory series.
     * @param withRelevance
     * @returns {*[]}
     */
    pullLong(withRelevance = false) {
        const images = []
        for (let imageEntry of this._longMemory) {
            images.push(withRelevance ? [imageEntry[1], this.getRelevance(imageEntry[0])] : imageEntry[1])
        }

        return images
    }

    /**
     * Get irrelevant data images by data class or among all data images.
     * @param {?string} classKey
     * @param withRelevance
     * @param long
     * @param nowMilli
     * @param relevanceTime
     * @returns {*[]|null}
     */
    pullIrrelevant(classKey = null,
                   withRelevance = false, long = false,
                   nowMilli = null, relevanceTime = null
    ) {
        const images = []
        const keys = long ? this._longMemory.keys() : this.getShortMemoryKeys(classKey)
        if (keys === null) return null

        const timeStamp = (new Date()).getTime()
        for (let key of keys) {
            if (this.isRelevant(key, timeStamp, relevanceTime)) continue

            images.push(this.pull(key, withRelevance))
        }

        return images
    }

    /**
     * Check if data image by its key is relevant.
     * @param {string} key
     * @param nowMilli
     * @param relevanceTime
     * @returns {boolean}
     */
    isRelevant(key, nowMilli = null, relevanceTime = null) {
        const timeStamp = nowMilli ?? (new Date()).getTime()
        return (!this._relevance.has(key))
            || (timeStamp - this._relevance.get(key)) <= (relevanceTime ?? this.relevanceTime) * 1000
    }

    /**
     * Check if data class is relevant in short memory.
     * @param {?string} classKey
     * @param nowMilli
     * @param relevanceTime
     * @returns {boolean|null}
     */
    shortIsRelevant(classKey = null, nowMilli = null, relevanceTime = null) {
        const classK = classKey ?? this.defaultClassKey
        const timeStamp = nowMilli ?? (new Date()).getTime()

        if (!this._shortRelevance.has(classK)) return null

        return (timeStamp - this._shortRelevance.get(classK)) <= (relevanceTime ?? this.relevanceTime) * 1000
    }

    /**
     * Mark data image as irrelevant by its key.
     * @param {string} imageKey
     * @returns {boolean|null}
     */
    markIrrelevant(imageKey) {
        if (!this._relevance.has(imageKey)) return null

        this._relevance.set(imageKey, 0)

        return true
    }

    /**
     * Mark data images class in short memory as irrelevant.
     * @param classKey
     * @returns {boolean|null}
     */
    markShortIrrelevant(classKey = null) {
        const classK = classKey ?? this.defaultClassKey
        const shortKeys = this.getShortMemoryKeys(classK)
        if (shortKeys === null) return null

        for (let key of shortKeys) {
            this.markIrrelevant(key)
        }

        if (!this._shortRelevance.has(classK)) return null
        this._shortRelevance.set(classK, 0)

        return true
    }

    /**
     * Remove data images from short/long memory or/and remove relevance data.
     * @param {?string} classKey
     * @param short
     * @param long
     * @param relevance
     */
    oblivion(classKey = null, short = null, long = null, relevance = null) {
        if (!short && !long && !relevance) {
            const classK = classKey ?? this.defaultClassKey
            if (this._shortMemory.has(classK)) this._shortMemory.delete(classK)
            if (this._shortRelevance.has(classK)) this._shortRelevance.delete(classK)
        }

        if (short || long) {
            this._shortMemory.clear()
            this._shortRelevance.clear()
        }

        if (long) {
            this._longMemory.clear()
        }

        if (relevance || long) {
            this._relevance.clear()
            this._shortRelevance.clear()
        }
    }

    /**
     * Get images keys for short memory data class.
     * @param classKey
     * @returns {string[]|null}
     */
    getShortMemoryKeys(classKey = null) {
        const classK = classKey ?? this.defaultClassKey

        return this._shortMemory.has(classK) ? this._shortMemory.get(classK) : null
    }

    /**
     * Get relevance time in milli sec for data image by its key.
     * @param key
     * @returns {number|null}
     */
    getRelevance(key) {
        return this._relevance.has(key) ? this._relevance.get(key) : null
    }

    /**
     * Gen data image key.
     * @param image
     * @returns {?string}
     */
    genImageKey(image) {
        if (this.customKeyGenerator) {
            return this.customKeyGenerator(image, this.maxKeyLength)
        }

        return this._defaultGenImageKey(image)
    }

    _defaultGenImageKey(image) {
        const type = typeof image
        if (image === null || image === undefined || type === 'function') return null

        let keyValue
        if (Array.isArray(image) || type === 'object') {
            const predefinedId = image['id'] ?? image ['ID'] ?? image['Id'] ?? null
            keyValue = predefinedId ? String(predefinedId) : JSON.stringify(image)
        } else {
            keyValue = String(image)
        }

        if (keyValue.length > this.maxKeyLength) {
            const hashVal = String(HashString.hash(keyValue))

            let prefix = ''
            while (hashVal.length + prefix.length <= this.maxKeyLength) prefix += 'x'

            return prefix + hashVal
        }

        return keyValue
    }

    _addToShortMemory(classKey, imageKey) {
        if (!this._shortMemory.has(classKey)) {
            this._shortMemory.set(classKey, [imageKey])
            return
        }

        this._shortMemory.get(classKey).push(imageKey)
    }

    _addToRelevance(classKey, imageKey, timeStamp) {
        this._relevance.set(imageKey, timeStamp)
        if (this._shortRelevance.has(classKey)) {
            this._shortRelevance.set(classKey, Math.min(this._shortRelevance.get(classKey), timeStamp))
        } else {
            this._shortRelevance.set(classKey, timeStamp)
        }
    }
}