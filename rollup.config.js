import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

import path from "path";
import fs from "fs";
const getPath = (_path) => path.resolve(__dirname, _path);

const args = process.argv;
const isDev = args[args.length - 2] === "-wc";

const devPlugins = isDev
  ? [
      livereload(),
      serve({
        host: "0.0.0.0",
        open: true,
        contentBase: "",
        port: 8080,
      }),
    ]
  : [];

const getOutput = (name) => {
  return isDev
    ? {
        file: `demo/${name}.js`,
        format: "umd",
        name: "LzdCallApp",
        sourcemap: true,
      }
    : [
      {
        file: `dist/${name}.iife.js`,
        format: "iife",
        name: "LzdCallApp",
      },
      {
        file: `dist/${name}.js`,
        format: "umd",
        name: "LzdCallApp",
      }
    ];
};

const getConfig = () => {
  return fs.readdirSync(getPath("src/core/")).map((f) => {
    const name = path.parse(f).name;

    return {
      input: `src/core/${f}`,
      output: getOutput(name),
      plugins: [
        nodeResolve(),
        commonjs(),
        typescript(),
        babel({
          babelHelpers: "bundled",
        }),
        terser({ format: { comments: false } }),
        ...devPlugins,
      ],
    };
  });
};

export default getConfig();
