import {describe, expect, test} from '@jest/globals';
import StringifyQuery from "../src/Helpers/StringifyQuery.js";


describe('Check different types bringing to string', () => {
    test('null', () => {
        expect(typeof StringifyQuery.stringify(null)).toBe('string')
    });
    test('boolean', () => {
        expect(typeof StringifyQuery.stringify(true)).toBe('string')
    });
    test('undefined', () => {
        expect(StringifyQuery.stringify(undefined)).toBe(null)
    });
    test('Number', () => {
        expect(typeof StringifyQuery.stringify(1029.1)).toBe('string')
    });
    test('Object', () => {
        expect(typeof StringifyQuery.stringify({val: Math.random()})).toBe('string')
    });
    test('Nested Object', () => {
        expect(typeof StringifyQuery.stringify({val: Math.random(), next: {val: 'val'}})).toBe('string')
    });
    test('Array', () => {
        expect(typeof StringifyQuery.stringify([1, 2, 3, '4'])).toBe('string')
    });
    test('Nested Array', () => {
        expect(typeof StringifyQuery.stringify([[1], [2], [3, '4']])).toBe('string')
    });
});