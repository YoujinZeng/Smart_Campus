<template>
  <div class="wrapper">
    <el-button
      class="toggle-button"
      type="primary"
      size="mini"
      @click="toggle"
    >
      {{ isOpen ? '隐藏' : '显示' }}
    </el-button>
    <transition name="slide">
      <div v-if="isOpen" class="container">
        <el-button
          type="primary"
          size="mini"
          @click="goHome"
        >回到首页</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="drawLineRoad"
        >绘制路线</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="startFly"
        >开始飞行</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="stopFly"
        >暂停飞行</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="continueFly"
        >继续飞行</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="exitFly"
        >退出飞行</el-button>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import * as Cesium from 'cesium'
export default {
  name: "CesiumViewer",
  data() {
    return {
      // 
      viewer : window.viewer,
      marks: [
        { lng: 115.838095, lat: 28.486662, height: 20, flytime: 5 },
        // { lng: 115.837852, lat: 28.486855, height: 20, flytime: 5 },
        // height:相机高度(单位米) flytime:相机两个标注点飞行时间(单位秒)
        { lng: 115.837583, lat: 28.487087, height: 20, flytime: 20 },
        { lng: 115.838048, lat: 28.487524, height: 20, flytime: 20 },
        { lng: 115.838603, lat: 28.487706, height: 20, flytime: 40 },
        { lng: 115.837568, lat: 28.489273, height: 20, flytime: 28},
        { lng: 115.836533, lat: 28.488112, height: 20, flytime: 10 },
        { lng: 115.836420, lat: 28.487923, height: 20, flytime: 5 },
      ],
      marksIndex: 1,
      pitchValue: -20,
      changeCameraTime: 5,
      flytime: 5,
      Exection: {},
      handler: {},
      activeShapePoints: [],
      floatingPoint: undefined,
      activeShape: undefined,
      drawingMode: 'line',
      isOpen:true,
    }
  },
  mounted() {
    //viewer = window.viewer
    //双击鼠标左键清除默认事件
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // this.viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
    //   url: "/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
    // }));
    this.initFly();
  },

  methods: {
     toggle() {
      this.isOpen = !this.isOpen;
    },
    goHome() {
      this.$router.push('/main');
    },
    initFly() {
      // const { viewer, marks } = this
      // // eslint-disable-next-line no-unused-vars
      // const self = this;
      // viewer.scene.camera.flyTo({
      //   destination: Cesium.Cartesian3.fromDegrees(marks[0].lng, marks[0].lat, marks[0].height),  //定位坐标点，建议使用谷歌地球坐标位置无偏差
      //   duration: 1   //定位的时间间隔
      // });
      
      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    },
    flyExtent() {
      const { viewer, marks, pitchValue } = this
      const self = this;
      // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
      const pitch = Cesium.Math.toRadians(pitchValue);
      // 时间间隔2秒钟
      this.setExtentTime(marks[this.marksIndex].flytime);
      this.Exection = function TimeExecution() {
        let preIndex = self.marksIndex - 1;
        if (self.marksIndex == 0) {
          preIndex = marks.length - 1;
        }
        //计算俯仰角
        let heading = self.bearing(marks[preIndex].lat, marks[preIndex].lng, marks[self.marksIndex].lat, marks[self.marksIndex].lng);
        heading = Cesium.Math.toRadians(heading);
        // 当前已经过去的时间，单位s
        const delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
        const originLat = self.marksIndex == 0 ? marks[marks.length - 1].lat : marks[self.marksIndex - 1].lat;
        const originLng = self.marksIndex == 0 ? marks[marks.length - 1].lng : marks[self.marksIndex - 1].lng;
        const endPosition = Cesium.Cartesian3.fromDegrees(
          (originLng + (marks[self.marksIndex].lng - originLng) / marks[self.marksIndex].flytime * delTime),
          (originLat + (marks[self.marksIndex].lat - originLat) / marks[self.marksIndex].flytime * delTime),
          marks[self.marksIndex].height
        );
        viewer.scene.camera.setView({
          destination: endPosition,
          orientation: {
            heading: heading,
            pitch: pitch,
          }
        });
        if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
          viewer.clock.onTick.removeEventListener(self.Exection);
          //有个转向的功能
          self.changeCameraHeading();
        }
      };
      viewer.clock.onTick.addEventListener(self.Exection);
    },
    // 相机原地定点转向
    changeCameraHeading() {
      const { viewer, marks, pitchValue, changeCameraTime } = this
      const self = this;
      let { marksIndex } = this

      let nextIndex = this.marksIndex + 1;
      if (marksIndex == marks.length - 1) {
        nextIndex = 0;
      }
      // 计算两点之间的方向
      const heading = this.bearing(marks[marksIndex].lat, marks[marksIndex].lng, marks[nextIndex].lat, marks[nextIndex].lng);
      // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
      const pitch = Cesium.Math.toRadians(pitchValue);
      // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
      const angle = (heading - Cesium.Math.toDegrees(viewer.camera.heading)) / changeCameraTime;
      // 时间间隔2秒钟
      this.setExtentTime(changeCameraTime);
      // 相机的当前heading
      const initialHeading = viewer.camera.heading;
      this.Exection = function TimeExecution() {
        // 当前已经过去的时间，单位s
        const delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
        const heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
        viewer.scene.camera.setView({
          orientation: {
            heading: heading,
            pitch: pitch,
          }
        });
        if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
          viewer.clock.onTick.removeEventListener(self.Exection);
          self.marksIndex = ++self.marksIndex >= marks.length ? 0 : self.marksIndex;
          if (self.marksIndex != 0) {
            self.flyExtent();
          }
        }
      };
      viewer.clock.onTick.addEventListener(self.Exection);
    },
    //设置飞行的时间到viewer的时钟里
    setExtentTime(time){
      const { viewer } = this;
      const startTime = Cesium.JulianDate.fromDate(new Date());
      const stopTime = Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate());
      viewer.clock.startTime = startTime.clone();  // 开始时间
      viewer.clock.stopTime = stopTime.clone();     // 结速时间
      viewer.clock.currentTime = startTime.clone(); // 当前时间
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式-达到终止时间后停止
      viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
    },
    /** 相机视角飞行 结束 **/
    /** 飞行时 camera的方向调整(heading) 开始 **/
    // 角度转弧度
    // toRadians(degrees) {
    //   return degrees * Math.PI / 180;
    // },
    // 弧度转角度
    toDegrees(radians) {
      return radians * 180 / Math.PI;
    },
    //计算俯仰角
    bearing(startLat : number, startLng : number, destLat : number, destLng : number) {

      startLat = Cesium.Math.toRadians(startLat);
      startLng = Cesium.Math.toRadians(startLng);
      destLat = Cesium.Math.toRadians(destLat);
      destLng = Cesium.Math.toRadians(destLng);

      let y = Math.sin(destLng - startLng) * Math.cos(destLat);
      let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
      let brng = Math.atan2(y, x);
      let brngDgr = this.toDegrees(brng);

      return (brngDgr + 360) % 360;
    },
    
    /**绘制路线 */
    drawLineRoad() {
      const { handler, viewer, activeShapePoints } = this
      const self = this;
      //鼠标左键
      handler.setInputAction(function (event) {
        var earthPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(earthPosition)) {
          if (activeShapePoints.length === 0) {
            self.floatingPoint = self.createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            var dynamicPositions = new Cesium.CallbackProperty(function () {
              return activeShapePoints;
            }, false);
            self.activeShape = self.drawShape(dynamicPositions); //绘制动态图
          }
          activeShapePoints.push(earthPosition);
          self.createPoint(earthPosition);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      //鼠标移动
      handler.setInputAction(function (event) {
        if (Cesium.defined(self.floatingPoint)) {
          var newPosition = viewer.scene.pickPosition(event.endPosition);
          if (Cesium.defined(newPosition)) {
            self.floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function () {
        self.terminateShape();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    },
    // Redraw the shape so it's not dynamic and remove the dynamic shape.
    terminateShape() {
      const { activeShapePoints, viewer ,flytime} = this
      activeShapePoints.pop(); //去除最后一个动态点
      if (activeShapePoints.length) {
        this.marks = [];
        for (const position of activeShapePoints) {
          const latitude = this.toDegrees(Cesium.Cartographic.fromCartesian(position).latitude)
          const longitude = this.toDegrees(Cesium.Cartographic.fromCartesian(position).longitude)
          this.marks.push({ lat: latitude, lng: longitude, flytime:10, height: 20 })
        }
        this.drawShape(activeShapePoints); //绘制最终图
      }
      viewer.entities.remove(this.floatingPoint); //去除动态点图形（当前鼠标点）
      viewer.entities.remove(this.activeShape); //去除动态图形
      this.floatingPoint = undefined;
      this.activeShape = undefined;
      this.activeShapePoints = [];
    },
    //绘制点
    createPoint(worldPosition) {
      var point = this.viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.WHITE,
          pixelSize: 1,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      return point;
    },
    //初始化为线
    drawShape(positionData) {
      const { drawingMode, viewer } = this
      var shape;
      if (drawingMode === 'line') {
        shape = viewer.entities.add({
          polyline: {
            positions: positionData,
            clampToGround: true,
          }
        });
      }
      return shape;
    },
    //开始飞行
    startFly() {
     const { Exection } = this;
      if (Object.keys(Exection).length > 0) {
        this.exitFly();
      }
      this.flyExtent();
    },
    //停止飞行
    stopFly() {
      this.viewer.clock.shouldAnimate = false;
    },
    //继续飞行
    continueFly() {
        this.viewer.clock.shouldAnimate = true;
    },
    //退出飞行
    exitFly() {
      const { Exection, viewer, marks, pitchValue } = this
      viewer.clock.onTick.removeEventListener(Exection);
      // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
      const pitch = Cesium.Math.toRadians(pitchValue);
      const marksIndex = 1;
      let preIndex = marksIndex - 1;
      //计算俯仰角
      let heading = this.bearing(marks[preIndex].lat, marks[preIndex].lng, marks[marksIndex].lat, marks[marksIndex].lng);
      heading = Cesium.Math.toRadians(heading);
      const endPosition = Cesium.Cartesian3.fromDegrees(
        marks[0].lng,
        marks[0].lat,
        marks[0].height
      );
      viewer.scene.camera.setView({
        destination: endPosition,
        orientation: {
          heading: heading,
          pitch: pitch,
        }
      });
    }

  },
  created() {
  }
}
</script>
<style  lang="scss" scoped >
.wrapper {
  position: relative;
  z-index: 10
}

.toggle-button {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
}

.container {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 5;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
