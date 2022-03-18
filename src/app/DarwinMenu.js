'use strict'

//TODO 需要修改
module.exports = (amainWindow) => {

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
      label: i18n.t('appName'),
      submenu: [
        {
          label: i18n.t('About App'),
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('Language'),
          submenu: languageMenu
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('Hide App'),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: i18n.t('Hide Others'),
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: i18n.t('Show All'),
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('Quit'),
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: i18n.t('Help'),
      submenu: [
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