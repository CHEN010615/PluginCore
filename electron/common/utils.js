import fs from 'fs'
import { dialog } from 'electron'

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
}

export default new Utils();