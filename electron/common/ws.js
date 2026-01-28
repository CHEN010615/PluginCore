import { WebSocket, WebSocketServer } from 'ws'
import UUID from 'uuid'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';

import Common from './common.js'
import Utils from './utils.js'

const DEVELOPMENT = process.env.NODE_ENV === "development";
const DEBUG_MODE = false;

// websocket服务 基类
class WsServer {
  constructor(options) {
    const { proxyPort, deviceAddr, https = false} = options;

    this.options = options;

    this.webServer = null;
    this.client = null;
    this.targetServer = null;
    this.proxyPort = proxyPort;
    this.deviceAddr = deviceAddr;
    this.https = https;
  }

  createWebWs(options = {}, server = this.options.server) {
    this.webServer = new WebSocketServer({ server });

    this.webServer.on('connection', wsClient => {
      this.client = wsClient;
      options.onConnection && options.onConnection(wsClient);

      wsClient.on('message', msg => {
        msg = this.dealData(msg);
        options.onMessage && options.onMessage(msg);
        this.targetServer.send(msg);
      });

      wsClient.on('close', () => {
        console.log('web ws服务已关闭');
        options.onClose && options.onClose();
      });

      wsClient.on('error', (error) => {
        console.error('客户端连接错误:', error);
      });
    });
  }

  createTargetWs(targetUrl, options = {}) {
    this.targetServer = new WebSocket(targetUrl);

    this.targetServer.on('open', () => {
      console.log('目标ws服务已连接');
      options.onOpen && options.onOpen();
    });

    this.targetServer.on('message', msg => {
      msg = this.dealData(msg);
      options.onMessage && options.onMessage(msg);
      this.client.send(msg);
    });

    this.targetServer.on('close', () => {
      console.log('目标ws服务已断开');
      options.onClose && options.onClose();
      this.client?.close();
    });
  }

  dealData(data) {
    return data;
  }

  close() {
    this.client = null;
    this.targetServer?.close();
    this.webServer?.close();
  }
}

// 插件 websocket 转发服务器
class PluginWs extends WsServer {
  constructor(options) {
    super(options);

    this.wsType = "plugin";
    this.pluginPort = options.pluginPort;

    this.pluginUUID = "";
    this.pluginProtocolType = "";
    this.getProtocolTypeTimer = -1;

    this.createWebWs();
    this.createPluginWs();
  }

  createWebWs() {
    const self = this;
    super.createWebWs({
      onMessage(msg) {
        self.debugMode && console.log({ type: "web -> plugin", msg });
      }
    });
  }

  createPluginWs() {
    const self = this;
    super.createTargetWs(this.targetUrl, {
      oOpen() {
        self.getPluginLocalConfig();
      },
      onMessage(msg) {
        self.debugMode && console.log({ type: "plugin -> web", msg });
      }
    });
  }

  dealData(data) {
    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8');
    }
    try {
      const oMsg = JSON.parse(data);
      // 记录插件UUID
      if (!this.pluginUUID) {
        this.pluginUUID = oMsg.uuid;
      }
      // 记录插件配置
      if (oMsg?.localConfig) {
        this.pluginProtocolType = oMsg.localConfig.protocolType;
      }
    } catch {
      //
    }
    
    const aLocalAddress = Common.localAddress;
    if (aLocalAddress.some(address => data.includes(address))) {
      DEBUG_MODE && console.log('old', data);
      // 替换代理服务器ip，修正传递给插件的信息
      const { replaceReg, deviceStr } = this.getDevicePrefix(data, aLocalAddress[Number(data.includes('127.0.0.1'))]);
      data = data.replace(replaceReg, deviceStr);
      DEBUG_MODE && console.log('new', data);
    }
    return data;
  }

  getDevicePrefix(data, localAddress) {
    let replaceReg = Utils.generateIpPortRegex(localAddress);
    let deviceStr = this.deviceAddr;

    if (!data.includes("video.startPlay")) {
      return { replaceReg, deviceStr };
    }

    // 兼容插件四种预览模式

    // TCP
    if (this.pluginProtocolType === '0') {
      replaceReg = new RegExp(`http://${localAddress}:${this.proxyPort}`, 'g');
      deviceStr = `http${this.https ? 's' : ''}://${this.deviceAddr}`;
    }
    // MULTICAST
    if (this.pluginProtocolType === '3') {
      deviceStr = `${this.deviceAddr}:554`;
    }
    // UDP
    // HTTP

    return { replaceReg, deviceStr };
  }

  getPluginLocalConfig() {
    clearTimeout(this.getProtocolTypeTimer);
    if (!this.pluginUUID) {
      return this.getProtocolTypeTimer = setTimeout(() => {
        this.getPluginLocalConfig();
      }, 1000);
    }
    this.targetServer.send(JSON.stringify({
      cmd: "video.getLocalConfig",
      sequence: UUID.v4(),
      timestamp: new Date().getTime(),
      uuid: this.pluginUUID
    }));
  }

  get targetUrl() {
    return `ws://127.0.0.1:${this.pluginPort}`;
  }

  get debugMode() {
    return DEVELOPMENT && !DEBUG_MODE;
  }
}

// 无插件 websocket 转发服务器
class NoPluginWs extends WsServer {
  constructor(options) {
    super(options);

    this.app = null;
    this.middleware = null;

    this.createMiddleServer();
  }

  createMiddleServer() {
    this.app = new express();

    this.middleware = createProxyMiddleware({
      target: this.targetUrl,
      changeOrigin: true,
      secure: false,
      ws: true // 启用 WebSocket 代理
    });

    this.app.use('*', this.middleware);

    this.server = this.app.listen(this.noPluginPort, () => {
      console.log(`无插件请求转发已启用，占用端口：${this.noPluginPort}`);
    });

    this.server.on('upgrade', (req, socket, head) => {
      console.log(`无插件转发目标地址：${this.targetUrl}`);
      try {
        this.middleware.upgrade(req, socket, head);
      } catch (error) {
        console.error('WebSocket upgrade error:', error);
        socket.destroy();
      }
    });
  }

  close() {
    this.server?.close(() => {
      console.log(`无插件请求转发已停用`);
    });
  }

  get targetUrl() {
    return `http${this.https ? 's' : ''}://${this.deviceAddr}`;
  }

  get noPluginPort() {
    return 7681;
    // return this.https ? 7682 : 7681;
  }
}

export default (bPlugin, options) => {
  if (bPlugin) {
    return new PluginWs(options)
  }
  return new NoPluginWs(options);
}