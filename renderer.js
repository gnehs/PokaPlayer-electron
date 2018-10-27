// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const axios = require('axios');
const { dialog, globalShortcut } = require('electron').remote
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
            $('#app').html(`<webview id="poka" src="${window.localStorage["server"]}"></webview>`)
            const webview = document.getElementById("poka");
            webview.addEventListener("dom-ready", function() {
                //webview.openDevTools();
                console.log(webview.getTitle());
            });
        }
        let ping;
        let pass = $("#userPASS").val()
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
                    console.log(`${single.global}注册成功`)
                } else {
                    console.log(`${single.global}注册失败`)
                }
            })

            function hotKeyControl(key) {
                switch (key) {
                    case 'playPause':
                        document.getElementById("poka").executeJavaScript("ap.toggle()")
                        break
                    case 'last':
                        document.getElementById("poka").executeJavaScript("ap.skipBack()")
                        break
                    case 'next':
                        document.getElementById("poka").executeJavaScript("ap.skipForward()")
                        break
                }
            }
        }

    });

}