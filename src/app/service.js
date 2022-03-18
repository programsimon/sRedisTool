'use strict'
const { app, ipcMain } = require('electron')
const store = require('./store')

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

  return service
}
module.exports = service()