'use strict'

const Store = require('electron-store')

const store = new Store({
  name: 'srt',
  encryptionKey: '36TFIuChRZgAnM4jfAn1ca3l5NXUyKPB',
  defaults: {
    language: '',
    servergroups:[{
      name: "Default Group",
      id: "6ed46db4c26e4e6ab7fe14eda181f9ca",
      servers: []
    }]
  }
})

module.exports = store;