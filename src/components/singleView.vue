<template>
  <div class="dm-tools">
    <div class="import-classify-layer">
      <el-button size="mini" @click="classify()" :title="tip_0"
        >加载默认单体化图层</el-button
      >
      <div class="classify-status">
        动态单体化状态：
        <el-switch
          v-model="classifyStatus"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
      </div>
    </div>
    <div class="building-collect-whole">
      <div>
        <el-button :title="tip_1" size="mini" @click="drawBoundary()"
          >楼层采集</el-button
        >
        <el-button :title="tip_2" size="mini" @click="drawVertex()"
          >顶点采集
        </el-button>
        <el-button :title="tip_3" size="mini" @click="submit()">确认</el-button>
        <el-button :title="tip_4" size="mini" @click="exportJson()"
          >导出</el-button
        >
      </div>
      <el-table
        class="collect-data-table"
        :data="tableData"
        style="width: 100%"
        height="250"
        :header-cell-style="{
          background: '#37456e',
          color: '#ffffff',
          fontFamily: 'MicrosoftYaHeiUI',
          fontSize: '14px',
          fontWeight: 900,
        }"
        :row-style="{
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'MicrosoftYaHeiUI',
          background: '#37456e',
        }"
      >
        <el-table-column type="index" width="40"> </el-table-column>
        <el-table-column prop="lon" label="X" align="center"> </el-table-column>
        <el-table-column prop="lat" label="Y" align="center"> </el-table-column>
        <el-table-column prop="height" label="H" align="center">
        </el-table-column>
      </el-table>
      <div :title="vertexHeights.toString()">
        顶点集合：{{ vertexHeights.toString() }}
      </div>
    </div>
  </div>
</template>
  <script>
import { inject } from "vue";
import ClassifyJson from "../assets/default_single.json";
const Cesium = window.Cesium;
let viewer;
let activeShapePoints = []; // 记录绘制的多边形所有的节点坐标
let activePoints = []; //记录绘制的多边形中间表示节点的entity点
let activeShape; // 记录动态图
let floatingPoint; // 记录当前鼠标点

let classifyHandler = undefined; //动态单体化专属handler处理
let selected, primitive, color, show, attribute; //动态单体化鼠标移动事件相关对象
let pickSelected, pickPrimitive, pickColor, pickShow, pickAttribute; //动态单体化鼠标点击事件相关对象
let vertexPoints = []; //记录绘制的上、下顶点entity对象

export default {
  mounted() {
    viewer = inject("viewer");
    // console.log(ClassifyJson);
    console.log(viewer);
  },
  name: "singleHome",
  data() {
    return {
      classifyStatus: false,
      tip_0:
        "加载已经提前生成好的data路径下的default_single.json文件，即动态单体化文件",
      tip_1:
        "绘制楼层区域，左键绘制，右键结束，数据在下表展示。完成后需“顶点采集”",
      tip_2: "左键绘制顶点，右键结束",
      tip_3: "将已经绘制好单体化要素提交到存储中，以备导出",
      tip_4: "将所有已经“确认”提交的数据导出为动态单体化图层，格式为JSON格式",
      tableData: [
        // {
        //   lon: "112.32332",
        //   lat: "34.33232",
        //   height: "20",
        // },
      ],
      results: [],
      vertexHeights: [],
    };
  },
  watch: {
    classifyStatus(val) {
      val ? this.classifyHandlerOn() : this.classifyHandlerOff();
    },
  },
  methods: {
    // initModel() {
    //   let tilesetModel = new Cesium.Cesium3DTileset({
    //     url: `${window.location.origin}/data/model/osgb/tileset.json`,
    //   });
    //   viewer.scene.primitives.add(tilesetModel);
    //   window.viewer.flyTo(tilesetModel);
    // },
    drawVertex() {
      let $this = this;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function (event) {
        let earthPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(earthPosition)) {
          let point = viewer.entities.add({
            position: earthPosition,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 15,
            },
          });
          let cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
          let height = cartographic.height.toFixed(2);
          $this.vertexHeights.push(Number(height));
          vertexPoints.push(point);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function (event) {
        handler.destroy();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    classify() {
      //创建一个基元对象
      console.log(ClassifyJson);
      let ldCollection = new Cesium.PrimitiveCollection();
      window.ldCollection = ldCollection;
      window.viewer.scene.primitives.add(ldCollection);

      ClassifyJson.items.map((item) => {
        for (let index = 0; index < item.vertexHeights.length; index++) {
          const up = item.vertexHeights[index + 1];
          if (up) {
            const bottom = item.vertexHeights[index];
            let classificationPrimitive = this.addPrimitive(
              item,
              bottom,
              up,
              index
            );
            ldCollection.add(classificationPrimitive);
          }
        }
      });
    },
    // 添加分类对象
    addPrimitive(item, bottom, up, index) {
      let classificationPrimitive = new Cesium.ClassificationPrimitive({
        //几何实例化允许一个 Geometry 对象位于几个不同的位置并具有唯一的颜色。例如，可以多次实例化一个 BoxGeometry ，每次使用不同的 modelMatrix 来更改其位置、旋转和比例。
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(item.coordinates)
            ),
            height: bottom, //下顶点
            extrudedHeight: up, // 上顶点
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          }),
          //顶点着色器
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              new Cesium.Color(1, 1, 1, 1e-4)
            ),
            show: new Cesium.ShowGeometryInstanceAttribute(true), //显示几何实例
          },
          id: item.id + "-" + index,
        }),

        classificationType: Cesium.ClassificationType.BOTH, //是否影响地形
      });
      return classificationPrimitive;
    },
    // 关闭动态单体化
    classifyHandlerOff() {
      if (classifyHandler) classifyHandler.destroy();
      classifyHandler = undefined;
      if (Cesium.defined(pickSelected)) {
        pickAttribute =
          pickPrimitive.getGeometryInstanceAttributes(pickSelected);
        pickAttribute.color = pickColor;
        pickAttribute.show = pickShow;
        pickPrimitive = void 0;
        pickColor = void 0;
        pickSelected = void 0;
        pickShow = void 0;
      }
    },
    // 开启动态单体化
    classifyHandlerOn() {
      if (classifyHandler) classifyHandler.destroy();
      classifyHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      function getRandomColor(alpha) {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        return [r, g, b, alpha];
      }
      //鼠标移动
      classifyHandler.setInputAction((move) => {
        let pick = viewer.scene.pick(move.endPosition);
        if (Cesium.defined(pick) && Cesium.defined(pick.id)) {
          if (selected === pick.id || pick.id === pickSelected) {
            return;
          }
          if (Cesium.defined(selected)) {
            attribute = primitive.getGeometryInstanceAttributes(selected);
            attribute.color = color;
            attribute.show = show;
            selected = void 0;
            primitive = void 0;
            color = void 0;
            show = void 0;
          }
          if (
            Cesium.defined(pick.primitive) &&
            Cesium.defined(pick.primitive.getGeometryInstanceAttributes)
          ) {
            console.log(pick.id, selected);
            selected = pick.id;
            primitive = pick.primitive; // 映射对象
            attribute = primitive.getGeometryInstanceAttributes(selected); // 对象属性
            color = attribute.color; // 颜色属性
            show = attribute.show; // 显示属性
            viewer.scene.invertClassification = true; //当为 false 时，3D Tiles 将正常渲染。当为 true 时，分类的 3D Tile 几何体将正常渲染，而未分类的 3D Tile 几何体将使用与 Scene#invertClassificationColor 相乘的颜色进行渲染。

            attribute.color = getRandomColor(128);
            attribute.show = [1];
            console.log("移动---在这里自定义鼠标移动到单体上时所触发的事件");
          }
        } else {
          if (Cesium.defined(selected)) {
            attribute = primitive.getGeometryInstanceAttributes(selected);
            attribute.color = color;
            attribute.show = show;
            selected = void 0;
            primitive = void 0;
            color = void 0;
            show = void 0;
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //鼠标点击
      classifyHandler.setInputAction((pick) => {
        let pickedObj = viewer.scene.pick(pick.position);
        if (Cesium.defined(selected)) {
          attribute = primitive.getGeometryInstanceAttributes(selected);
          attribute.color = color;
          attribute.show = show;
          selected = void 0;
          primitive = void 0;
          color = void 0;
          show = void 0;
        }
        if (Cesium.defined(pickedObj) && Cesium.defined(pickedObj.id)) {
          if (Cesium.defined(pickSelected)) {
            pickAttribute =
              pickPrimitive.getGeometryInstanceAttributes(pickSelected);
            pickAttribute.color = pickColor;
            pickAttribute.show = pickShow;
            pickPrimitive = void 0;
            pickColor = void 0;
            pickSelected = void 0;
            pickShow = void 0;
          }
          if (
            Cesium.defined(pickedObj.primitive) &&
            Cesium.defined(pickedObj.primitive.getGeometryInstanceAttributes)
          ) {
            // var entity = viewer.entities.getById(
            //   pickedObj.tileset.id + "_" + pickedObj.tile.id
            // );
            pickSelected = pickedObj.id;
            pickPrimitive = pickedObj.primitive; // 映射对象
            pickAttribute =
              pickPrimitive.getGeometryInstanceAttributes(pickSelected); // 对象属性
            pickColor = pickAttribute.color; // 颜色属性
            pickShow = pickAttribute.show; // 显示属性
            viewer.scene.invertClassification = true;
            pickAttribute.color = getRandomColor(128);
            pickAttribute.show = [1];
            function getRandomColor(alpha) {
              let r = Math.floor(Math.random() * 256);
              let g = Math.floor(Math.random() * 256);
              let b = Math.floor(Math.random() * 256);
              return [r, g, b, alpha];
            }
            var positionBUilding = pickAttribute.instancePosition;
            var entity = viewer.entities.add({
              position: positionBUilding,
              name: "Selected Building",
              description: "This is a selected building.",
            });

            //创建一个弹窗使得点击之后可以给单体化建筑添加信息
            // var overlay = document.createElement("div");
            // overlay.style.position = "absolute";
            // overlay.style.bottom = "50px";
            // overlay.style.left = "50px";
            // overlay.style.backgroundColor = "white";
            // overlay.style.padding = "10px";
            // overlay.innerHTML =
            //   "<h2>建筑体信息</h2>" +
            //   "<table>" +
            //   "<tr><td>名称:</td><td>建筑体</td></tr>" +
            //   "<tr><td>高度:</td><td>" +
            //    +
            //   "米</td></tr>" +
            //   "<tr><td>面积:</td><td>" +
            //    +
            //   "平方米</td></tr>" +
            //   "</table>";
            // if (Cesium.defined(entity)) {
            //   entity.overlay = overlay;
            // }
            // console.log("点击---在这里自定义鼠标左键点击单体时所触发的事件");
          }
        } else {
          if (Cesium.defined(pickSelected)) {
            pickAttribute =
              pickPrimitive.getGeometryInstanceAttributes(pickSelected);
            pickAttribute.color = pickColor;
            pickAttribute.show = pickShow;
            pickSelected = void 0;
            pickPrimitive = void 0;
            pickColor = void 0;
            pickShow = void 0;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //快捷键//Ctrl + Z
    keyDownStatus(bool) {
      document.onkeydown = function (event) {
        if (event.ctrlKey && window.event.keyCode == 90) {
          if (!bool) {
            return false;
          }
          //返回并删除数组最后一个元素
          activeShapePoints.pop();
          viewer.entities.remove(activePoints[activePoints.length - 1]);
          activePoints.pop();
        }
      };
    },
    drawBoundary() {
      let $this = this;
      $this.keyDownStatus(true);
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function (event) {
        let earthPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(earthPosition)) {
          let cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
          let lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
          let lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
          let height = cartographic.height.toFixed(2);
          $this.tableData.push({
            lon: lon,
            lat: lat,
            height: height,
          });
          if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            let dynamicPositions = new Cesium.CallbackProperty(function () {
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }, false);
            activeShape = drawShape(dynamicPositions); //绘制动态图
          }
          activeShapePoints.push(earthPosition);
          createPoint(earthPosition);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function (event) {
        if (Cesium.defined(floatingPoint)) {
          let newPosition = viewer.scene.pickPosition(event.endPosition);
          if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function (event) {
        terminateShape();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      function createPoint(worldPosition) {
        let point = viewer.entities.add({
          position: worldPosition,
          point: {
            color: randomColor(),
            pixelSize: 5,
            //为点添加拖动处理程序
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        // point.index = activeShapePoints.length;
        activePoints.push(point);
        return point;
      }
      function drawShape(positionData) {
        let shape = viewer.entities.add({
          polygon: {
            hierarchy: positionData,
            material: new Cesium.ColorMaterialProperty(randomColor()),
          },
        });
        return shape;
      }
      function randomColor() {
        // 生成三个随机数作为 RGB 值
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        // 创建一个新的 Cesium.Color 对象，表示生成的随机颜色
        return new Cesium.Color(r / 255, g / 255, b / 255, 1.0).withAlpha(0.5);
      }
      function terminateShape() {
        activeShapePoints.pop(); //去除最后一个动态点
        if (activeShapePoints.length) {
          drawShape(activeShapePoints); //绘制最终图
        }
        viewer.entities.remove(floatingPoint); //去除动态点图形（当前鼠标点）
        viewer.entities.remove(activeShape); //去除动态图形
        activePoints.forEach((element) => {
          viewer.entities.remove(element);
        });

        floatingPoint = undefined;
        activeShape = undefined;
        activeShapePoints = [];
        activePoints = [];
        handler.destroy();
      }
    },
    // 提交本次编辑结果到存储，以备导出使用
    submit() {
      let curData = {
        id: this.guid(),
        coordinates: [],
        vertexHeights: this.vertexHeights,
      };
      for (let index = 0; index < this.tableData.length; index++) {
        const element = this.tableData[index];
        curData.coordinates.push(Number(element.lon), Number(element.lat));
      }
      this.results.push(curData);
      // 重置
      this.tableData = [];
      this.vertexHeights = [];
    },
    //随机id
    guid() {
      return "ClassifyObject-xxxzzxxx-xxzz-zzxx-zzzxxzzz".replace(
        /[xz]/g,
        function (c) {
          let r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
    //导出为自定义标准的动态单体化JSON文件
    exportJson() {
      if (!this.results && this.results.length == 0) {
        alert("导出数据不能为空！");
        return;
      }
      let data = {
        createTime: new Date().toString(),
        items: this.results,
      };
      let filename = "default.json";
      if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
      }
      let blob = new Blob([data], { type: "text/json" }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
    },
  },
};
</script>
<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #ccc;
}
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 1);
}
.dm-tools {
  position: absolute;
  z-index: 10;
  margin: 10px;
  padding: 10px;
  background-color: #4a4848;
  border-radius: 5px;
  color: white;
  .import-classify-layer {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    .classify-status {
      display: flex;
      align-items: center;
      margin: 5px 0;
    }
  }
  .building-collect-whole {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    max-height: 300px;
    .collect-data-table {
      margin: 5px 0;
      background-color: #37456e;
      // elementUI的表格自定义样式
      ::v-deep {
        .el-table__body-wrapper {
          height: 120px !important;
        }
        //每行鼠标经过的样式
        .el-table__body tr:hover > td {
          background-color: #284b5b !important;
        }
        .el-table__body tr.current-row > td {
          background-color: #284b5b !important;
        }
        //表头右侧多余的部分
        .el-table__header th.gutter {
          background-color: #37456e;
        }
        //每一行的高度，包括表头
        .el-table__header tr,
        .el-table__header th {
          padding: 0;
          height: 35px;
        }
        .el-table__body tr,
        .el-table__body td {
          padding: 0;
          height: 30px;
        }
      }
    }
  }
}
</style>