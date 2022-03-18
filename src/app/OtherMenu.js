
'use strict'

module.exports = (mainWindow) => {

  var i18n = mainWindow.i18n;
  const languageMenu = mainWindow.config.languages.map((languageCode) => {
  
    return {
      label: i18n.t(languageCode),
      type: 'radio',
      checked: i18n.getLocale() === languageCode,
      click: () => {
        mainWindow.setLocale(languageCode);
      }
    }
  });

  let menu = [
    {
      label: i18n.t('File'),
      submenu: [
        {
          label: i18n.t('Language'),
          submenu: languageMenu
        },
        {
          label: i18n.t('Quit'),
          accelerator: 'Ctrl+Q',
          click: function () {
            mainWindow.app.quit();
          }
        }
      ]
    },
    {
      label: i18n.t('Help'),
      submenu: [
        {
          label: 'DevTools',
          accelerator: 'F12',
          click: () => { mainWindow.win.webContents.openDevTools() }
        },
        {
          label: i18n.t('About App'),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
            }
          }
        }
      ]
    }
  ];

  return menu;
};