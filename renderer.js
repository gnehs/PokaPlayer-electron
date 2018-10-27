// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const axios = require('axios');
const { dialog } = require('electron').remote
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
        }
    });
}