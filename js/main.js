const electron = require('electron');
const url = require('url');
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron;
const { PythonShell } = require('python-shell')

let mainWindow;
let multiWindow;
let configWindow;

//Listen for app to be ready
app.on('ready', () => {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../templates/mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', () => app.quit())
  // Build meue from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create multi mission window
function createMultiWindow() {
  // Create new window
  multiWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 600,
    height: 400,
    title: 'Multi-Mission Check'
  });
  // load html into window
  multiWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../templates/multiWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Garbage collection
  multiWindow.on('close', () => multiWindow = null)
}

// Handle create mission config window
function createConfigWindow() {
  // Create new window
  configWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 600,
    height: 400,
    title: 'Mission Configuration'
  });
  // load html into window
  configWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../templates/configWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // when config window ready to render, send signal to update form based on config file
  configWindow.on('ready-to-show', () => {
    configWindow.send('update-config')
  })
  // Garbage collection
  configWindow.on('close', () => configWindow = null)
}

// Catch item from mainWindow.js
ipcMain.on('formContent', function (e, formContent) {
  console.log('form content receive from mainWindow')
  // run py script and send input:
  let pyshell = new PythonShell(
    path.join(__dirname, '../python_scripts/pos.py'),
    { pythonPath: path.join(__dirname, '../venv/bin/python3') })
  pyshell.send(formContent)
  pyshell.on('message', function (message) {
    mainWindow.webContents.send('return_content', message)
  });
  pyshell.end(function (err, code, signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
  })
})

// Catch file from multiWindow
ipcMain.on('file', function (e, file) {
  console.log(file)
  let pyshell = new PythonShell(
    path.join(__dirname, '../python_scripts/multiPos.py'),
    { pythonPath: path.join(__dirname, '../venv/bin/python3') })
  pyshell.send(file)
  pyshell.on('message', function (message) {
    multiWindow.webContents.send('files_done', message)
  })
  pyshell.end(function (err, code, signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
  })
})

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Multi-Mission Window',
        accelerator: process.platform == 'darwin' ? 'Command+M' : 'Ctrl+M',
        click() {
          createMultiWindow()
        }
      },
      {
        label: 'Mission Configuration',
        accelerator: process.platform == 'darwin' ? 'Command+K' : 'Ctrl+K',
        click() {
          createConfigWindow()
        }
      },
      {
        label: 'Dev Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        label:'Close Window',
        accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
        click(item, focusedWindow){
          focusedWindow.close()
        }
      },
      {
        label: 'Quit App',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      },
    ]
  }
]
