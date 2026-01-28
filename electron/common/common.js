import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import os from 'os'

import { CONFIG_KEY } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url);

class Common {
  constructor() {
    this.dev = process.env.NODE_ENV === "development"
    this.dirname = path.join(dirname(__filename), '../');
    this.ConfigDB = null;
    this.ServerDB = null;
  }

  init(db) {
    this.ConfigDB = db.Config;
    this.ServerDB = db.Server;

    !this.dev && this.productionDeal();
  }

  get config() {
    const [data] = this.ConfigDB.getData();
    const config = {};
    CONFIG_KEY.forEach(key => {
      config[key] = data[key];
    });
    return config;
  }

  getConfig() {
    return this.config;
  }

  async updateConfig(data) {
    const [config] = this.ConfigDB.getData(undefined, true);
    Object.keys(data).forEach(key => {
      this.config[key] = data[key];
      config[key] = data[key];
    });
    this.ConfigDB.updateData(config);
  }

  productionDeal() {
    console.log = () => {};
  }

  get localAddress() {
    const interfaces = os.networkInterfaces();
    let localIP = '';

    Object.keys(interfaces).forEach(interfaceName => {
      interfaces[interfaceName].forEach(iface => {
        // 跳过非 IPv4 或内部地址
        if (iface.family !== 'IPv4' || iface.internal !== false) return;
  
        // 检查是否为局域网地址（私有地址范围）
        const address = iface.address;
        if (
          address.startsWith('192.168.') ||
          address.startsWith('10.') ||
          (address.startsWith('172.') && 
           parseInt(address.split('.')[1], 10) >= 16 && 
           parseInt(address.split('.')[1], 10) <= 31)
        ) {
          localIP = address;
        }
      });
    });

    return [localIP, '127.0.0.1'];
  }
}

export default new Common();