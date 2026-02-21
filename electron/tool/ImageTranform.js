import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import Common from '../common/common.js'

// 定义支持的压缩类型和对应的sharp方法
const COMPRESS_TYPE = {
  JPG: 'jpeg',
  JPEG: 'jpeg',
  PNG: 'png',
  GIF: 'gif'
};
// 获取当前系统的默认路径分隔符
const DEFAULT_SEPARATOR = Common.defaultPathSeparator;

class ImageTransform {
  constructor() {
    //
  }

  /**
   * 压缩图片
   * @param {Object} options 压缩选项，包含以下属性：
   * @param {String} options.targetPath 目标路径，可以是单个文件路径或目录路径
   * @param {String} options.filePath 文件路径
   * @param {String} options.outputPath 输出目录路径
   * @param {Number} options.fileSize 目标文件大小，单位KB
   * @returns {Object} 返回压缩结果对象，包含以下属性：
   * - success: 压缩是否成功
   * - filePath: 原始文件路径
   * - error: 错误信息（如果压缩失败）
   */
  async imgCompress(options) {
    // 解构参数
    const { targetPath, filePath, outputPath, fileSize } = options;
    // 获取图片类型
    const type = this.getImgType(filePath);
    // 计算相对于目标路径的相对路径
    const relativePath = path.relative(targetPath, filePath);
    // 构建输出文件的完整路径
    const outputDir = path.dirname(`${outputPath}${DEFAULT_SEPARATOR}${relativePath}`);
    // 确保输出目录存在
    fs.mkdirSync(outputDir, { recursive: true });
    // 构建输出文件的完整路径
    const outputFilePath = `${outputDir}${DEFAULT_SEPARATOR}${path.basename(filePath)}`;
    // 定义一个结果对象，初始状态为成功，包含原始文件路径和输出文件路径
    const result = { success: true, filePath, outputPath: outputFilePath };
    try {
      // 压缩图片并保存到输出目录
      await this.compressToSize({
        filePath,
        outputPath: outputFilePath,
        type,
        fileSize
      }, this[`${type.toUpperCase()}Option`]);
    } catch(e) {
      // 如果压缩过程中发生错误，更新结果对象的状态和错误信息
      result.success = false;
      result.error = e.message || '压缩失败';
      delete result.outputPath;
    }
    // 返回压缩结果对象
    return result;
  }

  /**
   * 递归压缩图片直到满足目标文件大小
   * @param {*} options 
   * @param {*} compressOptions 
   * @param {Boolean} recursiveImage 是否是递归调用，默认为false
   * @returns {Object}
   */
  async compressToSize(options, compressOptions, recursiveImage = false) {
    // 解构参数
    let { filePath, outputPath, fileSize, type } = options;
    // 生成临时复制的文件路径
    const extname = path.extname(filePath);
    const copyFileName = `${path.basename(filePath, extname)}_copy${extname}`;
    const cpoyPath = `${outputPath.split(DEFAULT_SEPARATOR).slice(0, -1).join(DEFAULT_SEPARATOR)}${DEFAULT_SEPARATOR}${copyFileName}`;
    // 如果是递归调用，说明已经压缩过一次了，需要复制文件到临时路径进行再次压缩
    if (recursiveImage) {
      fs.copyFileSync(filePath, cpoyPath);
      filePath = cpoyPath;
    }
    // 创建sharp实例
    const image = sharp(filePath);
    // 根据图片类型设置压缩选项，如果是递归调用则降低质量继续压缩
    if (recursiveImage && !this.updateOption(compressOptions)) {
      return fs.unlinkSync(cpoyPath); // 质量已经很低了，不再继续压缩
    }
    const result = image[type](compressOptions);
    // 将压缩后的图片保存到输出目录，保持原有的目录结构
    await result.toFile(outputPath);
    if (recursiveImage) {
      // 删除临时复制的文件
      fs.unlinkSync(cpoyPath);
    }
    // 获取压缩后的图片大小
    const size = fs.readFileSync(outputPath).length / 1024;
    // 如果压缩后的图片大小仍然大于目标大小，则继续压缩
    if (size > fileSize) {
      // 递归调用，继续压缩
      await this.compressToSize({ ...options, filePath: outputPath }, compressOptions, true);
    }
  }

  getImgType(filePath) {
    return COMPRESS_TYPE[path.extname(filePath).replace('.', '').toUpperCase()];
  }

  /**
   * 根据当前压缩选项更新压缩参数，逐步降低质量以达到目标文件大小
   * @param {Object} options 压缩选项对象
   * @returns {Boolean} 是否成功更新压缩参数
   */
  updateOption(options) {
    let updated = false;
    if (options?.quality > 10) {
      // 每次压缩降低5%质量
      options.quality -= 5;
      updated = true;
    } else if (options?.colors > 2) {
      // 每次压缩降低一半的颜色数
      options.colors /= 2;
      updated = true;
    } else if (options?.dither > 0.1) {
      // 每次压缩降低0.1的抖动程度
      options.dither = parseFloat((options.dither - 0.1).toFixed(1));
      updated = true;
    }
    return updated;
  }

  get JPEGOption() {
    return {
      quality: 80,              // 质量 1-100，默认80
      progressive: true,        // 渐进式JPEG
      chromaSubsampling: '4:4:4', // 色度采样，'4:4:4'保留最佳色彩
      optimiseCoding: true,     // 优化编码
      mozjpeg: true,           // 使用mozjpeg压缩（更好但更慢）
      trellisQuantisation: true, // 网格量化
      overshootDeringing: true,  // 过冲去环
      optimiseScans: true       // 优化扫描
    };
  }

  get PNGOption() {
    return {
      compressionLevel: 9,      // 压缩级别 0-9，9为最大压缩
      palette: true,           // 量化至8位调色板（大幅减小体积）
      quality: 80,            // palette为true时有效，50-80推荐
      colors: 128,           // 调色板颜色数
      dither: 0.5,          // 抖动程度 0-1
      progressive: false,    // 是否交错扫描
      adaptiveFiltering: true // 自适应过滤
    };
  }
}

export default new ImageTransform();