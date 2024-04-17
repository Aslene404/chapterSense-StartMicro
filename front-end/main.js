const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  createMainWindow();

  // Listen for changes in display configuration
  screen.on('display-metrics-changed', () => {
    const newScreenSize = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setSize(newScreenSize.width, newScreenSize.height);
  });
});

function createMainWindow() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    icon: 'assets/favicon (4).ico',
    width: screenSize.width,
    height: screenSize.height,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  ipcMain.on('openDialog', (event) => {
    const options = {
      title: 'Open Folder',
      defaultPath: app.getPath('documents'),
      parent: mainWindow,
    };

    dialog.showSaveDialog(mainWindow, options).then((result) => {
      if (!result.canceled && result.filePath.length > 0) {
        const parts = result.filePath.split('/');
        const directoryPath = parts.slice(0, -1).join('/') + '/';
        const fileName = parts[parts.length - 1];
        event.sender.send('selectedFile', { directoryPath, fileName });
      }
    });
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});