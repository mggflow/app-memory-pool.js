import {describe, expect, test} from '@jest/globals';
import MemorySeries from "../src/Structures/MemorySeries.js";

describe('Check expected behavior', () => {

    test('setRelevanceTime', () => {
        const ms = new MemorySeries()
        const relTime = 10
        ms.setRelevanceTime(relTime)
        const now = (new Date()).getTime()
        const oldObj = {id: 1}
        const freshObj = {id: 2}
        ms.save(oldObj, null, -relTime * 1000)
        ms.save(freshObj, null, now)

        const irrelevant = ms.pullIrrelevant(null, false, false, now + relTime / 2)

        expect(irrelevant).toBeInstanceOf(Array)
        expect(irrelevant.length).toBe(1)
        expect(irrelevant[0]).toBe(oldObj)
    });

    test('setMaxKeyLength', () => {
        const ms = new MemorySeries()
        const maxKeyLength = 9
        ms.setMaxKeyLength(maxKeyLength)

        const maxKeyable = "x".repeat(maxKeyLength)
        ms.save(maxKeyable)

        const keys = ms.getShortKeys()
        expect(keys).toBeInstanceOf(Array)
        expect(keys).toHaveLength(1)
        expect(keys[0]).toHaveLength(maxKeyLength)
        expect(keys[0]).toBe(maxKeyable)

        const overMaxKeyable = maxKeyable + 'y'
        ms.save(overMaxKeyable)
        expect(keys).toHaveLength(2)
        expect(keys[1].length).toBeGreaterThan(maxKeyLength)
        expect(keys[1]).not.toBe(overMaxKeyable)
        expect(keys[1]).not.toBe(maxKeyable)
    });

    test('setKeyGenerator', () => {
        const ms = new MemorySeries()
        ms.setKeyGenerator((value) => JSON.stringify(value))
        const image = {k: 'v'}
        ms.save(image)
        expect(ms.pull(JSON.stringify(image))).toBe(image)
    });

    test('singleSave', () => {
        const ms = new MemorySeries()

        const image1 = {id: 1, k: 'v'}
        const image1New = {id: 1, k: 'v2'}
        const image2 = {id: 2, k: 'w'}
        const image3 = {id: 3, k: 'x'}

        const now = (new Date()).getTime()
        const outdatedTime = now - 100 * 1000

        const key1 = ms.save(image1, null, now)
        ms.save(image1New, null, now)
        ms.save(image2, 'class1', outdatedTime)
        ms.save(image3, 'class1', now)

        expect(ms.pull(key1)).toBe(image1New)
        expect(ms.pullShort('class1')).toEqual([image2, image3])
        expect(ms.pullIrrelevant('class1')).toEqual([image2])
        expect(ms.pullLong(true)).toEqual([
            [image1New, now],
            [image2, outdatedTime],
            [image3, now]
        ])
    });

    test('pluralSave', () => {
        const ms = new MemorySeries()

        const images1 = [
            {'id': 1, 'v': 1},
            {'id': 2, 'v': 2},
            {'id': 3, 'v': 3}
        ]

        const images2 = [
            {'id': 3, 'v': 2.1},
            {'id': 4, 'v': 4}
        ]

        const now = (new Date()).getTime()

        const keys = ms.saveAny(images1, null, now)


        expect(keys).toEqual(['1', '2', '3'])
        expect(ms.pullAny(keys)).toEqual(images1)
        expect(ms.pullShort()).toEqual(images1)

        ms.saveAny(images2, 'class')
        expect(ms.pullShort()).not.toEqual(images1)
        expect(ms.pullShort('class')).toEqual(images2)
        expect(ms.pullLong()).toHaveLength(images1.length + images2.length - 1)
    });

    test('pullIrrelevantAmongAll', () => {
        const ms = new MemorySeries()
        const irrelevantImage = {'ID': 1}

        const now = (new Date()).getTime()
        const outdatedTime = now - 100 * 1000

        ms.save(irrelevantImage, 'class1', outdatedTime)
        ms.save({id: 2, 'value': 'some'}, 'class2', now)

        const irrelevantAmongAll = ms.pullIrrelevant(null, false, true, now)

        expect(irrelevantAmongAll).toHaveLength(1)
        expect(irrelevantAmongAll[0]).toBe(irrelevantImage)
    });

    test('relevanceChecking', () => {
        const ms = new MemorySeries()
        const irrelevantImage = {'ID': 1}

        const now = (new Date()).getTime()
        const outdatedTime = now - 100 * 1000

        const irrelevantKey = ms.save(irrelevantImage, 'class1', outdatedTime)
        const relevantKey = ms.save({id: 2, 'value': 'some'}, 'class2', now)

        expect(ms.isRelevant(irrelevantKey, now)).toBeFalsy()
        expect(ms.isRelevant(relevantKey, now)).toBeTruthy()
        expect(ms.shortIsRelevant('class1', now)).toBeFalsy()
        expect(ms.shortIsRelevant('class2', now)).toBeTruthy()
    });

    test('irrelevanceMarking', () => {
        const ms = new MemorySeries()
        const image1 = {'ID': 1}
        const image2 = {'Id': 2}

        const key = ms.save(image1)
        ms.saveAny([image2], 'class1')
        expect(ms.isRelevant(key)).toBeTruthy()
        ms.markIrrelevant(key)
        expect(ms.isRelevant(key)).toBeFalsy()

        expect(ms.shortIsRelevant('class1')).toBeTruthy()
        ms.markShortIrrelevant('class1')
        expect(ms.shortIsRelevant('class1')).toBeFalsy()

        const irrelevant = ms.pullIrrelevant(null, false, true)
        expect(irrelevant).toEqual([image1, image2])
    });

    test('memoryCleaning', () => {
        const ms = new MemorySeries()
        const image1 = {'ID': 1}
        const image2 = {'Id': 2}

        const now = (new Date()).getTime()
        const key = ms.save(image1, now)
        ms.oblivion()
        expect(ms.pullShort()).toBe(null)
        expect(ms.pullLong()).toHaveLength(1)

        ms.saveAny([image2], 'class1', now)
        ms.oblivion(null, true)
        expect(ms.pullShort('class1')).toBe(null)
        expect(ms.pullLong()).toHaveLength(2)
        expect(ms.pull(key, true)[1]).toBe(now)
        ms.oblivion(null, false, false, true)
        expect(ms.pull(key, true)[1]).not.toBe(now)
        ms.oblivion(null, false, true)
        expect(ms.pullLong()).toHaveLength(0)
    });


});