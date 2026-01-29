// build-platform.js
import { execSync } from 'child_process'
import os from 'os'

const platform = os.platform();

let platformFlag = '';

if (platform === 'win32') {
  platformFlag = '--win';
} else if (platform === 'darwin') {
  platformFlag = '--mac';
} else {
  console.error('Unsupported platform:', platform);
  process.exit(1);
}

try {
  execSync(`cross-env NODE_ENV=production&& electron-builder install-app-deps && electron-builder --config build/electron-builder.json ${platformFlag}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}