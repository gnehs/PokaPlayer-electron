// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, shell } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        minHeight: 620,
        minWidth: 324,
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
                    type: 'separator'
                }, {
                    label: '離開 PokaPlayer',
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
            },
            {
                label: '檢視',
                submenu: [{
                        label: '重新整裡',
                        accelerator: 'CmdOrCtrl+R',
                        click: function(item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.reload();
                        }
                    },
                    {
                        label: '全螢幕',
                        accelerator: (function() {
                            if (process.platform == 'darwin')
                                return 'Ctrl+Command+F';
                            else
                                return 'F11';
                        })(),
                        click: function(item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    },
                    {
                        label: '開發人員工具',
                        accelerator: (function() {
                            if (process.platform == 'darwin')
                                return 'Alt+Command+I';
                            else
                                return 'Ctrl+Shift+I';
                        })(),
                        click: function(item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.toggleDevTools();
                        }
                    },
                ]
            },
            {
                label: '視窗',
                role: 'window',
                submenu: [{
                        label: '最小化',
                        accelerator: 'CmdOrCtrl+M',
                        role: 'minimize'
                    },
                    {
                        label: '關閉',
                        accelerator: 'CmdOrCtrl+W',
                        role: 'close'
                    },
                ]
            },
            {
                label: '說明',
                role: 'help',
                submenu: [{
                        label: '查看 GitHub',
                        click: () => {
                            shell.openExternal('https://github.com/gnehs/PokaPlayer/')
                        }
                    }, {
                        label: '查看 Wiki',
                        click: () => {
                            shell.openExternal('https://github.com/gnehs/PokaPlayer/wiki')
                        }
                    },
                    { type: "separator" },
                    {
                        label: '回報問題',
                        click: () => {
                            shell.openExternal('https://github.com/gnehs/PokaPlayer/issues/new/choose')
                        }
                    }
                ]
            },
        ];

        menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
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