const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Add Viro AR Asset support
config.resolver.assetExts.push(
  "bin",
  "vrx",
  "hdr",
  "gltf",
  "glb",
  "obj",
  "mtl",
  "arobject",
  "riv",
  "rive",
);

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "mjs",
  "cjs",
  "js",
  "jsx",
];

module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "./app/globals.css"),
});
