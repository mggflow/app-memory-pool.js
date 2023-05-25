# App Memory Pool

JS library that simplifies and optimizes data management in the web application

## Installation

```
npm i @mggflow/app-memory-pool
```

## Description

This library let you store any data by general hash tables, control data relevance by storing its time stamps and
process
any data selection.

Main cases:

1. User visit your web interface -> app loads data from backend by some query -> you need store these data comfortable
2. User visit same web interface in short time -> app need get these data by query without repeating request to backend
    1. You can control time that allows to use data saved before
    2. You can get only irrelevant data to update only these data
    3. You can get data with its last load time stamps
    4. You can mark data as irrelevant manually
    5. You can get all accumulated data for local search or something else
    6. You can easily remove saved data

## Usage

Prepare static class:

```
const MP = MemoryPool
```

Options are small:

```
const mpOptions = {
    relevanceTime: 60,
    maxKeyLength: 32
}
```

At first needs to initiate data family:

```
const users = MP.init('users', mpOptions)
```

To check if MemoryPool has your data family:

```
if (MP.has('users')) {...}
```

To access your data family:

```
// Users is AppMemory object
users.*
// or
MP.mem('users') // Returns AppMemory object
```

To simple save data:

```
MP.mem('users').rem.remember(usersArray)
const rememberedUsers = MP.mem('users').rec.recall()
```

To save data by any queries:

```
const query = {find: 'new', count: 3}
MP.mem('users').rem.remember(usersArray, query)
const rememberedUsers = MP.mem('users').rec.recall(query)
```

You can add data normalizers (or any handlers) which will be called when data is remembering (its result will be saved):

```
const formatUsers = (users) => {
    return users.map((u) => ({
        id: u['id'] ?? 0,
        name: u['name'] ?? 'Unnamed',
        age: u['age'] ?? null
    }))
}

MP.mem('users').rem.addNormalizer(formatUsers)
```

You can add "insights" - these functions will be called after data was saved:

```
const observer = {
    countUsers: (parent, users) => parent.cnt = users.length ?? 0,
    cnt: 0
}
const insight1 = (users) => observer.countUsers(observer, users)

MP.mem('users').rem.addInsight(insight1, false)
```

To get data with its time stamps:

```
MP.mem('users').rem.remember(usersArray)
const remUsersWithRelevance = MP.mem('users').rec.recall(null, true)
```

To mark data as irrelevant:
```
// data saved last (without query) will be marked as irrelevant
MP.mem('users').irrMark.mark()
```

To get irrelevant data:
```
// Irrelevant users from last addition
const irrUsers = MP.mem('users').irrRec.recall()
```

To get all saved data:
```
const allUsers = users.memories.pullLong()
```

To remove data:
```
// Remove last users selection
MP.mem('users').memories.oblivion()

// Remove all users selections
MP.mem('users').memories.oblivion(null, true)

// Remove relevance (time stamps) info about all users
MP.mem('users').memories.oblivion(null, false, false, true)

// Remove all users data
MP.mem('users').memories.oblivion(null, false, true)
```