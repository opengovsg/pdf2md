export function minXFromBlocks(blocks: { items: { x: number }[] }[]): number | null {
  let minX = 999
  blocks.forEach(block => {
    block.items.forEach(item => {
      minX = Math.min(minX, item.x)
    })
  })
  if (minX === 999) {
    return null
  }
  return minX
}

export function minXFromPageItems(items: { x: number }[]): number | null {
  let minX = 999
  items.forEach(item => {
    minX = Math.min(minX, item.x)
  })
  if (minX === 999) {
    return null
  }
  return minX
}

export function sortByX(items: { x: number }[]): void {
  items.sort((a, b) => a.x - b.x)
} 
