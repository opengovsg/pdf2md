const { expect } = require('chai')

const mock = require('mock-fs')
const rewire = require('rewire')
const pdf2mdCli = rewire('../lib/pdf2md-cli.js')
const getFileAndFolderPaths = pdf2mdCli.__get__('getFileAndFolderPaths') // eslint-disable-line no-underscore-dangle
const getAllFileAndFolderPaths = pdf2mdCli.__get__('getAllFileAndFolderPaths') // eslint-disable-line no-underscore-dangle

describe('functions: entry point file retrieval', function () {
  it('Assert getPaths from a single directory returns the proper arrays', function () {
    mock({
      'root': {
        'pdf-file-1.pdf': 'file content here',
        'pdf-file-2.pdf': 'file content here',
        'dir-1': {
          'pdf-file-3.pdf': 'file content here'
        },
        'dir-2': {},
        'dir-3': {}
      }
    })
    const [fileNames, folderNames] = getFileAndFolderPaths('root')
    expect(fileNames).to.have.members(['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf'])
    expect(folderNames).to.have.members(['root/dir-1', 'root/dir-2', 'root/dir-3'])
  })

  it('Assert getAllPaths from a single directory returns the proper arrays, recursive', function () {
    mock({
      'root': {
        'pdf-file-1.pdf': 'file content here',
        'pdf-file-2.pdf': 'file content here',
        'dir-1': {
          'pdf-file-3.pdf': 'file content here'
        },
        'dir-2': {},
        'dir-3': {
          'pdf-file-4.pdf': 'file content here'
        }
      }
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
  })

  it('Assert getAllPaths from a single directory returns the proper arrays, non-recursive', function () {
    mock({
      'root': {
        'pdf-file-1.pdf': 'file content here',
        'pdf-file-2.pdf': 'file content here',
        'dir-1': {
          'pdf-file-3.pdf': 'file content here'
        },
        'dir-2': {},
        'dir-3': {
          'pdf-file-4.pdf': 'file content here'
        }
      }
    })

    const filePaths = ['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf']
    const folderPaths = ['root/dir-1', 'root/dir-2', 'root/dir-3']
    const [allFileNames, allFolderNames] = getAllFileAndFolderPaths(filePaths, folderPaths, false)

    expect(allFileNames).to.have.members(['root/pdf-file-1.pdf', 'root/pdf-file-2.pdf'])
    expect(allFolderNames).to.have.members(['root/dir-1', 'root/dir-2', 'root/dir-3'])
  })
})
