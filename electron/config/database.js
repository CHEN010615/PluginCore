import Loki from 'lokijs'
import Path from 'path'

const DATABASE_KEY = {
  config: ['localProxy', 'autoOpen'],
  server: ['id', 'basic', 'proxy', 'local', 'api']
};

export const CONFIG_KEY = DATABASE_KEY['config'];

class Database {
  constructor(key, path) {
    this.key = key;
    this.path = path;
    this.database = null;
    this.Collection = null;
  }

  init() {
    return new Promise(resolve => {
      // 创建数据库实例并配置适配器
      this.database = new Loki(this.path, {
        // 持久化适配器配置
        adapter: new Loki.LokiFsAdapter(), // 使用文件系统适配器
  
        // 自动加载配置
        autoload: true, // 应用启动时自动加载数据库文件
        autoloadCallback: () => {
          this.initDB();
          resolve();
        }, // 加载完成后的回调函数，用于初始化集合
  
        // 自动保存配置
        autosave: true, // 启用自动保存
        autosaveInterval: 1000, // 自动保存间隔（毫秒）
        autosaveCallback: () => { // 自动保存后的回调（可选）
          console.log(`${this.key} 数据库已自动保存`);
        }
      });
    });
  }

  initDB() {
    if (this.Collection === null) {
      this.Collection = this.database.addCollection(this.key, {
        indices: this.indices,
        autoupdate: true, // 允许文档自动更新
        disableDeltaChangesApi: true
      });
      'server' !== this.key && this.Collection.insert( { localProxy : true, autoOpen: true } );
    }
  }

  getData(options, original) {
    this.Collection = this.database.getCollection(this.key);
    const dbData = this.Collection.find(options) || [];
    if (original) {
      return dbData;
    }
    return dbData.map(item => {
      const data = {};
      this.dataKeys.forEach(key => {
        data[key] = item[key];
      });
      return data;
    });
  }

  get indices() {
    return 'server' === this.key ? ['id'] : CONFIG_KEY;
  }

  get dataKeys() {
    return DATABASE_KEY[this.key];
  }

  updateData(data) {
    return this.handler(() => {
      this.Collection.update(data);
    });
  }

  addData(data) {
    return this.handler(() => {
      this.Collection.insert(data);
    });
  }

  deleteData(options) {
    return this.handler(() => {
      this.Collection.chain().find(options).remove();
    });
  }

  handler(cb) {
    return new Promise((resolve, reject) => {
      try {
        cb();
      } catch (e) {
        return reject(e);
      }

      this.database.saveDatabase(e => {
        if (e) {
          return reject(e);
        }
        resolve();
      });
    });
  }
}

class DBServer {
  constructor() {
    this.Config = null;
    this.Server = null;
  }

  init(app) {
    // 使用 app.getPath('userData') 获取应用专属的用户数据目录，避免权限问题
    this.Config = new Database('config', Path.join(app.getPath('userData'), 'config.db'));
    this.Server = new Database('server', Path.join(app.getPath('userData'), 'server.db'));

    // 应用退出前确保最后一次保存
    app.on('before-quit', () => {
      // 如果自动保存已开启，这步不是必须的，但作为保险措施
      if (this.Config.database.autosave) {
        this.Config.database.close(); // close() 方法会确保执行一次保存
      }
      if (this.Server.database.autosave) {
        this.Server.database.close(); // close() 方法会确保执行一次保存
      }
    });

    return Promise.all([this.Config.init(), this.Server.init()])
  }
}

export default new DBServer();