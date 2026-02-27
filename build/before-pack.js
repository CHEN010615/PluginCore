// before-pack.js
import { execSync } from 'child_process'
import os from 'os'
import path from 'path'
import fs from 'fs'

const PLATFORM = process.env.PLATFORM || os.platform();
const ARCH = process.env.ARCH || os.arch();

// 确保在构建前正确处理sharp依赖
try {
  // 尝试删除现有的node_modules/sharp，避免冲突
  const sharpPath = path.join(process.cwd(), 'node_modules', 'sharp');
  if (fs.existsSync(sharpPath)) {
    console.log('移除sharp...');
    execSync('npm uninstall sharp', { stdio: 'inherit' });
  }
  
  // 重新安装sharp，确保正确构建
  console.log(`安装${PLATFORM}+${ARCH}版本sharp...`);
  execSync(`npm install sharp --platform=${PLATFORM} --arch=${ARCH}`, { stdio: 'inherit' });
} catch (error) {
  console.error('安装sharp失败:', error);
  process.exit(1);
}
