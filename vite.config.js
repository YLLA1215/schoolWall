/*
 * @Author: 黄叶
 * @Date: 2023-04-18 21:42:04
 * @LastEditTime: 2023-06-07 11:37:28
 * @FilePath: /schoolWall/vite.config.js
 * @Description:
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import transformerDirective from "@unocss/transformer-directives";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { ArcoResolver } from "unplugin-vue-components/resolvers";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { VantResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/schoolWall",
  plugins: [
    vue(),
    UnoCSS({ transformers: [transformerDirective()] }),
    AutoImport({
      imports: [
        "vue",
        {
          "naive-ui": [
            "useDialog",
            "useMessage",
            "useNotification",
            "useLoadingBar",
          ],
        },
        // "@vicons/antd",
        // "@vicons/carbon",
        // "@vicons/fa",
        // "@vicons/fluent",
        // "@vicons/ionicons4",
        // "@vicons/ionicons5",
        // "@vicons/material",
        // "@vicons/tabler"
      ],
      resolvers: [ElementPlusResolver(), ArcoResolver(), NaiveUiResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        ArcoResolver({
          sideEffect: true,
        }),
        NaiveUiResolver(),
        VantResolver()
      ],
    }),
  ],
});
