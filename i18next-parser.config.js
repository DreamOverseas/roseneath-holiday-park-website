module.exports = {
  // 支持的语言列表
  locales: ["en", "zh"],

  // 指定输出目录及文件名称。$LOCALE 会被替换为具体语言代码
  output: "src/locales/$LOCALE.json",

  // 是否使用键名作为默认值
  useKeysAsDefaultValue: true,

  // 解析的输入文件路径，可以包含多个路径
  input: [
    "src/**/*.{js,jsx}", // 扫描 src 目录下所有 .js 和 .jsx 文件
  ],

  // 解析的键的配置
  keySeparator: false, // 如果使用 "." 作为键的一部分，而不是键分隔符
  namespaceSeparator: false, // 如果不使用命名空间（不需要在键名里区分不同的模块）

  // 是否创建旧版本文件备份
  createOldCatalogs: false, // 如果设置为 true，会生成 .old.json 文件作为备份

  // 默认命名空间
  defaultNamespace: "translation",

  // 插值设置（例如用于变量的格式）
  interpolation: {
    prefix: "{{",
    suffix: "}}",
  },
};
