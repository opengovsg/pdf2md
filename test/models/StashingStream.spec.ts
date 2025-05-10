import { expect, describe, it } from 'vitest'
import StashingStream from '../../lib/models/StashingStream'

class MyStashingStream extends StashingStream<string> {
  public transformedItems: number
  constructor() {
    super()
    this.transformedItems = 0
  }

  shouldStash(item) {
    return item === 'a' || item === 'z' || item === 'm'
  }

  shouldStashFromParent(item) {
    return super.shouldStash(item)
  }

  doMatchesStash(lastItem, item) {
    return lastItem === item
  }

  doMatchesStashFromParent(lastItem, item) {
    return super.doMatchesStash(lastItem, item)
  }

  doFlushStash(stash, results) {
    this.transformedItems += stash.length
    results.push(...stash.filter(elem => elem !== 'm').map(item => item.toUpperCase()))
  }

  doFlushStashFromParent(stash, results) {
    super.doFlushStash(stash, results)
  }
}


describe('StashingStream', () => {
  it('Simple', () => {
    const stream = new MyStashingStream()

    stream.consume('a')
    stream.consume('b')
    stream.consume('a')
    stream.consume('a')
    stream.consume('z')
    stream.consume('m')
    stream.consume('m')
    stream.consume('z')
    stream.consume('z')
    stream.consume('c')
    stream.consume('e')
    stream.consume('f')
    stream.consume('m')
    stream.consume('a')

    const resultsAsString = stream.complete().join('')

    expect(resultsAsString).toBe('AbAAZZZcefA')
    expect(stream.transformedItems).toBe(10)
  })

  it('Constructor Execption', () => {
    expect(() => new StashingStream()).to.throw('Can not construct abstract class.')
  })

  it('ConsumeAll', () => {
    const items = ['k', 'k', 'x', 'a', 'm', 'z', 'o', 'p']
    const stream = new MyStashingStream()
    stream.consumeAll(items)

    const resultsAsString = stream.complete().join('')
    expect(resultsAsString).toBe('kkxAZop')
    expect(stream.transformedItems).toBe(3)
  })

  it('shouldStash Throw Error', () => {
    const stream = new MyStashingStream()

    expect(() => stream.shouldStashFromParent('a')).to.throw(' Do not call abstract method foo from child.a')
  })

  it('doMatchesStash Throw Error', () => {
    const items = ['k', 'k', 'x', 'a', 'm', 'z', 'o', 'p']
    const stream = new MyStashingStream()
    stream.consumeAll(items)

    expect(() => stream.doMatchesStashFromParent('p', 'q')).to.throw(' Do not call abstract method foo from child.pq')
  })

  it('doFlushStash Throw Error', () => {
    const stream = new MyStashingStream()

    expect(() => stream.doFlushStashFromParent(['a'], [])).to.throw(' Do not call abstract method foo from child.a')
  })
})
