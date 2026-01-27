import Utils from './utils.js'
import Common from './common.js'
import { ToolList } from '../data/ToolList.js'
import { imageTransform } from '../tool/ImageTranform.js'

export default class API {
  constructor() {
    // ServerList.init();
  }
  // 获取工具列表
  getToolList() {
    return ToolList;
  }
  // 选择目录
  chooseDir() {
    return Utils.chooseDir();
  }
  // 图片转换
  imageTransform(options) {
    return imageTransform(options);
  }
}