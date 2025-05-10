export default class StashingStream<T> {
  protected results: T[]
  protected stash: T[]

  constructor() {
    if (this.constructor === StashingStream) {
      throw new TypeError('Can not construct abstract class.')
    }
    this.results = []
    this.stash = []
  }

  consumeAll(items: T[]): void {
    items.forEach(item => this.consume(item))
  }

  consume(item: T): void {
    if (this.shouldStash(item)) {
      if (!this.matchesStash(item)) {
        this.flushStash()
      }
      this.pushOnStash(item)
    } else {
      if (this.stash.length > 0) {
        this.flushStash()
      }
      this.results.push(item)
    }
  }

  pushOnStash(item: T): void {
    this.onPushOnStash(item)
    this.stash.push(item)
  }

  complete(): T[] {
    if (this.stash.length > 0) {
      this.flushStash()
    }
    return this.results
  }

  // return true if the item matches the items of the stack
  matchesStash(item: T): boolean {
    if (this.stash.length === 0) {
      return true
    }
    const lastItem = this.stash[this.stash.length - 1]
    return this.doMatchesStash(lastItem, item)
  }

  flushStash(): void {
    if (this.stash.length > 0) {
      this.doFlushStash(this.stash, this.results)
      this.stash = []
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPushOnStash(item: T): void {
    // sub-classes may override
  }

  shouldStash(item: T): boolean {
    throw new TypeError(' Do not call abstract method foo from child.' + item)
  }

  doMatchesStash(lastItem: T, item: T): boolean {
    throw new TypeError(' Do not call abstract method foo from child.' + lastItem + item)
  }

  doFlushStash(stash: T[], results: T[]): void {
    throw new TypeError(' Do not call abstract method foo from child.' + stash + results)
  }
} 
