import Utils from './utils.js'
import { ToolList } from '../data/ToolList.js'
import Common from './common.js'

export default class API {
  constructor() {
    // ServerList.init();
  }
  // 获取工具列表
  getToolList() {
    return ToolList;
  }
  // 选择文件
  chooseFile(multiple = false) {
    return Utils.chooseFile(multiple);
  }
  // 选择目录
  chooseDir() {
    return Utils.chooseDir();
  }
  // 图片转换
  imageTransform(options) {
    return Utils.multiCompressImg(options);
  }
  // 读取目录下的所有文件
  readAllFiles(dirPath) {
    return Utils.resolvePromise(Utils.readAllFiles(dirPath, ['jpg', 'jpeg', 'png', 'gif']));
  }
  // 获取当前系统的默认路径分隔符
  getDefaultPathSeparator() {
    return Utils.resolvePromise(Common.defaultPathSeparator);
  }
}