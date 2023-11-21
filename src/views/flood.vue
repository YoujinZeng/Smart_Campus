<template>
  <div class="flood-tools">
    <el-button size="mini" @click="start">开始淹没分析</el-button>
    <el-button size="mini" @click="stop">结束淹没分析</el-button>
  </div>
</template>
<script>

import { watchEffect } from 'vue';
export default {
  
  data() {
    return {};
  },
  computed: {
    positions() {
      const Cesium = window.Cesium;
      let p0 = new Cesium.Cartesian3(
        -2444641.556428895,
        5049384.084339882,
        3024355.105567344
      );
      let p1 = new Cesium.Cartesian3(
        -2445114.461259,
        5049139.476128641,
        3024364.5076247533
      );
      let p2 = new Cesium.Cartesian3(
        -2445299.824817767,
        5049273.86715508,
        3023988.9126557256
      );
      let p3 = new Cesium.Cartesian3(
        -2444854.84488911,
        5049567.1030451,
        3023857.320037941
      );
      return [p0, p1, p2, p3];
    },
  },
  mounted() {
    watchEffect(() => {
      if (window.parentMounted) {
        this.initRiver(this.positions);
      }
    });
    const Cesium = window.Cesium;
  },
  methods: {
    getClickPos() {
      let $this = this;
      let handler = new window.Cesium.ScreenSpaceEventHandler(
        window.viewer.canvas
      );
      handler.setInputAction((event) => {
        let cartesian = $this.returnCartesian(window.viewer, event.position);
        console.log(cartesian);
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    returnCartesian(viewer, position) {
      let cartesian = viewer.scene.pick(position);
      if (!cartesian) {
        let ray = viewer.camera.getPickRay(position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      }
      return cartesian;
    },
    stop() {
      window.viewer.entities.removeAll();
    },
    start() {
      const Cesium = window.Cesium;
      const viewer = window.viewer;
      var waterHeight = 1.0;
      viewer.entities.add({
        polygon: {
          hierarchy: this.positions,
          material: Cesium.Color.LIGHTBLUE.withAlpha(0.5),
          extrudedHeight: new Cesium.CallbackProperty(function () {
            return waterHeight;
          }, false),
        },
      });
      viewer.clock.onTick.addEventListener(function () {
        if (waterHeight > 50) {
          waterHeight = 1.0;
        }
        waterHeight += 0.01;
      });
      setTimeout(function increaseWater() {
        if (viewer.clock.shouldAnimate) {
          viewer.clock.currentTime = Cesium.JulianDate.addSeconds(
            viewer.clock.currentTime,
            1,
            new Cesium.JulianDate()
          );
          setTimeout(increaseWater, 200);
        }
      }, 200);
    },
    initRiver(points) {
      const Cesium = window.Cesium;
      const viewer = window.viewer;
      let waterPrimitive = new Cesium.Primitive({
        allowPicking: false,
        asynchronous: false,
        geometryInstances: new Cesium.GeometryInstance({
          id: "initRiver",
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(points),
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            extrudedHeight: -4.5,
            height: 0,
          }),
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          aboveGroud: true,
          material: new Cesium.Material({
            fabric: {
              type: "Water",
              uniforms: {
                blendColor: new Cesium.Color(193, 210, 240, 0.1),
                // normalMap: require("../assets/water.jpg"),
                normalMap: new URL("../assets/water.jpg", import.meta.url).href,
                //频率速度设置
                frequency: 2,
                animationSpeed: 0.0000000001,
                amplitude: 1,
              },
            },
          }),
        }),
      });
      viewer.scene.primitives.add(waterPrimitive);
    },
  },
};
</script>
<style lang="scss" scoped>
.flood-tools {
  position: absolute;
  left: 185px;
  margin: 10px;
  padding: 10px;
  background: rgba(54, 54, 54, 0.8);
  border: 1px solid rgb(27, 27, 27);
  z-index: 15;
}
</style>