import fs from "fs";

export default async (context) => {
  await removeOtherLan(context);
}

// 裁剪非中文
const removeOtherLan = async (context) => {
  const localeDir = context.appOutDir + "/locales/";

  fs.readdir(localeDir, function (err, files) {
    if (!(files && files.length)) return;
    for (let i = 0, len = files.length; i < len; i++) {
      // 只保留中文
      const match = files[i].match(/zh-CN\.pak/);
      if (match === null) {
        fs.unlinkSync(localeDir + files[i]);
      }
    }
  });
};