
'use strict'

const Menu = require('electron').Menu;

const darwinTemplate = require('./DarwinMenu');
const otherTemplate = require('./OtherMenu');

const menu = null;

function MenuConfig(menu) {
  this.menu = menu;

  this.buildMenu = buildMenu;
}

function buildMenu(mainWindow) {
  if (process.platform === 'darwin') {
    this.menu = Menu.buildFromTemplate(darwinTemplate(mainWindow));
    Menu.setApplicationMenu(this.menu);
  } else {
    this.menu = Menu.buildFromTemplate(otherTemplate(mainWindow));
    mainWindow.win.setMenu(this.menu)
  }
}

module.exports = new MenuConfig(menu);