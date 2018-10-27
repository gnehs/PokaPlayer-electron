// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const remote = require('electron').remote;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + '/icon.png'
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

    if (process.platform === 'darwin') {
        template = [{
            label: 'PokaPlayer',
            submenu: [{
                label: '關於 PokaPlayer',
                selector: 'orderFrontStandardAboutPanel:'
            }, {
                label: '開發人員工具',
                click() {
                    const firstWindow = BrowserWindow.getAllWindows()[0]
                    if (!firstWindow) return
                    const isDevToolsOpened = firstWindow.isDevToolsOpened()
                    const isDevToolsFocused = firstWindow.isDevToolsFocused()
                    if (isDevToolsOpened && isDevToolsFocused) {
                        firstWindow.closeDevTools()
                    } else if (isDevToolsOpened && !isDevToolsFocused) {
                        firstWindow.devToolsWebContents.focus()
                    } else {
                        firstWindow.openDevTools()
                    }
                }
            }, {
                type: 'separator'
            }, {
                label: '離開',
                accelerator: 'Command+Q',
                click() {
                    app.quit();
                }
            }]
        }, {
            label: "編輯",
            submenu: [
                { label: "還原", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "重做", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "剪下", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "複製", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "貼上", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "選取全部", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        }];

        menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        template = [{
            label: '&File',
            submenu: [{
                label: '&Exit',
                accelerator: 'Alt+f4',
                click() {
                    app.quit();
                }
            }]
        }];
        menu = Menu.buildFromTemplate(template);
        mainWindow.setMenu(menu);
    }
    createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.