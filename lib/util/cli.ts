import fs from 'fs'

export function getFileAndFolderPaths(folderPath: string): [string[], string[]] {
  const filePaths: string[] = []
  const folderPaths: string[] = []
  const directoryItems = fs.readdirSync(folderPath)
  directoryItems.forEach(directoryItem => {
    const isDirectory = fs.lstatSync(folderPath + '/' + directoryItem).isDirectory()
    if (isDirectory) {
      folderPaths.push(folderPath + '/' + directoryItem)
    }
    const fileExtension = directoryItem
      .split('.')
      .pop()
    if (fileExtension && fileExtension.toLowerCase() === 'pdf') {
      filePaths.push(folderPath + '/' + directoryItem)
    }
  })
  return [filePaths, folderPaths]
}

export function getAllFileAndFolderPaths(filePaths: string[], folderPaths: string[], recursive: boolean): [string[], string[]] {
  let allFolderPaths = folderPaths
  if (recursive) {
    while (allFolderPaths.length !== 0) {
      let nextFolderPaths: string[] = []
      allFolderPaths.forEach(folderPath => {
        const outputArray = getFileAndFolderPaths(folderPath)
        filePaths = filePaths.concat(outputArray[0])
        nextFolderPaths = nextFolderPaths.concat(outputArray[1])
        folderPaths = folderPaths.concat(outputArray[1])
      })
      allFolderPaths = nextFolderPaths
    }
  }
  return [filePaths, folderPaths]
} 
