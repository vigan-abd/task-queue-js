'use strict'

const { TaskQueue } = require('../index')

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
}

main().catch(console.error)
