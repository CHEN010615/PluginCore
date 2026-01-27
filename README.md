# ImageTransformer
图片转换工具



#### 项目结构

```json
{
    "build": {
        "assets": "打包静态资源",
        "after-pack.js": "打包后执行文件，用于裁剪electron打包后内容（多语言等）",
        "electron-builder.json": "electron-builder 配置文件",
        "vite.config.js": "vite 配置文件"
    },
    "dist": {
        "electron": "electron 成果物",
        "vite": "vite 成果物"
    },
    "electron": "electron 源码",
    "vite": "vue 源码",
    "nodemon.json": "nodemon 配置文件"
}
```



#### Node版本 

| 操作系统 |   版本    |
| :------: | :-------: |
| Windows  | `21.0.0`  |
|  MacOS   | `22.12.0` |



#### 项目依赖

- `vue3`

  [官方文档](https://cn.vuejs.org/guide/introduction.html)

- `electron`

  [文档链接](https://www.electronjs.org/zh/docs/latest/README)

- `elementUI-plus`

  [官方文档](https://element-plus.org/zh-CN/component/overview.html)



#### 打包

- **electron-builder**

  [配置文档1](https://blog.csdn.net/liyu_ya/article/details/135282663)

  [配置文档2](https://blog.csdn.net/Tom__cy/article/details/110545953)
  
- **vite**

  [配置文档](https://cn.vitejs.dev/config/)