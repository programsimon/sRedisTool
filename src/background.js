
'use strict'

import { app, protocol, BrowserWindow, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const mainWindow = function MainWindow(_OPTS = false) {

  const appMenu = require('./app/menu')
  const i18n = require('./app/i18n')
  const config = require('./config/app.config')
  const service = require('./app/service')
  const store = require('./app/store')

  const isDevelopment = process.env.NODE_ENV !== 'production'

  // public exports
  var mainWindow = {
    env : {
      isDevelopment : isDevelopment
    },
    appMenu: appMenu,
    config: config,
    i18n: i18n
  }

  mainWindow.init = function () {
    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      { scheme: 'app', privileges: { secure: true, standard: true } }
    ])

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', async () => {
      if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
          // await installExtension(VUEJS_DEVTOOLS)

        } catch (e) {
          console.error('Vue Devtools failed to install:', e.toString())
        }
      }
      createWindow()
      registerLocalResourceProtocol()

    })

    // Exit cleanly on request from parent process in development mode.
    if (isDevelopment) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
        })
      }
    }
  }
  mainWindow.setLocale = function(languageCode) {
    i18n.setLocale(languageCode)
    appMenu.buildMenu(mainWindow)
    store.set('language',languageCode)
    // Send messages to renderer process 
    mainWindow.win.webContents.send('changeLanguage',languageCode)
  }

  var registerLocalResourceProtocol = function() {
    protocol.registerFileProtocol('local-resource', (request, callback) => {
      const url = request.url.replace(/^local-resource:\/\//, '')
      // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
      const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
      try {
        return callback(decodedUrl)
      }
      catch (error) {
        console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
      }
    })
  }
  var setMainWidnowPos = function(win) {
    let bounds = win.getBounds()
    store.set('startpos',{
      x: bounds.x,
      y: bounds.y
    })
  }

  var getMainWidnowPos = function() {

    let startpos = store.get('startpos')
    let showScreen = screen.getPrimaryDisplay()
    if(startpos 
        && startpos.x
        && startpos.y) {
      let allScreens = screen.getAllDisplays()
      let scr = allScreens.find((s) => {
        return (( startpos.x >= s.workArea.x 
          && startpos.x <= (s.workArea.x + s.workArea.width)
          && startpos.y >= s.workArea.y
          && startpos.y <= (s.workArea.y + s.workArea.height)) 
          || // when maximize , i dont know why
          ( startpos.x === (s.workArea.x - 8) 
          && startpos.y === (s.workArea.y - 8)
        ))
      })
      if(scr){
        showScreen = scr
      }
    }

    const primayScreen = screen.getPrimaryDisplay()

    let width = Math.min(showScreen.workAreaSize.width, 1024)
    let height = Math.min(showScreen.workAreaSize.height, 768)
    let x = (showScreen.workAreaSize.width - width) / 2 + showScreen.bounds.x
    let y = (showScreen.workAreaSize.height - height) / 2 + showScreen.bounds.y
    startpos = {
      x: x,
      y: y,
      width: 1024,
      height: 768
    }

    return startpos
  }

  var createWindow = async function() {
    let startpos = getMainWidnowPos()
    // Create the browser window.
    const win = new BrowserWindow({
      width: startpos.width,
      height: startpos.height,
      x:startpos.x,
      y:startpos.y,
      icon: `${__static}/logo.ico`,
      webPreferences: {
        
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        // Cancel cross-domain detection
        webSecurity: false,
        contextIsolation: false
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html')
    }
    win.on('close', () => {
      setMainWidnowPos(win)
    })
    mainWindow.win = win
    
    i18n.initLocale(store.get('language'), app)
    appMenu.buildMenu(mainWindow)
    store.set('language',i18n.getLocale())
    service.init(mainWindow)

  }
  return mainWindow
}()

mainWindow.init()
