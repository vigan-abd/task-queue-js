import { AsyncPriorityQueue } from 'async'

export class TaskPriorityQueue {
  protected queues: Map<string, AsyncPriorityQueue<any>>

  public hasQueue(key: string): boolean

  public initQueue(key: string, concurrency?: number): boolean

  public getQueue(key: string): AsyncPriorityQueue<any> | undefined

  public pushTask(key: string, task: () => Promise<any>, priority: number): Promise<any>
}
