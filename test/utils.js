'use strict'

/* eslint-env mocha */

const assert = require('assert')
const { promiseFlat } = require('../src/utils')

describe('util tests', () => {
  describe('promiseFlat tests', () => {
    it('should delegate resolve handle outside of promise', async () => {
      const { promise, resolve, reject } = promiseFlat()

      assert.ok(promise instanceof Promise)
      assert.ok(typeof resolve === 'function')
      assert.ok(typeof reject === 'function')

      setTimeout(() => {
        resolve({ success: true })
      }, 500)

      const res = await promise
      assert.deepStrictEqual(res, { success: true })
    })

    it('should delegate reject handle outside of promise', async () => {
      const { promise, resolve, reject } = promiseFlat()

      assert.ok(promise instanceof Promise)
      assert.ok(typeof resolve === 'function')
      assert.ok(typeof reject === 'function')

      setTimeout(() => {
        reject(new Error('failure'))
      }, 500)

      await assert.rejects(promise, (err) => {
        assert.ok(err instanceof Error)
        assert.strictEqual(err.message, 'failure')
        return true
      })
    })
  })
})
