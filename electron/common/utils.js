import fs from 'fs'
import { dialog } from 'electron'
import { exec } from 'child_process'
import net from 'net'
import open from 'open'

class Utils {
  async readFile(path, formatType = "string") {
    let data = fs.readFileSync(path, 'utf8');
    if ('json' === formatType) {
      data = JSON.parse(data);
    }
    return data;
  }
  writeFile(path, content) {
    return new Promise((resolve) => {
      fs.writeFile(path, content, () => {
        resolve();
      });
    });
  }
  chooseDir() {
    return new Promise((resolve) => {
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then(result => {
        if (result.canceled) {
          return resolve();
        }
        resolve(result.filePaths[0]);
      }).catch(() => {
        resolve();
      });
    });
  }
  async openDir(path) {
    try {
      await this.cmd(`explorer "${path}"`);
    } catch(e) {
      return this.resolvePromise();
    }
    return this.resolvePromise();
  }
  checkPortOccupy(port) {
    return new Promise((resolve, reject) => {
      const server = net.createServer().listen(port);
  
      server.on('listening', () => {
        server.close();
        resolve(false); // 端口未被占用
      });
  
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject("端口已被占用"); // 端口已被占用
        } else {
          reject(err);
        }
      });
    });
  }
  cmd(commond) {
    return new Promise((resolve, reject) => {
      exec(commond, (error, stdout, stderr) => {
        if (error) {
          return reject();
        }
        if (stderr) {
          return reject();
        }
        resolve(stdout.toString().trim());
      });
    });
  }
  imageTransform(options) {
    //
  }
  openPage(url) {
    return open(url, { app: 'chrome' });
  }
  resolvePromise(params) {
    return new Promise(resolve => resolve(params));
  }
  rejectPromise(params) {
    return new Promise((resolve, reject) => reject(params));
  }
}

export default new Utils();