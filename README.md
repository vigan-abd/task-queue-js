# task-queue-js

NodeJS task queue work running asynchronous functions

## Installing
```console
npm install --save-prod @vigan-abd/task-queue-js
```

## Testing
```
npm test
```

## Usage
```javascript
const { TaskQueue, TaskPriorityQueue } = require('@vigan-abd/task-queue-js')

const main = async () => {
  const tq = new TaskQueue()
  tq.initQueue('foo')

  const calcs = []
  const someTask = async (ms, i) => {
    await new Promise(resolve => setTimeout(resolve, ms))
    calcs.push(i)
    return i
  }

  const promises = []
  promises.push(tq.pushTask('foo', () => someTask(3000, 1)))
  promises.push(tq.pushTask('foo', () => someTask(5000, 2)))
  promises.push(tq.pushTask('foo', () => someTask(1000, 3)))
  promises.push(tq.pushTask('foo', () => someTask(1000, 4)))

  const batchRes = await Promise.all(promises)
  console.log('batch results', batchRes, calcs)

  const pq = new TaskPriorityQueue()
  pq.initQueue('bar')

  const prioriyPromises = []
  prioriyPromises.push(pq.pushTask('bar', () => someTask(3000, 1), 2)) // number of priority 2
  prioriyPromises.push(pq.pushTask('bar', () => someTask(4000, 2), 1)) // number of priority 1 - higher priority
  prioriyPromises.push(pq.pushTask('bar', () => someTask(2000, 3), 5)) // number of priority 5 - low priority
  prioriyPromises.push(pq.pushTask('bar', () => someTask(1000, 4), 1))

  const priorityBatchRes = await Promise.all(promises)
  console.log('priority batch results', priorityBatchRes, calcs.slice(4))
}

main().catch(console.error)
```

More examples can be found under examples directory!

## Authors
- vigan.abd
