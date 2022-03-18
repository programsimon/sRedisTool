'use strict'
import {ipcRenderer} from 'electron'

export default {
  name: 'ElectronBridge',
  getAppInfo() {
    var appInfo = ipcRenderer.sendSync('appInfo')
    return appInfo
  },
  getConfig(configName) {
    var v = ipcRenderer.sendSync('appConfig',configName)
    return v
  },
  setConfig(configName, configValue) {
    ipcRenderer.sendSync('setAppConfig', {
      configName: configName,
      configValue: configValue})
  },
  registerEvent(enventName, cb ) {
    if ( !cb || !(typeof cb === 'function') ) {
      return
    }
    ipcRenderer.on(enventName , function(event, param) {
      cb(param)
    })
  }
}
