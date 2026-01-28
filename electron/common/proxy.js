import Path from 'path'
import serveStatic from 'serve-static'
import { createProxyMiddleware } from 'http-proxy-middleware';

import Common from './common.js'
import Utils from './utils.js'

const mimePath = Path.join(Common.dirname, './data/mime.json')

const MIME = await Utils.readFile(mimePath, 'json')

export default class Proxy {
  constructor(options) {
    const {
      localPort = 8080,
      plugin = true,
      pluginPort = 33686,
      proxyIp = "",
      localDir = "",
      https = false
    } = options;
    this.localPort = localPort;
    this.plugin = plugin;
    this.pluginPort = pluginPort;
    this.proxyIp = proxyIp;
    this.localDir = localDir;
    this.https = https;

    this.httpMiddleware = null;
  }

  expand(app) {
    // 替换本地资源
    this.replaceResource(app);
    // 代理http、https协议
    this.httpProxy(app);
  }

  httpProxy(app) {
    this.httpMiddleware = createProxyMiddleware({
      target: this.target,
      secure: false,
      changeOrigin: true
    });

    const headerPreserver = (req, res, next) => {
      // 将原始头信息存储在req对象中供代理使用
      req.originalHeaders = { ...req.headers };
      next();
    };

    app.use(/(?!\/doc)/, headerPreserver, this.httpMiddleware);
  }

  replaceResource(app) {
    // 替换本地资源的插件端口
    this.plugin && app.get('*.js', async (req, res) => {
      let data = await this.replacePluginPort(req.path);
      res.send(data);
    });
    this.plugin && app.get('*/project_config.json', async (req, res) => {
      let data = await this.replacePluginPort(req.path);
      res.send(data);
    });
    // 代理其他资源
    app.use(serveStatic(Path.resolve(this.localDir), {
      setHeaders: (res, path) => {
        const ext = Path.extname(path);
        if (ext in MIME) {
          res.setHeader('Content-Type', MIME[ext]);
        }
      }
    }));
  }

  async replacePluginPort(reqPath) {
    const pluginPortRange = this.pluginPortRange;
    
    const filePath = Path.join(this.localDir, reqPath)
    let data = await Utils.readFile(filePath);
    // 替换探测端口范围，保证连接到插件代理服务
    let port = pluginPortRange[0];
    do {
      const reg = new RegExp(port, 'g');
      data = data.replace(reg, this.localPort);
      port++;
    } while(port <= pluginPortRange[1])
    return data;
  }

  get target() {
    return `http${this.https ? 's' : ''}://${this.proxyIp}/`;
  }

  get pluginPortRange() {
    return [this.pluginPort, this.pluginPort + 9]
  }
}