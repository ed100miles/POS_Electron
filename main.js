const electron = require('electron');
const url = require('url');
const path = require('path')

const { app, BrowserWindow, Menu } = electron;

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', () => {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));

  // Quit app when closed
  mainWindow.on('closed', function () {
    app.quit()
  })

  // Build meue from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
  // Create new window
  addWindow = new BrowserWindow({
    webPreferences:{
      nodeIntegration: true,
    },
    width: 300,
    height: 200,
    title: 'New Window'
  });
  // load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'newWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Garbage collection
  addWindow.on('close', function () {
    addWindow = null;
  })
}

// Create menu template

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        click() {
          createAddWindow()
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      },
      {
        label: 'Dev Tools', 
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  }
]
