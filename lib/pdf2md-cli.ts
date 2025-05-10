#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import minimist from 'minimist'
import pdf2md from './pdf2md'
import { getFileAndFolderPaths, getAllFileAndFolderPaths } from './util/cli'

interface Argv {
  inputFolderPath?: string
  outputFolderPath?: string
  recursive?: boolean
  [key: string]: any
}

const argv: Argv = minimist(process.argv.slice(2))

if (!argv['inputFolderPath']) {
  console.log('Please specify inputFolderPath')
} else if (!argv['outputFolderPath']) {
  console.log('Please specify outputFolderPath')
} else if (typeof argv['recursive'] !== 'boolean' && argv['recursive'] !== undefined) {
  console.log('Add tag --recursive for recursive folder conversion, otherwise omit')
} else {
  const folderPath = argv['inputFolderPath'] as string
  const outputPath = argv['outputFolderPath'] as string
  const recursive = argv['recursive'] as boolean
  run(folderPath, outputPath, recursive)
}

function run(folderPath: string, outputPath: string, recursive: boolean = true): void {
  const [filePaths, folderPaths] = getFileAndFolderPaths(folderPath)
  const [allFilePaths] = getAllFileAndFolderPaths(filePaths, folderPaths, recursive)
  const allOutputPaths = allFilePaths.map((x: string) => {
    const fileNameWithExtension = x.split(folderPath)[1]
    const fileNameWithoutExtension = fileNameWithExtension.slice(0, fileNameWithExtension.indexOf('.pdf'))
    return outputPath + fileNameWithoutExtension
  })
  makeOutputDirs(allOutputPaths)
  createMarkdownFiles(allFilePaths, allOutputPaths)
}

function makeOutputDirs(allOutputPaths: string[]): void {
  allOutputPaths.forEach(outputPath => {
    let dirPath = outputPath
      .split('/')
      .slice(0, -1)
      .join('/')
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  })
}

async function createMarkdownFiles(filePaths: string[], allOutputPaths: string[]): Promise<void> {
  for (let i = 0; i < filePaths.length; ++i) {
    const filePath = filePaths[i]
    const callbacks = allOutputPaths[i] && {}
    const pdfBuffer = fs.readFileSync(filePath)
    try {
      const text = await pdf2md(new Uint8Array(pdfBuffer), callbacks)
      const outputFile = allOutputPaths[i] + '.md'
      console.log(`Writing to ${outputFile}...`)
      fs.writeFileSync(path.resolve(outputFile), text)
      console.log('Done.')
    } catch (err) {
      console.error(err)
    }
  }
} 
