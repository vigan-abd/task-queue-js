'use strict'

import { QueueObject } from 'async'

export class TaskQueue {
  protected queues: Map<string, QueueObject<any>>

  public hasQueue(key: string): boolean

  public initQueue(key: string, concurrency: number = 1): boolean

  public getQueue(key: string): QueueObject<any> | undefined

  public pushTask(key: string, task: () => Promise<any>): Promise<any>
}
