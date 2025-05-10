import { expect, describe, it } from 'vitest'
import { findPageNumbers, findFirstPage, removePageNumber } from '../../lib/util/page-number-functions'

describe('functions: findPageNumbers', () => {
  it('searches, coerces and stores page number', () => {
    const array = [{ str: '1' }, { str: 'test' }, { str: 'how' }, { str: 'to' }, { str: 'find' }, { str: 'page' }, { str: '3' }, { str: 'number' }]
    expect(findPageNumbers({}, 3, array)).to.eql({ 3: [1, 3] })
  })
})

describe('functions: findFirstPage', () => {
  it('returns undefined when object has zero page', () => {
    expect(findFirstPage({})).toBe(undefined)
  })

  it('returns undefined when object has only one page', () => {
    expect(findFirstPage({ 20: [3] })).toBe(undefined)
  })

  it('returns first page index and page number with completed object', () => {
    const object = {
      20: [3],
      21: [4],
      22: [5],
      23: [6],
      24: [7],
      25: [8],
      26: [9],
      27: [10],
      28: [11],
      30: [13],
    }
    expect(findFirstPage(object)).to.eql({ pageIndex: 20, pageNum: 3 })
  })

  it('returns first page index and page number with incompleted object', () => {
    const object = {
      2: [19, 86, 1986, 110],
      5: [137, 151],
      9: [1],
      10: [4],
      12: [6],
      13: [8, 7],
      14: [8],
      15: [10, 9],
      16: [11, 12, 10],
      17: [11],
    }
    expect(findFirstPage(object)).to.eql({ pageIndex: 10, pageNum: 4 })
  })
})

describe('functions: removePageNumber', () => {
  it('returns page number when no conflicting number exists on the page', () => {
    const textContent = { items: [{ str: '3' }, { str: 'play-' }, { str: '.' }, { str: 'a marked' }, { str: 'find' }, { str: 'page' }, { str: 'boundaries' }, { str: '4' }] }
    expect(removePageNumber(textContent, '4').items).to.eql([{ str: '3' }, { str: 'play-' }, { str: '.' }, { str: 'a marked' }, { str: 'find' }, { str: 'page' }, { str: 'boundaries' }])
  })

  it('returns page number when conflicting number exists on the page', () => {
    const longText = `beginning of the conflict and what would happen after its conclusion. 
    So also with place and membership. A game is played in that place, with those persons. 
    The world is elaborately marked by boundaries of contest, its people finely classified as to their eligibilities. 
    5 Only one person or team can win a finite game, but the other contestants may well be ranked 
    at the conclusion of play. Not everyone can be a corporation president, although some who have competed 
    for that prize may be vice presidents or district managers.There are many games we enter not expecting to win, 
    but in which we nonetheless compete for the highest possible ranking. 6 In one respect, but only one, 
    an infinite game is identical to a finite game: Of infinite players we can also say that if they play 
    they play freely; if they must play, they cannot play. Otherwise, infinite and finite play stand 
    in the sharpest possible contrast. Infinite players cannot say when their game began, nor do they care. 
    They do not care for the reason that their game is not bounded by time. Indeed, the only purpose of the game 6`

    const arrayText = longText.split(' ')
    const textContent = { items: [] as { str: string }[] }
    for (const text of arrayText) {
      const item = { str: text }
      textContent.items.push(item)
    }
    const textContentLength = textContent.items.length
    const filteredContent = { items: [...textContent.items] }
    filteredContent.items.pop()

    expect(removePageNumber(textContent, 6).items.length).toBe(textContentLength - 1)
    expect(removePageNumber(textContent, 6).items).to.eql(filteredContent.items)
  })
})
