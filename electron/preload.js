const { contextBridge, ipcRenderer } = require('electron/renderer');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }

        for (const dependency of ['chrome', 'node', 'electron']) {
            replaceText(`${dependency}-version`, process.version[dependency]);
        }
    }
});

// 接收主进程传递的api列表，并对渲染进程暴露api
ipcRenderer.on('api-list', (e, keys = []) => {
    let apiObj = {};
    keys.forEach(key => {
        apiObj[key] = (arg) => {
            return new Promise((resolve, reject) => {
                ipcRenderer.invoke(key, arg).then(data => {
                    if ("ok" === data.status) {
                        resolve(data.data);
                    } else {
                        reject(data.error);
                    }
                });
            });
        }
    });
    contextBridge.exposeInMainWorld('PluginServer', apiObj);
    window.dispatchEvent(new Event("AppInited"));
});