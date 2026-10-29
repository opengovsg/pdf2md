const { expect } = require('chai')

const path = require('path')
const mock = require('mock-fs')
const rewire = require('rewire')
const cli = rewire('../../lib/util/cli.js')
const pdf2md_cli = rewire('../../lib/pdf2md-cli.js')
const getFileAndFolderPaths = cli.__get__('getFileAndFolderPaths') // eslint-disable-line no-underscore-dangle
const getAllFileAndFolderPaths = cli.__get__('getAllFileAndFolderPaths') // eslint-disable-line no-underscore-dangle
const runFn = pdf2md_cli.__get__('run') // eslint-disable-line no-underscore-dangle

describe('run: handles files or paths containing a period', function () {
  it('Assert filenames with a period have an identical filename in markdown', function () {
    const createMarkdownFilesMock = function (allFilePaths, allOutputPaths) {
      expect(allOutputPaths).to.have.members([path.join('output', 'file.in-root')])
    }

    const revert = pdf2md_cli.__set__('createMarkdownFiles', createMarkdownFilesMock) // eslint-disable-line no-underscore-dangle

    try {
      mock({
        'output': {},
        'file.in-root.pdf': 'file content here',
      })

      runFn('.', 'output')
    } finally {
      mock.restore()
      revert()
    }
  })
})

describe('run: preserve subdirectory structure to prevent clobbers', function () {
  it('Assert identical filenames in nested subdirs do not clobber each other', function () {
    const createMarkdownFilesMock = function (allFilePaths, allOutputPaths) {
      expect(allOutputPaths).to.have.members([path.join('output', 'file.in-root'), path.join('output/subdir', 'file.in-root')])
    }

    const revert = pdf2md_cli.__set__('createMarkdownFiles', createMarkdownFilesMock) // eslint-disable-line no-underscore-dangle

    try {
      mock({
        'output': {},
        'file.in-root.pdf': 'file content here',
        'subdir': {
          'file.in-root.pdf': 'file content here',
        },
      })

      runFn('.', 'output')
    } finally {
      mock.restore()
      revert()
    }
  })
})

describe('functions: entry point file retrieval', function () {
  it('Assert getPaths from a single directory returns the proper arrays', function () {
    mock({
      root: {
        'pdf-file-1.pdf': 'file content here',
        'pdf-file-2.pdf': 'file content here',
        'dir-1': {
          'pdf-file-3.pdf': 'file content here',
        },
        'dir-2': {},
        'dir-3': {},
      },
    })
    const [fileNames, folderNames] = getFileAndFolderPaths('root')
    expect(fileNames).to.have.members(['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf'])
    expect(folderNames).to.have.members(['root/dir-1', 'root/dir-2', 'root/dir-3'])

    mock.restore()
  })

  it('Assert getAllPaths from a single directory returns the proper arrays, recursive', function () {
    mock({
      root: {
        'pdf-file-1.pdf': 'file content here',
        'pdf-file-2.pdf': 'file content here',
        'dir-1': {
          'pdf-file-3.pdf': 'file content here',
        },
        'dir-2': {},
        'dir-3': {
          'pdf-file-4.pdf': 'file content here',
        },
      },
    })

    const filePaths = ['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf']
    const folderPaths = ['root/dir-1', 'root/dir-2', 'root/dir-3']
    const [allFileNames, allFolderNames] = getAllFileAndFolderPaths(filePaths, folderPaths, true)

    expect(allFileNames).to.have.members(['root/pdf-file-1.pdf',
      'root/pdf-file-2.pdf',
      'root/dir-1/pdf-file-3.pdf',
      'root/dir-3/pdf-file-4.pdf'])

    expect(allFolderNames).to.have.members(['root/dir-1',
      'root/dir-2',
      'root/dir-3'])

    mock.restore()
  })

  it('Assert getAllPaths from a single directory returns the proper arrays, non-recursive', function () {
    mock({
      root: {
        'pdf-file-1.pdf': 'file content here',
        'pdf-file-2.pdf': 'file content here',
        'dir-1': {
          'pdf-file-3.pdf': 'file content here',
        },
        'dir-2': {},
        'dir-3': {
          'pdf-file-4.pdf': 'file content here',
        },
      },
    })

    const filePaths = ['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf']
    const folderPaths = ['root/dir-1', 'root/dir-2', 'root/dir-3']
    const [allFileNames, allFolderNames] = getAllFileAndFolderPaths(filePaths, folderPaths, false)

    expect(allFileNames).to.have.members(['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf'])
    expect(allFolderNames).to.have.members(['root/dir-1', 'root/dir-2', 'root/dir-3'])

    mock.restore()
  })
})
