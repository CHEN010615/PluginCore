import fs from 'fs'
import { dialog } from 'electron'
import { exec } from 'child_process'
import net from 'net'
import open from 'open'
import path from 'path'

import ImageTransform from '../tool/ImageTranform.js'

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
  chooseFile(accept = ['jpg', 'jpeg', 'png', 'gif'], multiple = false) {
    return new Promise(resolve => {
      dialog.showOpenDialog({
        properties: ['openFile', ...[multiple ? 'multiSelections' : '']],
        filters: [{
          name: "Images",
          extensions: accept
        }]
      }).then(result => {
        if (result.canceled) {
          return resolve();
        }
        resolve(result.filePaths);
      })
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
  /**
   * 批量压缩图片
   * @param {Object} options 压缩选项，包含以下属性：
   * @param {Boolean} options.multiple 是否批量压缩，默认为false
   * @param {String} options.targetPath 目标路径，可以是单个文件路径或目录路径
   * @param {String} options.outputPath 输出目录路径
   * @param {Number} options.fileSize 目标文件大小，单位KB
   * @param {Array} accept 接受的文件类型数组，如 ['jpg', 'png']，如果不传则接受所有文件类型
   * @returns 
   */
  multiCompressImg(options, accept = ['jpg', 'jpeg', 'png', 'gif']) {
    // 解构参数
    let { multiple = false, targetPath, outputPath, fileSize } = options;
    // 存储所有压缩结果的Promise对象数组
    const aPro = [];
    // 读取所有文件
    const allFiles = !multiple ? [targetPath] : this.readAllFiles(targetPath, accept);
    // 计算相对于目标路径的相对路径，单文件时直接使用文件名
    targetPath = multiple ? targetPath : targetPath.split('/').slice(0, -1).join('/');
    // 遍历所有文件，进行压缩
    allFiles.forEach(filePath => {
      aPro.push(ImageTransform.imgCompress({ targetPath, filePath, outputPath, fileSize }));
    });
    return Promise.all(aPro);
  }
  /**
   * 递归读取目录下的所有文件
   * @param {String} dirPath 目录路径
   * @param {Array} accept 接受的文件类型数组，如 ['jpg', 'png']，如果不传则接受所有文件类型
   * @returns {Array} 返回目录下的所有文件路径数组
   */
  readAllFiles(dirPath, accept) {
    // 获取目录状态
    const stat = fs.statSync(dirPath);
    // 如果不是目录，直接返回文件路径数组
    if (!stat.isDirectory()) {
      return [dirPath];
    }
    // 读取目录下的所有文件和子目录
    const files = fs.readdirSync(dirPath);
    let allFiles = [];
    // 遍历所有文件和子目录
    files.forEach(file => {
      const filePath = `${dirPath}/${file}`;
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // 递归读取子目录下的文件
        const subFiles = this.readAllFiles(filePath, accept);
        for (let file of subFiles) {
          allFiles.push(file);
        }
      } else {
        // 判断文件类型
        const extname = path.extname(file).replace('.', '');
        if (accept && !accept.includes(extname)) {
          return;
        }
        allFiles.push(filePath);
      }
    });
    return allFiles;
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