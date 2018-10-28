// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const axios = require('axios');
const { dialog, globalShortcut, Tray, Menu, app } = require('electron').remote


window.onload = function() {
    if (window.localStorage["server"])
        $("#server").val(window.localStorage["server"])
    if (window.localStorage["userPASS"])
        $("#userPASS").val(window.localStorage["userPASS"])
    $('#login').click(async function() {
        async function pingServer(url) {
            return (await axios.get(`${url}/ping`)).data == "PONG"
        }

        function loadWebview() {
            $('#app').html(`<webview id="poka" src="${window.localStorage["server"]}" allowpopups></webview>`)
            const webview = document.getElementById("poka");
            webview.addEventListener("did-stop-loading", function() {
                //webview.openDevTools();
                console.log(webview.getTitle());
                webview.insertCSS(`body::-webkit-scrollbar{width:0px !important;}`)
            });
            webview.addEventListener("dom-ready", function() {
                //webview.openDevTools();
                console.log(webview.getTitle());
                webview.insertCSS(`body::-webkit-scrollbar{width:0px !important;}`)
            });
        }
        let ping;
        let server = $("#server").val()
        try {
            ping = await pingServer(server)
        } catch (e) {
            return dialog.showMessageBox({ message: '無法連接伺服器' })
        }
        if (!ping) {
            dialog.showMessageBox({ message: '無法連接伺服器' })
        } else {
            window.localStorage["server"] = server
            loadWebview()


        }

    });

}

/* 綁定媒體鍵 */
const systemGlobalShortcut = [{
        name: '播放暂停',
        value: 'playPause',
        global: `MediaPlayPause`,
    },
    {
        name: '上一首',
        value: 'last',
        global: `MediaPreviousTrack`,
    },
    {
        name: '下一首',
        value: 'next',
        global: `MediaNextTrack`,
    },
]
systemGlobalShortcut.forEach(single => {
    const res = globalShortcut.register(single.global, () => {
        hotKeyControl(single.value)
    })
    if (res) {
        console.log(`${single.global} 註冊成功`)
    } else {
        console.log(`${single.global} 註冊失敗`)
    }
})

function hotKeyControl(key) {
    switch (key) {
        case 'last':
            document.getElementById("poka").executeJavaScript("ap.skipBack()")
            setTimeout(() => document.getElementById("poka").executeJavaScript("ap.play()"), 200)
            break
        case 'next':
            document.getElementById("poka").executeJavaScript("ap.skipForward()")
            setTimeout(() => document.getElementById("poka").executeJavaScript("ap.play()"), 200)
            break
        case 'playPause':
            document.getElementById("poka").executeJavaScript("ap.toggle()")
            break
    }
}
/* Tray */
let tray = null
if (process.platform === 'darwin') {
    tray = new Tray(__dirname + '/tray.png')
    const contextMenu = Menu.buildFromTemplate([{
            label: '播放/暫停',
            click() {
                hotKeyControl('playPause')
            }
        },
        {
            label: '上一首',
            click() {
                hotKeyControl('last')
            }
        },
        {
            label: '下一首',
            click() {
                hotKeyControl('next')
            }
        },
        { type: "separator" }, {
            label: '離開 PokaPlayer',
            accelerator: 'Command+Q',
            click() {
                app.quit();
            }
        }
    ])
    tray.setContextMenu(contextMenu)
    tray.setToolTip('PokaPlayer')
    tray.setTitle('PokaPlayer')
    setInterval(() => {
        document.getElementById("poka").executeJavaScript(
            "lrc.getLyrics()[lrc.select(ap.audio.currentTime)].text",
            false,
            result => tray.setTitle(!result.match(/歌詞讀取中/) ? result : 'PokaPlayer')
        )
    }, 500);
    // 關閉或重新整理前把 tray 幹掉
    window.onbeforeunload = (e) => {
        tray.destroy()
        return
    }
}