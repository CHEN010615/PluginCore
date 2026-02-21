import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);

class Common {
  constructor() {
    this.dev = process.env.NODE_ENV === "development"
    this.dirname = path.join(dirname(__filename), '../');
    this.mac = !(process.platform === 'win32' || process.platform === 'linux');
  }

  /**
   * 将路径转换为当前系统的路径分隔符
   * @param {string} path 需要转换的路径
   * @returns {string} 转换后的路径
   */
  transformPath(path) {
    const oReg = new RegExp(this.defaultPathSeparator, 'g');
    return path.replace(oReg, this.mac ? '/' : '\\');
  }

  // 获取当前系统的默认路径分隔符
  get defaultPathSeparator() {
    return this.mac ? '/' : '\\';
  }
}

export default new Common();