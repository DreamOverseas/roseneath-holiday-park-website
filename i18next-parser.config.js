module.exports = {
  locales: ["en", "zh"],

  output: "public/locales/$LOCALE.json",

  useKeysAsDefaultValue: true,

  // Paths of input files to be parsed, can include multiple paths
  input: [
    "src/**/*.{js,jsx}", // Scan all .js and .jsx files under the src directory
  ],

  keySeparator: false, // If "." is used as part of the key instead of a key separator
  namespaceSeparator: false, // If namespaces are not used (no need to distinguish different modules in key names)

  // Whether to create backups of old version files
  createOldCatalogs: false, // If set to true, .old.json files will be generated as backups

  // Default namespace
  defaultNamespace: "translation",

  // Interpolation settings (e.g., format for variables)
  interpolation: {
    prefix: "{{",
    suffix: "}}",
  },
};
