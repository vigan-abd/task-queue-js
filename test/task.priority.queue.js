'use strict'

/* eslint-env mocha */

const assert = require('assert')
const { TaskPriorityQueue } = require('../')
const { sleep } = require('./helper')

describe('TaskPriorityQueue tests', () => {
  describe('hasQueue tests', () => {
    it('should return false when queue does not exist', () => {
      const tq = new TaskPriorityQueue()

      assert.strictEqual(tq.hasQueue('foo'), false)
    })

    it('should return true when queue exists', () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo')

      assert.strictEqual(tq.hasQueue('foo'), true)
    })
  })

  describe('initQueue tests', () => {
    it('should return true when queue does not exist', () => {
      const tq = new TaskPriorityQueue()
      const res = tq.initQueue('foo')

      assert.strictEqual(res, true)
      assert.strictEqual(tq.hasQueue('foo'), true)
    })

    it('should return true when queue already exists', () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo')
      const res = tq.initQueue('foo')

      assert.strictEqual(res, false)
      assert.strictEqual(tq.hasQueue('foo'), true)
    })
  })

  describe('getQueue tests', () => {
    it('should return undefined when queue does not exist', () => {
      const tq = new TaskPriorityQueue()
      const res = tq.getQueue('foo')

      assert.strictEqual(res, undefined)
    })

    it('should return instance of async queue when it exists', () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo')
      const res = tq.getQueue('foo')

      assert.strictEqual(typeof res, 'object')
      assert.strictEqual(res.concurrency, 1)
    })
  })

  describe('pushTask tests', () => {
    const job = async (mts, i, arr) => {
      await sleep(mts)
      arr.push(i)
      return i
    }

    it('should reject when queue does not exist', async () => {
      const tq = new TaskPriorityQueue()

      await assert.rejects(
        tq.pushTask('foo', async () => 123, 2),
        (err) => {
          assert.ok(err instanceof Error)
          assert.strictEqual(err.message, 'ERR_TASK_QUEUE_NOT_FOUND')
          return true
        }
      )
    })

    it('should process promise and return result', async () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo')
      const res = await tq.pushTask('foo', async () => {
        await sleep(500)
        return 123
      }, 2)

      assert.strictEqual(res, 123)
    })

    it('should work with non async functions', async () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo')
      const res = await tq.pushTask('foo', () => 123, 2)

      assert.strictEqual(res, 123)
    })

    it('should work process items according to concurrency', async () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo', 1)

      const promises = []
      const process = []
      promises.push(tq.pushTask('foo', () => job(500, 1, process), 2))
      promises.push(tq.pushTask('foo', () => job(200, 2, process), 2))
      promises.push(tq.pushTask('foo', () => job(700, 3, process), 2))
      promises.push(tq.pushTask('foo', () => job(300, 4, process), 2))
      const res = await Promise.all(promises)

      assert.deepStrictEqual(res, [1, 2, 3, 4])
      assert.deepStrictEqual(process, [1, 2, 3, 4])
    })

    it('should support parallel processing as well', async () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo', 3)

      const promises = []
      const process = []

      promises.push(tq.pushTask('foo', () => job(3000, 1, process), 2))
      promises.push(tq.pushTask('foo', () => job(5000, 2, process), 2))
      promises.push(tq.pushTask('foo', () => job(4000, 3, process), 2))
      promises.push(tq.pushTask('foo', () => job(1000, 4, process), 2))
      const res = await Promise.all(promises)

      assert.deepStrictEqual(res, [1, 2, 3, 4])
      assert.deepStrictEqual(process, [1, 3, 4, 2])
    }).timeout(10000)

    it('should handle tasks based on priority according to concurrency', async () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo', 1)

      const promises = []
      const process = []

      promises.push(tq.pushTask('foo', () => job(3000, 1, process), 2))
      promises.push(tq.pushTask('foo', () => job(4000, 2, process), 1))
      promises.push(tq.pushTask('foo', () => job(2000, 3, process), 2))
      promises.push(tq.pushTask('foo', () => job(1000, 4, process), 1))
      const res = await Promise.all(promises)

      assert.deepStrictEqual(res, [1, 2, 3, 4])
      assert.deepStrictEqual(process, [2, 4, 1, 3])
    }).timeout(20000)

    it('should handle tasks based on priority in parallel as well', async () => {
      const tq = new TaskPriorityQueue()
      tq.initQueue('foo', 2)

      const promises = []
      const process = []

      promises.push(tq.pushTask('foo', () => job(2000, 1, process), 2))
      promises.push(tq.pushTask('foo', () => job(4000, 2, process), 1))
      promises.push(tq.pushTask('foo', () => job(2000, 3, process), 3))
      promises.push(tq.pushTask('foo', () => job(3000, 4, process), 1))
      const res = await Promise.all(promises)

      assert.deepStrictEqual(res, [1, 2, 3, 4])
      assert.deepStrictEqual(process, [4, 2, 1, 3])
    }).timeout(20000)
  })
}).timeout(7000)
