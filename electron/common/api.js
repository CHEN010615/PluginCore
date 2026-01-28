import ServerList from './server.js';
import Utils from './utils.js';
import Common from './common.js'

export default class API {
  constructor() {
    ServerList.init();
  }

  getServerList() {
    return Utils.resolvePromise(ServerList.listInfo);
  }
  addServer(options) {
    return ServerList.addServer(options);
  }
  deleteServer(options) {
    return ServerList.delServer(options.id);
  }
  updateServer(options) {
    return ServerList.updateServer(options);
  }
  runServer(id) {
    return ServerList.runServer(id);
  }
  stopServer(id) {
    return ServerList.stopServer(id);
  }
  destroy() {
    return ServerList.destroy();
  }
  chooseDir() {
    return Utils.chooseDir();
  }
  checkProjectDir(path) {
    return Utils.checkProjectDir(path);
  }
  openDir(path) {
    return Utils.openDir(path);
  }
  getConfig() {
    return Utils.resolvePromise(Common.config);
  }
  async setConfig(data) {
    return Common.updateConfig(data);
  }
  initServerList() {
    return ServerList.updateServerList();
  }
  openDeviceWeb(url) {
    return new Promise(resolve => {
      Utils.openPage(url).then(() => resolve);
    });
  }
}