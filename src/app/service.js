'use strict'
const { app, ipcMain, dialog } = require('electron')
const store = require('./store')
const fsPromises = require('fs').promises

const service = function Service() {
  // public exports
  var service = {
    appInfo: null,
    mainWindow: null
  }

  service.init = function(main) {
    this.mainWindow = main
  }

  ipcMain.on('appInfo', function(event) {
    if(service.appInfo === null) {
      service.appInfo = {
        version: app.getVersion(),
        name: app.getName(),
        appPath: app.getAppPath(),
        locale: app.getLocale()
      }
    }
    event.returnValue = service.appInfo;
    return;
  });

  ipcMain.on('appConfig', function(event, configName) {
    var v = store.get(configName)
    event.returnValue = v
  })
  
  ipcMain.on('setAppConfig', function(event, config) {
    if(config && config.configName && config.configValue) {
      if(config.configName === 'language') {
        service.mainWindow.setLocale(config.configValue)
      }else{
        store.set(config.configName, config.configValue)
      }
    }
    event.returnValue = 'OK'
  })

  ipcMain.handle('showSaveDialog', async (event, options) => {
    return await dialog.showSaveDialog(service.mainWindow.win,options)
  })

  ipcMain.handle('showOpenDialog', async (event, options) => {
    return await dialog.showOpenDialog(service.mainWindow.win,options)
  })

  ipcMain.handle('saveFile', async (event, args) => {
    return await fsPromises.writeFile(args.filePath,args.content,args.options)
  })

  ipcMain.handle('readFile', async (event, args) => {
    return await fsPromises.readFile(args.filePath,args.options)
  })

  return service
}
module.exports = service()