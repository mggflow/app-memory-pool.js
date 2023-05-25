import {describe, expect, test} from '@jest/globals';
import HashString from "../src/Helpers/HashString.js";

const amount = 3_000_000
const step = 3000
const maxCode = 65535

describe('Test random strings for unique and uniqueness of hashing', () => {
    const hashes = []
    const sCodes = []
    for (let i = 0; i < amount; i += step) {
        test('check: ' + String.fromCharCode(...sCodes) + '; hL: ' + hashes.length, () => {
            const pos = Math.floor(i / maxCode)
            if (sCodes[pos] === undefined) sCodes.push(0)

            const s = String.fromCharCode(...sCodes)
            const hash = HashString.hash(s)
            const searchIndex = hashes.indexOf(hash)
            expect(hash).toBe(HashString.hash(s))
            expect(searchIndex).toBe(-1)
            hashes.push(hash)
            sCodes[pos]++
        });
    }
});