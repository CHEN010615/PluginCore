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
  resolvePromise(params) {
    return new Promise(resolve => resolve(params));
  }
  rejectPromise(params) {
    return new Promise((resolve, reject) => reject(params));
  }
  checkProjectDir(path) {
    console.log(path);
    return new Promise((resolve, reject) => {
      fs.readdir(path, {}, (err, files) => {
        if (err) {
          return reject(err);
        }
        if (!files.includes("index.asp")) {
          return reject(new Error("无效目录"));
        }
        resolve();
      });
    });
  }
  checkPortAvailable(port) {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
  
      server.once('listening', () => {
        server.close();
        resolve(true); // 端口可用
      });
  
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          return resolve(false); // 端口已被占用
        }
        resolve(false);
      });

      server.listen(port, '127.0.0.1');
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
  /**
   * 获取有序序列的新序列号
   * @param {Array} existingIDs 已存在的序列号
   * @param {Number} min 最小值
   * @returns {Number} new serial num
   */
  newSerialNum(existingIDs = [], min = 1) {
    // 校验ID数组
    if (!Array.isArray(existingIDs) || existingIDs.some(i => !Number.isInteger(i) || i < min)) {
      return null;
    }
    // 空数组直接返回最小值
    if (!existingIDs.length) {
      return min;
    }
    // 已存在ID的范围
    const maxID = Math.max(...existingIDs);
    const possibleIDs = new Set();
    for (let i = min; i <= maxID + 1; i++) {
      possibleIDs.add(i);
    }
    // 找出缺失的ID
    const existingSet = new Set(existingIDs);
    const missingIDs = [...possibleIDs].filter(id => !existingSet.has(id));
    // 如果没缺失，则返回最大值+1，否则返回缺失ID的最小值
    return missingIDs.length ? Math.min(...missingIDs) : (maxID + 1);
  }
  generateIpPortRegex(ip) {
    // 转义 IP 地址中的点号，防止被当作正则特殊字符
    const escapedIp = ip.replace(/\./g, '\\.');
    
    // 构建正则表达式
    const regexPattern = `${escapedIp}:(\\d+)?`;
    const regex = new RegExp(regexPattern, 'g');
    
    return regex;
  }
  openPage(url) {
    return open(url, { app: 'chrome' });
  }
}

export default new Utils();