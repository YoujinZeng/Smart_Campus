<!--
 * @Author: xyb 1467931050@qq.com
 * @Date: 2023-04-21 15:51:53
 * @LastEditors: xyb 1467931050@qq.com
 * @LastEditTime: 2023-05-29 19:49:33
 * @FilePath: \vite-vue3-ts-cesium\src\views\measureManage.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <measureViewer ref="measure"></measureViewer>
</template>
<script>
import measureViewer from "../components/measurePanel.vue";
import { watchEffect } from "vue";
export default {
  data() {
    return {
      viewer: window.viewer,
    };
  },
  components: {
    measureViewer,
  },
  mounted() {
    watchEffect(() => {
      if (window.parentMounted) {
        this.$nextTick(() => {
          this.$refs.measure.init(this.viewer);
        });
      }
    });
  },
};
</script>
<style scoped>
</style>
