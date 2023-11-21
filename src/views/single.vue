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
        <el-button :title="tip_1" size="mini" @click="startDraw()"
          >整幢采集</el-button
        >
        <el-button :title="tip_2" size="mini" @click="showFormDialog()"
          >输入居民信息</el-button
        >
      </div>

      <el-table
        class="collect-data-table"
        :data="coordinateFloat"
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
        <el-table-column
          prop="height"
          label="H"
          align="center"
        ></el-table-column>
      </el-table>
      <el-dialog
        title="输入采集信息"
        v-model="showDialog"
        @close="closeFormDialog"
      >
        <el-form :model="form" :rules="formRules" ref="form">
          <el-form-item label="户主姓名" prop="ownerName">
            <el-input v-model="form.ownerName"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="form.idCard"></el-input>
          </el-form-item>
          <el-form-item label="占地面积/㎡" prop="area">
            <el-input v-model="form.area"></el-input>
          </el-form-item>
          <el-form-item label="楼层" prop="floor">
            <el-select v-model="form.floor">
              <el-option label="1" value="1"></el-option>
              <el-option label="2" value="2"></el-option>
              <el-option label="3" value="3"></el-option>
              <el-option label="4" value="4"></el-option>
              <el-option label="5" value="5"></el-option>

              <!-- 添加更多楼层选项 -->
            </el-select>
          </el-form-item>
          <el-form-item label="高度" prop="height">
            <el-input v-model="form.height"></el-input>
          </el-form-item>
          <el-form-item label="电话号码" prop="phoneNumber">
            <el-input v-model="form.phoneNumber"></el-input>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <el-button @click="closeFormDialog">取消</el-button>
            <el-button type="primary" @click="submitForm">确认</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts">
import axios from "axios";
import * as Cesium from 'cesium'


// const Cesium = window.Cesium;
// let viewer;
// 世界坐标点类型， 由于WGS84维度坐标系没有实体，这里定义一下
type Coordinate = {
    lon: Number, 
    lat: Number, 
    height: Number
};

let selectedPoint = undefined; //重新绘制点
let activeShapePoints : Cesium.Cartesian3[] = []; // 记录绘制的多边形所有的节点坐标这里的坐标是笛卡尔空间直角坐标
let activePoints : Cesium.Entity[] = []; //记录绘制的多边形中间表示节点的entity点
let activeShape : Cesium.Entity | undefined; // 记录动态图，实时更新的
let floatingPoint : Cesium.Entity | undefined; // 记录当前鼠标点

let classifyHandler : Cesium.ScreenSpaceEventHandler | undefined = undefined; //动态单体化专属handler处理
let selected : Cesium.Entity | undefined;     // 已经选中的动态单体
let primitive : Cesium.GroundPrimitive  | undefined, color : object | undefined, show, attribute; //动态单体化鼠标移动事件相关对象    
let pickSelected, pickPrimitive, pickColor, pickShow, pickAttribute; //动态单体化鼠标点击事件相关对象

export default {
  mounted() {
    //viewer = window.viewer;
  },
  data() {
    return {
      classifyStatus: false,
      tip_0:
        "加载已经提前生成好的data路径下的default.json文件，即动态单体化文件",
      tip_1:
        "绘制多边形，目标是整幢建筑，左键绘制节点，右键结束，数据在下表展示。完后需点击“确认”提交",
      tip_2: "将已经绘制好单体化要素提交到存储中，以备导出",
      tip_3: "将所有已经“确认”提交的数据导出为动态单体化图层，格式为JSON格式",
      
      //采集的WGS84地理坐标集合，用于前端展示
      coordinateFloat: [],
      //查询返回的坐标
      lonlot: [],
      ss: 0,
      results: [],
      showDialog: false, // 是否显示对话框
      form: {
        ownerName: "",
        idCard: "",
        area: "",
        floor: "",
        height: "",
        phoneNumber: "",
      },
      formRules: {
        ownerName: [
          { required: true, message: "请输入户主姓名", trigger: "blur" },
        ],
        idCard: [
          { required: true, message: "请输入身份证号", trigger: "blur" },
        ],
        area: [{ required: true, message: "请输入占地面积", trigger: "blur" }],
        floor: [{ required: true, message: "请选择楼层", trigger: "change" }],
        height: [{ required: true, message: "请输入高度", trigger: "blur" }],
        phoneNumber: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    // 检测按钮是否开启，开启的话就选择打开检测或者关闭检测
    classifyStatus(val) {
      val ? this.classifyHandlerOn() : this.classifyHandlerOff();
    },
  },
  methods: {
    showFormDialog() {
      this.showDialog = true;
    },
    closeFormDialog() {
      this.showDialog = false;
      this.resetForm();
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 表单验证通过，进行提交逻辑
          // console.group(this.coordinateFloat)
          for (let index = 0; index < this.coordinateFloat.length; index++) {
            const element = this.coordinateFloat[index];
            this.results.push(Number(element.lon), Number(element.lat));
          }
          const requestData = {
            coordinateFloat: this.results,
            ownerName: this.form.ownerName,
            idCard: this.form.idCard,
            area: parseFloat(this.form.area),
            floor: parseInt(this.form.floor),
            height: parseFloat(this.form.height),
            phoneNumber: this.form.phoneNumber,
          };
          // console.group(requestData);
          //存入房屋相关信息
          axios
            .post("http://localhost:8008/addhouse", requestData)
            .then((response) => {
              // 请求成功处理
              this.coordinateFloat = [];
              this.results = [];
              window.alert("信息已存入"); // 打印响应数据
            })
            .catch((error) => {
              // 请求失败处理
              console.error(error);
            });

          this.closeFormDialog();
        }
      });
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
    classify() {
      axios
        .get("http://localhost:8008/house")
        .then((response) => {
          this.lonlot = response.data.data;
          console.group(this.lonlot);
        })
        .then(() => {
          let ldCollection = new Cesium.PrimitiveCollection();
          window.ldCollection = ldCollection;
          window.viewer.scene.primitives.add(ldCollection);
          this.lonlot.map((value) => {
            let classificationPrimitive = this.addPrimitive(value);
            // console.group(value);
            ldCollection.add(classificationPrimitive);
          });
        })
        .catch((error) => {
          console.group(error);
        });
    },
    // 添加分类对象
    addPrimitive(item) {
      const coordinateArray = JSON.parse(item.coordinate);
      // console.group(coordinateArray);
      let classificationPrimitive = new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          // 多边形对象
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy( // hierarchy层次
              Cesium.Cartesian3.fromDegreesArray(coordinateArray) // 多边形控制点的经纬度，按顺时针排列
            ),
            extrudedHeight: 1000, // extruded 压制
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          }),
          //顶点着色器属性
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              new Cesium.Color(1, 1, 1, 1e-4)
            ),
            show: new Cesium.ShowGeometryInstanceAttribute(true), //确定是否显示几何实例
          },
          id: item.houseId,
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
      var viewer = window.viewer
      if (classifyHandler) classifyHandler.destroy();
      classifyHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

      //鼠标移动
      classifyHandler.setInputAction((move) => {
        // pick是当前捕获到的entity实体，primitive图元，数据源datasource，3dtiles瓦片数据。
        let pick = viewer.scene.pick(move.endPosition);
        
        if (Cesium.defined(pick) && Cesium.defined(pick.id)) {
          // 判断是否已经选择该单体，且现在还在这个单体上，则直接返回不进行操作
          if (selected === pick.id || pick.id === pickSelected) {
            return;
          }
          // 如果之前已经选中单体，将之前选择的单体重置，取消选中状态，如果选中其他单体或者没有选中单体
          if (Cesium.defined(selected)) {
            if(primitive){
              attribute = primitive.getGeometryInstanceAttributes(selected);                                                                                      
              attribute.color = color;
              attribute.show = show;
              selected = void 0;
              primitive = void 0;
              color = void 0;
              show = void 0;
            }
          }
          // 如果之前没有选中单体，而现在选中了
          if (
            Cesium.defined(pick.primitive) &&
            Cesium.defined(pick.primitive.getGeometryInstanceAttributes)
          ) {
            selected = pick.id;
            primitive = pick.primitive; // 映射对象
            if(primitive){
              attribute = primitive.getGeometryInstanceAttributes(selected); // 对象属性
              color = attribute.color; // 颜色属性
              console.log(typeof(color))
              show = attribute.show; // 显示属性
              viewer.scene.invertClassification = true;
              attribute.color = [255, 0, 255, 128];
              attribute.show = [1];
            }
              
            console.log("移动---在这里自定义鼠标移动到单体上时所触发的事件");
          }
        } else {
          // 如果当前没有选中单体
          if (Cesium.defined(selected)) {
            console.log(selected)
            if(primitive)
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
            pickSelected = pickedObj.id;
            pickPrimitive = pickedObj.primitive; // 映射对象
            pickAttribute =
              pickPrimitive.getGeometryInstanceAttributes(pickSelected); // 对象属性
            pickColor = pickAttribute.color; // 颜色属性
            pickShow = pickAttribute.show; // 显示属性
            viewer.scene.invertClassification = true;
            pickAttribute.color = [255, 0, 0, 128];
            pickAttribute.show = [1];
            console.log("点击---在这里自定义鼠标左键点击单体时所触发的事件");
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
    keyDownStatus(bool : boolean) {
      const ss = this;
      document.onkeydown = function (event) {
        if (event.ctrlKey && event.code == "KeyZ") {
          if (!bool) {
            return false;
          }
          activeShapePoints.pop();
          viewer.entities.remove(activePoints[activePoints.length - 1]);
          activePoints.pop();
          ss.coordinateFloat.pop();
        }
      };
    },
    // 开始绘制
    startDraw() {
      let $this = this;
      $this.keyDownStatus(true);
      console.log(Cesium)
      var viewer = window.viewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      // 设置左点击事件 | 添加点到坐标集合 | 绘制几何体 | 
      handler.setInputAction(function (event) {           // 这里event.position是笛卡尔平面(Cartesian2)坐标   
        // 获取当前点击坐标（这里erathPositon的坐标是笛卡尔空间直角(Cartesian3)世界坐标）: {x : number, y : number, z : number}
        let earthPosition : Cesium.Cartesian3 = viewer.scene.pickPosition(event.position);     // 利用viewer.scene.pickPosition()方法将笛卡尔平面坐标系转化为笛卡尔空间直角坐标系 
        
        // 如果当前笛卡尔空间直角坐标具有几何模型
        if (Cesium.defined(earthPosition)) {
          // 获取WGS84弧度坐标 Cesium.Cartographic.fromCartesian()方法将笛卡尔空间直角坐标转化为WGS84弧度坐标
          let cartographic : Cesium.Cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
          // 将弧度经纬弧度转化为角度
          let lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
          let lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
          let height = cartographic.height.toFixed(2);
          // 保存这些世界坐标
          $this.coordinateFloat.push({
            lon: lon,
            lat: lat,
            height: height,
          });
          // 如果没有要绘制的点
          if (activeShapePoints.length === 0) {
            // floatingPoint是entity点的实体
            floatingPoint = createPoint(earthPosition);
            // 添加世界坐标（这里用的是弧度坐标）
            activeShapePoints.push(earthPosition);
            // 获取动态的多边形几何数据
            let dynamicPositions = new Cesium.CallbackProperty(function () {
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }, false);
            activeShape = drawShape(dynamicPositions); //绘制动态图
          }
          // 将当前点的笛卡尔空间直角坐标加到点集
          activeShapePoints.push(earthPosition);
          createPoint(earthPosition);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 鼠标移动事件
      handler.setInputAction(function (event) {
        if (Cesium.defined(floatingPoint)) {
          // 如果已经加入了点，获取当前鼠标移动最终点的笛卡尔空间直角坐标
          let newPosition = viewer.scene.pickPosition(event.endPosition);
          // 判断当前悬停点是否是模型范围
          if (Cesium.defined(newPosition)) {
            if (selectedPoint) {
              // 更新选中的点的位置
              selectedPoint.position.setValue(newPosition);
              // 更新 activeShapePoints 中选中点的位置
              let index = activePoints.indexOf(selectedPoint);
              activeShapePoints[index] = newPosition;
              // 重新绘制多边形
              let dynamicPositions = new Cesium.CallbackProperty(function () {
                return new Cesium.PolygonHierarchy(activeShapePoints);
              }, false);
              viewer.entities.remove(activeShape);
              activeShape = drawShape(dynamicPositions);
            } else {
              // 没有选中点，更新动态点的位置
              floatingPoint.position.setValue(newPosition);
              activeShapePoints.pop();
              activeShapePoints.push(newPosition);
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 鼠标右击事件
      handler.setInputAction(function (event) {
        terminateShape();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      // 添加坐标点
      function createPoint(worldPosition : Cesium.Cartesian3) {
        let point : Cesium.Entity = viewer.entities.add({
          position: worldPosition,
          point: {
            color: Cesium.Color.SKYBLUE,
            pixelSize: 5,
          },
        });
        // 这里的point是entity实体 
        activePoints.push(point);
        return point;
      }

      // 绘制图形
      function drawShape(positionData : Cesium.CallbackProperty | Cesium.Cartesian3[]) {
        let shape = viewer.entities.add({
          polygon: {
            hierarchy: positionData,
            material: new Cesium.ColorMaterialProperty(
              Cesium.Color.WHITE.withAlpha(0.7)
            ),
          },
        });
        return shape;
      }
      function terminateShape() {
        if (selectedPoint) {
          selectedPoint.point.color = Cesium.Color.SKYBLUE;
          selectedPoint = undefined;
        }
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
  },
};
</script>
<style lang="scss" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  position: relative;
  ::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }
  ::-webkit-scrollbar-thumb {
    // border-radius:2px;
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
    right: 0;
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
    .el-dialog {
      z-index: 11;
    }
  }
}
</style>