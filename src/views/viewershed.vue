<!--
 * @Author: xyb 1467931050@qq.com
 * @Date: 2023-05-08 09:25:05
 * @LastEditors: xyb 1467931050@qq.com
 * @LastEditTime: 2023-05-08 10:57:09
 * @FilePath: \vite-vue3-ts-cesium\src\views\viewershed.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <canvas id="canvasMap" style="display: none"> </canvas>
  <div class="vs-tools">
    <el-button @click="start">创建可视域分析</el-button>
    <el-button @click="clear">清空</el-button>
  </div>
</template>
<script>
import ViewShedAnalysis from "../assets/CreateView";
const Cesium = window.Cesium;
let viewer = undefined;
let vaObj;
export default {
  data() {
    return {};
  },
  mounted() {
    viewer = window.viewer;
    vaObj = new ViewShedAnalysis(viewer, "canvasMap");
    this.getLocation();
  },
  methods: {
    start() {
      vaObj.createViewshed(10);
    },
    clear() {
      vaObj.clearAll();
    },
    getLocation() {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function (event) {
        let earthPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(earthPosition)) {
          let cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
          let lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
          let lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
          let height = cartographic.height.toFixed(2);
          console.log(earthPosition, {
            lon: lon,
            lat: lat,
            height: height,
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
  },
};
</script>
<style lang="scss" scoped>
.vs-tools {
  position: absolute;
  z-index: 10;
  border: 1px solid rgb(31, 30, 30);
  background-color: rgba(78, 77, 77, 0.8);
  border-radius: 5px;
  margin: 10px;
  padding: 10px;
}
</style>