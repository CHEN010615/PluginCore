import { app, BrowserWindow, ipcMain, Menu, dialog, Tray, nativeImage } from "electron"
import * as path from "path"

import API from "./common/api.js";
import Utils from './common/utils.js'
import Common from './common/common.js'

const Port = process.env.VITE_PORT;
const PLAY = false;

const api = new API();
const apiList = Object.getOwnPropertyNames(API.prototype);

class ElectronServer {
  constructor () {
    // 主窗口参数
    this.mainWndOptions = {
      width: 700,
      height: 500,
      resizable: !PLAY,
      maximizable: !PLAY,
      minimizable: true,
      fullscreen: false,
      webPreferences: {
        webSecurity: false,
        preload: path.join(Common.dirname, './preload.js')
      },
    };
    // 主窗口对象
    this.mainWnd = null;
    // 调试工具状态
    this.bOpenDevTools = false;
    // 图标路径
    this.iconPath = path.join(Common.dirname, './assets/App.png');
    // 最小化对象
    this.tray = null;
    // 是否正在退出程序
    this.isQuiting = false;
  }
  /* 开启服务 */
  start() {
    app.whenReady().then(() => {
      try {
        // 初始化窗口
        this.createMenu();
        this.setLisener();
        this.createMainWnd();
      } catch (e) {
        this.showDialog('load path', e.toString());
      }
    });
    
    app.on("activate", () => {
      if (!BrowserWindow.getAllWindows().length) {
        this.createMainWnd();
      }
    }).on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }
  /* 创建主窗口 */
  createMainWnd() {
    // 创建对象
    this.mainWnd = new BrowserWindow(this.mainWndOptions);
    // 最大化窗口
    !PLAY && this.mainWnd.maximize();
    this.mainWnd.show();
    // 设置窗口图标
    this.mainWnd.setIcon(this.iconPath);
    // 监听开发者工具开关事件
    this.mainWnd.webContents.on("devtools-opened", () => {
      this.bOpenDevTools = true;
    }).on("devtools-closed", () => {
      this.bOpenDevTools = false;
    });
    // 加载渲染进程
    if (Common.dev) {
      this.mainWnd.loadURL(`http://localhost:${Port}`);
      // 开发环境自动打开调试工具
      !PLAY && this.openDevTools();
    } else {
      this.mainWnd.loadFile(path.join(Common.dirname, '../dist/vite/index.html'));
    }
    // 向渲染进程传递API数据
    this.mainWnd.webContents.on("did-finish-load", () => {
      this.mainWnd.webContents.send("api-list", apiList);
    });
    // 初始化最小化图标
    this.createTray();
    // 关闭弹窗前需要执行的操作
    this.mainWnd.on('close', async (e) => {
      if (!this.isQuiting) {
        e.preventDefault();
        this.mainWnd.hide();
        return;
      }
      await api.destroy();
    });
  }
  /* 创建最小化图标 */
  createTray() {
    const icon = nativeImage.createFromPath(this.iconPath);

    if (icon.isEmpty()) {
      return;
    }

    this.tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([{
      label: '显示窗口',
      click: () => {
        this.showMainWnd();
      }
    }, {
      label: '退出',
      click: () => {
        this.quitApp();
      }
    }]);

    this.tray.setToolTip('PluginCore');
    this.tray.setContextMenu(contextMenu);

    this.tray.on('double-click', () => {
      this.showMainWnd();
    });

    this.mainWnd.on('close', e => {
      e.preventDefault();
      this.mainWnd.hide();
    });
  }
  quitApp() {
    this.isQuiting = true;
    BrowserWindow.getAllWindows().forEach(window => {
      if (window.isDestroyed()) {
        return;
      }
      window.destroy();
    });
    this.tray.destroy();
    app.quit();
  }
  showMainWnd() {
    if (!this.mainWnd) {
      return;
    }
    if (this.mainWnd.isMinimized()) {
      this.mainWnd.restore();
    }
    this.mainWnd.show();
    this.mainWnd.focus();
  }
  /* 创建主窗口菜单 */
  createMenu() {
    // 菜单模板
    let template = [];
    if (Common.dev && !PLAY) {
      template.push({
        label: '视图',
        submenu: [{
          label: '开发者工具',
          click: this.devToolMenuCb()
        }]
      });
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
  /* 设置进程监听事件 */
  setLisener() {
    apiList.forEach(key => {
      ipcMain.handle(key, (e, arg) => {
        return API.prototype[key].call(api, ...[arg]).then(data => {
          return Utils.resolvePromise({ status: "ok", data });
        }).catch(error => {
          return Utils.resolvePromise({ status: "error", error });
        });
      });
    });
  }
  /* 开启调试工具 */
  openDevTools() {
    this.mainWnd.webContents.openDevTools();
  }
  /* 关闭调试工具 */
  closeDevTools() {
    this.mainWnd.webContents.closeDevTools();
  }
  /* 菜单开启/关闭调试工具点击事件 */
  devToolMenuCb() {
    return () => {
      if (this.mainWnd) {
        this.bOpenDevTools ? this.closeDevTools() : this.openDevTools();
      }
    };
  }
  /* 提示弹窗 */
  showDialog (title, message, type = 'info') {
    dialog.showMessageBox({
      type: type,
      title: title,
      message: message,
      buttons: ['确定']
    }).then(response => {
      console.log('点击了按钮:', response.response);
    });
  }
};

const server = new ElectronServer();
server.start();