import express from 'express'

import Proxy from './proxy.js'
import Utils from './utils.js'
import Common from './common.js'
import getWsServer from './ws.js'

class Server {
  constructor(options) {
    let { id, basic, proxy, local } = options;
    // 服务id
    this.id = id;
    // 是否启用
    this.running = false;
    // 服务器信息
    this.basic = basic;
    // 本地服务器信息
    this.local = local;
    // 代理配置
    this.proxy = proxy;
    // express应用
    this.app = null;
    // 代理服务
    this.server = null;
    // 代理服务器
    this.proxyServer = null;
    // 插件代理服务
    this.wsServer = null;
    // 初始化
    this.createServer();
  }

  get info () {
    const { basic, proxy, local } = this;
    return {
      name: basic.name,
      proxyPort: proxy.proxyPort,
      plugin: proxy.plugin,
      pluginPort: proxy.pluginPort,
      deviceAddr: proxy.deviceAddr,
      projectDir: proxy.projectDir,
      https: proxy.https,
      vue: local.vue,
      localPort: local.localPort
    }
  }

  get proxyOption() {
    const { proxy } = this;
    return {
      localPort: proxy.proxyPort,
      plugin: proxy.plugin,
      pluginPort: proxy.pluginPort,
      proxyIp: proxy.deviceAddr,
      localDir: proxy.projectDir,
      https: proxy.https
    };
  }

  // 创建本地代理设备服务对象
  createServer() {
    // 代理服务
    this.proxyServer = new Proxy(this.proxyOption);

    this.app = express();
    // 启用代理
    this.proxyServer.expand(this.app);
    // 404错误处理
    this.app.use((req, res, next) => {
      res.status(404).send('404 - Not Found');
    });
  }

  // 启用服务
  async run() {
    if (this.running) {
      return;
    }
    await this.initServer();
    this.running = true;
    if (Common.config.autoOpen) {
      const { proxyPort, vue, https } = this.info;
      let url = `http://127.0.0.1:${proxyPort}/doc/${vue ? 'index.html' : 'page/login.asp'}`;
      Utils.openPage(url);
    }
  }

  /**
   * 启用一个本地服务器
   * 使用代理服务转发本地资源
   */
  initServer() {
    return new Promise(resolve => {
      const { proxyPort, plugin = undefined, deviceAddr, pluginPort, https } = this.info;
      // 本地运行一个代理服务器，然后通过资源代理
      this.server = this.app.listen(proxyPort, () => {
        console.log(`端口${proxyPort} 占用`);
        resolve();
      });
      // 创建插件ws请求转发服务器
      this.wsServer = getWsServer(!!plugin, {
        proxyPort,
        deviceAddr,
        https,
        server: this.server,
        pluginPort
      });
    });
  }

  // 停用服务
  async stop() {
    if (!this.running) {
      return;
    }
    try {
      await new Promise((resolve) => {
        this.wsServer?.close();
        this.server?.close(() => {
          console.log(`端口${this.info.proxyPort} 停用`);
          resolve();
        });
      });
    } catch (e) {
      console.log(e);
    }
    this.running = false;
  }

  // 更新服务信息
  async update(options) {
    // 记录当前服务状态
    let reboot = this.running;
    await this.stop();
    // 更新
    if (options) {
      this.info.name = options.name;
      this.info.proxyPort = options.proxyPort;
      this.info.pluginPort = options.pluginPort;
      this.info.deviceAddr = options.deviceAddr;
      this.info.projectDir = options.projectDir;
    }
    // 重新初始化应用
    this.createServer();
    // 重启服务
    reboot && this.run();
  }
}

class ServerList {
  constructor() {
    this.list = [];
    // this.init();
  }

  // 初始化服务列表
  init() {
    this.destroy();
    this.updateListInfo();
  }

  // 获取最新的数据库数据
  updateListInfo() {
    this.list.length = 0;
    const LIST = Common.ServerDB.getData({});
    LIST.forEach(info => {
      let data = JSON.parse(JSON.stringify(info));
      data.id = info.id;
      this.list.push(new Server(data));
    });
  }

  // 服务列表信息
  get listInfo() {
    return this.list.map(server => {
      const { basic, proxy, local } = server;
      return {
        id: server.id,
        running: server.running,
        basic,
        proxy,
        local
      }
    });
  }
  
  // 运行服务
  async runServer(id) {
    let server = this.list.find(server => id === server.id);
    let portValid = await Utils.checkPortAvailable(server.info.proxyPort);
    if (!portValid) {
      return new Error('无效端口');
    }
    server.run();
  }
  // 停止服务
  stopServer(id) {
    let server = this.list.find(server => id === server.id);
    return server.stop();
  }
  // 新增服务
  async addServer(options) {
    options.id = Utils.newSerialNum(this.list.map(server => server.id));
    this.list.push(new Server(options));
    return Common.ServerDB.addData(options);
  }
  // 删除服务
  delServer(aId = []) {
    let aPro = [];
    this.list = this.list.filter(item => !aId.includes(item.id));
    aId.forEach(id => {
      aPro.push(Common.ServerDB.deleteData({ id }));
    });
    return Promise.all(aPro);
  }
  // 更新所有服务
  async updateServerList() {
    let aPro = [];
    this.list.forEach(server => {
      aPro.push(server.stop().then(() => server.update()));
    });
    return Promise.all(aPro);
  }
  // 更新服务信息
  async updateServer(options) {
    let server = this.list.find(server => options.id === server.id);
    if (!server) {
      return;
    }
    await server.update(options);
    const dbData = Common.ServerDB.getData({ id: options.id }, true);
    Object.keys(options).forEach(key => {
      dbData[0][key] = options[key];
    });
    await Common.ServerDB.updateData(dbData);
    this.updateListInfo();
  }
  // 注销所有服务
  destroy() {
    let aPro = [];
    this.list.forEach(server => {
      if (server.running) {
        aPro.push(server.stop());
      }
    });
    return Promise.all(aPro);
  }
}

export default new ServerList()