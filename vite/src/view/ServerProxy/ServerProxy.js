import { toRaw } from 'vue'

const METHOD = {};

const initMethod = () => {
  Object.keys(window.PluginServer).forEach(key => {
    METHOD[key] = window.PluginServer[key];
  });
}

class ServerProxy {
  constructor() {
    this.serverList = [];
    this.curServerID = 0;
    this.server = {
      name: "",
      proxyPort: 1,
      plugin: true,
      pluginPort: 33686,
      localPort: 1,
      deviceAddr: "127.0.0.1",
      vue: true,
      https: false,
      projectDir: ""
    };
  }

  init() {
    if (Object.keys(METHOD).length) {
      return;
    }
    initMethod();
  }

  async getServerList() {
    this.serverList.length = 0;

    const data = await METHOD.getServerList();

    data.forEach(item => {
      const { id, running, basic, proxy, local } = item;

      this.serverList.push({
        params: {
          id,
          enable: running,
          checked: false
        },
        info: {
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
      })
    });
  }

  async getServerById(id = 0) {
    if (id === 0) {
      return this.emptyInfo;
    }

    if (!this.serverList.length) {
      await this.getServerList()
    }

    return this.serverList.find(item => id === item.params.id)?.info || null;
  }

  async updateServerInfo(id = 0) {
    this.curServerID = id;
    const server = await this.getServerById(id);
    Object.keys(server).forEach(key => {
      this.server[key] = server[key];
    });
  }

  addServer() {
    return METHOD.addServer(toRaw(this.addInfo));
  }

  modifyServer() {
    return METHOD.updateServer(toRaw(this.editInfo));
  }

  getCheckedList() {
    const idList = this.serverList.filter(item => {
      return item.params.checked;
    }).map(item => item.params.id);
    
    return toRaw(idList);
  }

  get editInfo() {
    return {
      id: this.curServerID,
      ...toRaw(this.addInfo)
    }
  }

  get addInfo() {
    const server = this.server;
    const basic = { name: server.name };
    const proxy = {
      proxyPort: parseInt(server.proxyPort, 10),
      plugin: server.plugin,
      pluginPort: parseInt(server.pluginPort, 10),
      deviceAddr: server.deviceAddr,
      projectDir: server.projectDir,
      https: server.https
    };
    const local = {
      vue: server.vue,
      localPort: parseInt(server.localPort, 10)
    };
    return { basic, proxy, local };
  }

  get emptyInfo() {
    return JSON.parse(JSON.stringify({
      name: "",
      proxyPort: 1,
      plugin: true,
      pluginPort: 33686,
      deviceAddr: "127.0.0.1",
      projectDir: "",
      localPort: 1,
      vue: false,
      https: false
    }));
  }
}

export default new ServerProxy();