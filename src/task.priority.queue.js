'use strict'

const async = require('async')
const { promiseFlat } = require('./utils')

class TaskPriorityQueue {
  constructor () {
    /** @type {Map<string, async.AsyncPriorityQueue>} */
    this.queues = new Map()
  }

  /**
   * @param {string} key
   */
  hasQueue (key) {
    return this.queues.has(key)
  }

  /**
   * @param {string} key
   * @param {number} [concurrency]
   */
  initQueue (key, concurrency = 1) {
    if (this.queues.has(key)) return false

    this.queues.set(key, async.priorityQueue(async (job, cb) => {
      try {
        const res = await job.task()
        job.resolve(res)
      } catch (err) {
        job.reject(err)
      } finally {
        cb() // task queue cb
      }
    }, concurrency))

    return true
  }

  /**
   * @param {string} key
   */
  getQueue (key) {
    return this.queues.get(key)
  }

  /**
   * @param {string} key - queue key
   * @param {() => Promise<any>} task
   * @param {number} priority
   */
  pushTask (key, task, priority) {
    const queue = this.queues.get(key)
    if (!queue) return Promise.reject(new Error('ERR_TASK_QUEUE_NOT_FOUND'))

    const { promise, resolve, reject } = promiseFlat()
    const job = { task, resolve, reject }
    queue.push(job, priority)

    return promise
  }
}

module.exports = TaskPriorityQueue
