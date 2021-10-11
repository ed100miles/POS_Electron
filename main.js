const electron = require('electron');
const url = require('url');
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron;
const { PythonShell } = require('python-shell')

let mainWindow;
let addWindow;

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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 600,
    height: 400,
    title: 'Multi-Mission Check'
  });
  // load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'multiWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Garbage collection
  addWindow.on('close', function () {
    addWindow = null;
  })
}

// Catch item from mainWindow
ipcMain.on('formContent', function (e, formContent) {
  // run py script and send input:
  let pyshell = new PythonShell('pos.py', {pythonPath: 'venv/bin/python3'})
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
  let pyshell = new PythonShell('multiPos.py', {pythonPath: 'venv/bin/python3'})
  pyshell.send(file)
  pyshell.on('message', function (message) {
    console.log(message)
    addWindow.webContents.send('files_done', 123)
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
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  }
]
