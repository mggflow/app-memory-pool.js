import {describe, expect, test} from '@jest/globals';
import MemoryPool from "../src/MemoryPool.js";

const mpOptions = {
    relevanceTime: 60,
    maxKeyLength: 32
}

const formatUsers = (users) => {
    return users.map((u) => ({
        id: u['id'] ?? 0,
        name: u['name'] ?? 'Unnamed',
        age: u['age'] ?? null
    }))
}

const observer = {
    countUsers: (parent, users) => parent.cnt = users.length ?? 0,
    cnt: 0
}
const insight1 = (users) => observer.countUsers(observer, users)

const loadedUsers = [
    {id: 1, name: 'Alex'},
    {id: 2, age: 21},
    {name: 'Mary', age: 23}
]
const expectedFormattedUsers = [
    {id: 1, name: 'Alex', age: null},
    {id: 2, name: 'Unnamed', age: 21},
    {id: 0, name: 'Mary', age: 23}
]

const MP = MemoryPool


describe('Test expected behavior', () => {
    test('simple save', () => {
        MP.init('users1', mpOptions)
        MP.mem('users1').rem.remember(loadedUsers)

        const rememberedUsers = MP.mem('users1').rec.recall()
        expect(rememberedUsers).toEqual(loadedUsers)
    });

    test('simple save with handling', () => {
        MP.init('users', mpOptions)
        const query = {find: 'new', count: 3}

        MP.mem('users').rem.addNormalizer(formatUsers)
        MP.mem('users').rem.addInsight(insight1, false)
        MP.mem('users').rem.remember(loadedUsers, query)

        const rememberedUsers = MP.mem('users').rec.recall(query)
        expect(rememberedUsers).toHaveLength(loadedUsers.length)
        expect(rememberedUsers).toHaveLength(observer.cnt)
        expect(rememberedUsers).toEqual(expectedFormattedUsers)
    });

    test('get with relevance', () => {
        MP.init('users2', mpOptions)

        const now = (new Date()).getTime()
        MP.mem('users2').rem.remember(loadedUsers)

        const remUsersWithRelevance = MP.mem('users2').rec.recall(null, true)
        for (let [_user, relevance] of remUsersWithRelevance) {
            expect(relevance).toBeGreaterThanOrEqual(now)
        }
    });

    test('marking as irrelevant', () => {
        MP.init('users3', mpOptions)

        MP.mem('users3').rem.remember(loadedUsers)
        MP.mem('users3').irrMark.mark()

        expect(MP.mem('users3').rec.recall()).toBe(null)
        expect(MP.mem('users3').rec.recall(null, true, true))
            .toHaveLength(loadedUsers.length)
        expect(MP.mem('users3').rec.recall(null, false, true))
            .toHaveLength(loadedUsers.length)
    });

    test('get irrelevant', () => {
        MP.init('users5', mpOptions)

        MP.mem('users5').rem.remember(loadedUsers)
        MP.mem('users5').irrMark.mark()

        expect(MP.mem('users3').rec.recall()).toBe(null)
        expect(MP.mem('users5').irrRec.recall()).toHaveLength(loadedUsers.length)
        MP.mem('users5').rem.remember({id: 4}, 'addition')
        MP.mem('users5').irrMark.mark(null, 'addition')
        expect(MP.mem('users5').irrRec.recall()).toHaveLength(loadedUsers.length)
        expect(MP.mem('users5').irrRec.recallAll()).toHaveLength(loadedUsers.length + 1)
    });

    test('pull all', () => {
        const users4 = MP.init('users4', mpOptions)

        users4.rem.remember(loadedUsers)
        users4.rem.remember({id: 4})

        expect(users4.memories.pullLong()).toHaveLength(loadedUsers.length + 1)
    });
});