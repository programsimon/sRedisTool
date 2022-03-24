'use strict'
import {ipcRenderer} from 'electron'
import { result } from 'lodash'

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
  },
  showSaveDialog(options){
    return ipcRenderer.invoke('showSaveDialog', options)
  },
  showOpenDialog(options){
    return ipcRenderer.invoke('showOpenDialog', options)
  },
  saveFile(filePath,content,options){
    return ipcRenderer.invoke('saveFile', {
      filePath,
      content,
      options
    })
  },
  readFile(filePath,options){
    return ipcRenderer.invoke('readFile', {
      filePath,
      options
    })
  }
}
