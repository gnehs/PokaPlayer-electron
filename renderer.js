// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const axios = require('axios');
const {
    dialog,
    globalShortcut,
    Tray,
    Menu,
    app,
    systemPreferences,
    shell,
    process
} = require('electron').remote
const currentWindow = require('electron').remote.getCurrentWindow()

window.onload = function () {
    $('#app>.mdui-valign>.mdui-center.mdui-color-white').attr('style', 'width: 300px;box-shadow: 0 6px 20px #0000001f;overflow: hidden;border-radius: 8px;')
    $('#app>*:not(#poka)').animateCss('zoomIn')
    if (window.localStorage["server"])
        $("#server").val(window.localStorage["server"])
    $('#server').keypress(function (e) {
        if (e.which == 13) {
            $('#login').click();
        }
    });
    $('#login').click(async function () {
        async function pingServer(url) {
            return (await axios.get(`${url}`)).status == 200
        }

        function loadWebview() {
            $('#app>#poka').attr(`src`, window.localStorage["server"])
            const webview = document.getElementById("poka");
            console.time('伺服器讀取');
            webview.addEventListener("dom-ready", function () {
                console.timeEnd('伺服器讀取');
                bindSystemGlobalShortcut() // 綁定媒體鍵
                //新的格式
                webview.executeJavaScript(`window.electronData = {
                    appVersion:'${app.getVersion()}',
                    chromeVersion:'${process.versions.chrome}',
                    electronVersion:'${process.versions.electron}'
                }`)
                // 戳檢查 poka ele 的更新
                webview.executeJavaScript(`checkPokaEleUpdate("${app.getVersion()}")`)
                //
                $('#app>*:not(#poka)').animateCss('zoomOut', function () {
                    $('#app>*:not(#poka)').remove()
                    $(webview).removeAttr('style')
                    $(webview).animateCss('fadeIn')
                });
            });
            webview.addEventListener('new-window', (e) => {
                e.preventDefault();
                const protocol = require('url').parse(e.url).protocol
                if (protocol === 'http:' || protocol === 'https:') {
                    shell.openExternal(e.url) // 開系統瀏覽器
                }
            })
        }
        $(this).text('連接中...')
        // 伺服器位置
        let server = $("#server").val()
        if (!server) {
            dialog.showMessageBox({
                message: '未填入伺服器'
            })
            return $(this).text('連接至伺服器')
        }
        // 嘗試連接
        let ping;
        try {
            ping = await pingServer(server)
        } catch (e) {
            $(this).text('連接至伺服器')
            return dialog.showMessageBox({
                message: '無法連接伺服器'
            })
        }
        if (!ping) {
            $(this).text('連接至伺服器')
            dialog.showMessageBox({
                message: '無法連接伺服器'
            })
        } else {
            window.localStorage["server"] = server
            $(this).text('載入中...')
            loadWebview()
        }
    });
}

function bindSystemGlobalShortcut() {
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
    console.groupCollapsed("媒體鍵註冊");
    systemGlobalShortcut.forEach(single => {
        if (globalShortcut.isRegistered(single.global)) globalShortcut.unregister(single.global)
        let res = globalShortcut.register(single.global, () => {
            hotKeyControl(single.value)
        })
        if (res) {
            console.log(`媒體鍵：${single.global} 註冊成功`)
        } else {
            console.warn(`${single.global} 註冊失敗`)
        }
    })
    console.groupEnd();
}

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
    tray = new Tray(systemPreferences.isDarkMode() ? __dirname + '/assets/imgs/darktray.png' : __dirname + '/assets/imgs/tray.png')
    const contextMenu = Menu.buildFromTemplate([{
        label: '顯示/隱藏',
        click() {
            currentWindow.isVisible() ? currentWindow.minimize() : currentWindow.show()
        }
    }, {
        type: "separator"
    }, {
        label: '播放/暫停',
        click() {
            hotKeyControl('playPause')
        }
    }, {
        label: '上一首',
        click() {
            hotKeyControl('last')
        }
    }, {
        label: '下一首',
        click() {
            hotKeyControl('next')
        }
    }, {
        type: "separator"
    }, {
        label: '離開 PokaPlayer',
        accelerator: 'Command+Q',
        click() {
            app.quit();
        }
    }])
    tray.setContextMenu(contextMenu)
    tray.setToolTip('PokaPlayer')
    tray.setTitle('PokaPlayer')
    setInterval(() => {
        document.getElementById("poka").executeJavaScript(
            "lrc.getLyrics()[lrc.select(ap.audio.currentTime)].text",
            false,
            result => tray.setTitle(result == "歌詞讀取中" ? `PokaPlayer` : result)
        )
    }, 200);
    // 關閉或重新整理前把 tray 幹掉
    window.onbeforeunload = e => {
        tray.destroy()
        return
    }
}
$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = (function (el) {
            var animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
            };

            for (var t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        })(document.createElement('div'));

        this.addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);

            if (typeof callback === 'function') callback();
        });

        return this;
    },
});