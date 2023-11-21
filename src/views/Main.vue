<template>
    <!--智慧乡村管理系统的整体界面 “背景颜色及大小设置”-->
  <div class="System_Background">
    <!--智慧乡村管理系统的界面的 “布局设置”-->
    
      <el-container>
        <!--设置界面边框装饰五-->
        
        <!--智慧乡村管理系统的界面的 “左侧菜单栏” , 将其置于左侧布局-->
        <el-aside class="Left_Bar">
          <!--智慧乡村管理系统的界面的 “左侧菜单栏”的配置，设置动态路由-->
          <dv-decoration-9
            style="width: 110px; height: 110px"
            class="decoration_17"
            ><el-text class="mx-1" type="success" tag="b"
              >智慧校园</el-text
            ></dv-decoration-9
          >
          <el-menu
            router
            active-text-color="#ffd04b"
            background-color="#545c64"
            class="Left_Bar_Menu"
            default-active="1"
            text-color="#fff"
          >
            <!--信息查询功能集合-->
            <el-menu-item index="" class="menuItem">
              <dv-border-box-2>信息查询</dv-border-box-2>
            </el-menu-item>

            <!--“二级子菜单”（用户交互类功能）-->
            <el-menu-item index="" id="button_2_1" class="menuItem"
              ><dv-border-box-2>撤销弹窗</dv-border-box-2></el-menu-item
            >
            <el-menu-item index="single" id="button_2_2" class="menuItem"
              ><dv-border-box-2>建筑分割</dv-border-box-2></el-menu-item
            >
            <el-menu-item index="measure" id="button_2_3" class="menuItem"
              ><dv-border-box-2>量测</dv-border-box-2></el-menu-item
            >
            <el-menu-item index="mark" id="button_2_3" class="menuItem"
              ><dv-border-box-2>标绘</dv-border-box-2></el-menu-item
            >

            <el-menu-item index="viewfly" id="button_2_4" class="menuItem"
              ><dv-border-box-2>视角环游</dv-border-box-2></el-menu-item
            >

            <!--“二级子菜单”（环境监测类功能）-->
            <!-- <el-menu-item index="3-1" id="button_3_1"><el-icon>
              </el-icon>显示路网</el-menu-item> -->
            <el-menu-item index="flood" class="menuItem"
              ><dv-border-box-2>淹没分析</dv-border-box-2>
              </el-menu-item
            >
            <!-- <el-menu-item index="3-3"><el-icon>
               
              </el-icon>视频监控</el-menu-item> -->
            <el-menu-item index="viewershe" class="menuItem"
              ><dv-border-box-2>可视域分析</dv-border-box-2></el-menu-item
            >
          </el-menu>

          <div class="Time_Tempreture"></div>
        </el-aside>

        <el-container>
          <!--设置界面边框样式-->
          <dv-border-box-11 class="box-border_1" title="数字孪生 交互赋能">
            
            <!--设置界面边框装饰一（标题）-->
                     
            
            <!-- 视频融合按钮
            <div id="btn" style="position: relative; padding: 5px;" class="videoshed_button"><button
                onclick="create()">创建</button>
              <button onclick="destroy()">删除</button>
            </div> -->

            <el-main>
              <!--设置界面边框装饰：时间显示-->
              <div class="top" > 

                <dv-decoration-3
                  style="width: 20%; height: 30px; float: left;"
                  class="decoration_7"
                />
                <dv-decoration-3
                  style="width: 20%; height: 30px; float: left;"
                  class="decoration_7"
                />
                
                <div
                  class="timeShow"
                >2023/11/11 22:28</div>

                <div
                  class="weatherShow"
                  
                >天气:小雨</div>

                <div class="campusShow">
                    南昌大学青山湖校区
                </div>
              </div>
              
              
              <div class="parentContainer">
                <!--设置界面边框装饰二及对应动画播放速度-->
                <dv-decoration-2
                  style="width: 98%; height: 5px"
                  class="decoration_2"
                />
                <dv-decoration-2
                  style="width: 98%; height: 5px"
                  class="decoration_3"
                />
                <dv-decoration-2
                  :reverse="true"
                  style="width: 5px; height: 90%"
                  class="decoration_4"
                />
                <dv-decoration-2
                  :reverse="true"
                  style="width: 5px; height: 90%"
                  class="decoration_5"
                />

                <!--Cesium容器-->
                <div id = "cesiumContainer">
                  <router-view />
                  <!--element-plus “固钉” 组件-->
                  
                </div>

                <!--设置界面边框装饰四-->
                <div v-for="n in 5">
                    <dv-decoration-6
                      style="width: 20%; height: 24px; float: left;"
                      class="decoration_12"
                    />
                  </div>

                <!--乡镇风采-->
                <div class="village_view">
                  <dv-border-box-8>
                    <!--富山乡店前村介绍-->
                    <div class="villige_pics">
                      <!--富山乡店前村图片-->
                      <img src="../assets/乡村风景三.png" />
                    </div>
                    <div class="introduction_village">
                      <marquee direction="down" scrolldelay="0.5">
                        <p class="text_village">
                          店前村是江西省南昌市新建区溪霞镇下辖村。
                          2020年11月20日，获评第六批全国文明村镇。2021年1月11日，入选第二批江西省乡村旅游重点村。
                          2021年11月，被民政部办公厅确认为“全国村级议事协商创新实验试点单位”。
                        </p>
                      </marquee>
                    </div>
                  </dv-border-box-8>
                </div>

                <!--乡镇数据-->
                <div class="village_stastics">
                  <dv-border-box-8>
                    <div class="text_satics">
                    </div>
                  </dv-border-box-8>
                </div>
               <seach></seach>
                <!-- 界面输入框 -->
                <!-- <div class="Input_Box">
                    <el-input
                      v-model="input"
                      placeholder="请输入信息 ..."
                      type="text"
                      id="input_information"
                    >
                      <template #prepend>
                        <el-radio-group v-model="radio">
                          <el-radio-button label="户主姓名" id="host_name" />
                          <el-radio-button label="房屋ID" id="building_id" />
                        </el-radio-group>
                      </template>
                      <template #append>
                        <el-button :icon="Search" id="send_button" />
                      </template>
                    </el-input>
                
                </div> -->
               
              </div>
             
            </el-main> 
           
          </dv-border-box-11>
        </el-container>
      </el-container>
    
  </div>
</template>

<script setup lang="ts"> 
import * as Cesium from 'cesium'
import {campusMapAddress} from '../config/index'
import {onMounted} from 'vue'

window.Cesium = Cesium

onMounted(()=>{
  let key : string = 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNWE4YzBjYS02Y2I1LTRjODgtOWQ3ZC01NjZiNjRhZDNlYTEiLCJpZCI6MTY1MTE1LCJpYXQiOjE2OTQwOTU4ODd9.cD1iU-n3CRQE5aYZQKne3BN_4SGY0luHidpAjcs5sEI"
  Cesium.Ion.defaultAccessToken = key;
  const viewer = new Cesium.Viewer('cesiumContainer', {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        timeline: false,
        navigationHelpButton: true,
        navigationInstructionsInitiallyVisible: true,
        selectionIndicator: false,
        //加载地形数据（这里同样需要提前在个人中心点击引入资源）
        terrainProvider: new Cesium.CesiumTerrainProvider({
            url:Cesium.IonResource.fromAssetId(1),
            requestVertexNormals:true,
            requestWaterMask:true
        })
        //开启请求的渲染模式
        // requestRenderMode : true
  });

  // 去除底部版权信息
  viewer._cesiumWidget._creditContainer.style.display = "none";


  // 加载南昌大学3d瓦片数据
  let tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: campusMapAddress
  }));

  window.viewer = viewer

  // 视角移动到南昌大学模型处
  viewer.zoomTo(tileset);

  //尽可能完善3dtiles模型内损坏或缺失的部分，补充水域
      //定义 “待补充水域的经纬度坐标组”
      var water_arr1 = [
        115.93431, 28.68805, 115.93398, 28.68795, 115.93396, 28.68792, 115.93408, 28.68784, 
        115.93415,28.68783, 115.93414, 28.68779, 115.93408, 28.68777, 115.93403, 28.68774, 
        115.93404, 28.68734,115.93406, 28.68729, 115.93411, 28.68727, 115.93416, 28.68726, 
        115.93421, 28.68727, 115.93428, 28.68730, 115.93430, 28.68738, 115.93431, 28.68737,
        115.93430, 28.68779, 115.93423, 28.68777, 115.93422, 28.68783, 115.93430, 28.68790,
      ];
      var water_arr2 = [
        115.837794, 28.489368, 115.837854, 28.489396, 115.837884, 28.489382,
        115.837887, 28.489376, 115.83789, 28.489368, 115.838837, 28.487882,
        115.838839, 28.487875, 115.83884, 28.487868, 115.838835, 28.487855,
        115.838815, 28.487841, 115.838794, 28.487833, 115.838781, 28.487824,
        115.83877, 28.487823, 115.838752, 28.48783, 115.838747, 28.487838,
        115.837795, 28.489337, 115.837792, 28.489344, 115.837794, 28.489364,
      ];
      var water_arr3 = [
        115.836086, 28.488452, 115.836092, 28.488463, 115.836118, 28.488468,
        115.836128, 28.488473, 115.83613, 28.488477, 115.836144, 28.488478,
        115.836178, 28.48847, 115.836214, 28.48844, 115.83622, 28.488437,
        115.836225, 28.488437, 115.836243, 28.488432, 115.836256, 28.488431,
        115.836276, 28.488429, 115.836296, 28.488433, 115.836319, 28.488435,
        115.836321, 28.488428, 115.836297, 28.488408, 115.836281, 28.488397,
        115.836269, 28.488387, 115.836224, 28.48836, 115.836191, 28.488349,
        115.836165, 28.488346, 115.836144, 28.488362, 115.836128, 28.488382,
        115.836106, 28.488404, 115.836091, 28.488433,
      ];
      function add_waters(
        water_location,
        water_bottom_height,
        water_top_height
      ) {
        //设置水域颜色
        let cesiumColor =
          Cesium.Color.fromCssColorString("#00FFFF").withAlpha(0.5);

        //创建 geometry 及 geometryInstance
        const instance_water = new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(water_location)
            ),
            extrudedHeight: water_top_height,
            height: water_bottom_height,
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          }),
        });
        //创建 material
        var material_water = new Cesium.Material({
          fabric: {
            type: "Water",
            uniforms: {
              baseWaterColor: cesiumColor,
              normalMap: "./src/assets/waterNormals.jpg",
              frequency: 1000,
              animationSpeed: 0.8,
              amplitude: 10,
              specularIntensity: 10,
            },
          },
        });
        //创建appearance
        var appearance_water = new Cesium.MaterialAppearance({
          material: material_water,
        });

        //创建primitive
        var water = new Cesium.Primitive({
          geometryInstances: instance_water,
          appearance: appearance_water,
        });

        viewer.scene.primitives.add(water);
      }
      add_waters(water_arr1, 2, 7.0);
      add_waters(water_arr2, 2, 6.7);
      add_waters(water_arr3, 2, 6.7);

  
  

  

  


  
  

  

  // 处理瓦片信息并加入地图
  
  
})



</script>

<style scoped>
.timeShow {
  float: right;
  font-weight: bolder;
  font-size: 18px;
  width: 15%;
  text-align: center;
}
.weatherShow{
  font-weight: bolder; 
  font-size: 18px; 
  width: 10%; 
  float: right;
  text-align: center;
}

.campusShow{
  font-weight: bolder; 
  font-size: 18px; 
  width: 17%; 
  float: right;
  text-align: center;
  color: aqua;
}

.menuItem{
  text-align: center;
  font-size: 18px;
  font-family: "宋体";
  color: aqua;
  margin-top: 14px;
}

/*智慧乡村管理系统的界面的 “背景颜色及大小设置” */
.System_Background {
  
  height: 120vh;
  background-color: #545c64;
}

.top{
  margin-top: 45px;
}

/*智慧乡村管理系统的界面的 “左侧菜单栏” 的样式设置*/
.Left_Bar {
  margin-top: 15px;
  width: 10%;
  height: auto;
}

.decoration_17 {
  margin: 0 auto;
  z-index: 100;
}

/*界面边框的样式设置*/
.box-border_1 {
  margin-left: 0px;
  margin-top: 2px;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

/*修改ceisum界面样式*/
#cesiumContainer {
  overflow-x: hidden;
  width: 100%;
  height: 90%;
  margin: 0 auto;
}

.decoration_2 {
  position: absolute;
  left: 19px;
  top: 52px;
}

.decoration_3 {
  position: absolute;
  left: 16px;
  bottom: 24px;
}

.decoration_4 {
  position: absolute;
  left: 15px;
  top: 59px;
}

.decoration_5 {
  position: absolute;
  right: 15px;
  top: 59px;
}

/*智慧乡村管理系统的界面的 “乡村风景展示” */
.el-carousel__item:nth-child(2n) {
  height: 140px;
  top: 10px;
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  height: 140px;
  top: 10px;
  background-color: #d3dce6;
}

.village_view {
  position: absolute;
  top: 65px;
  left: 25px;
  height: 250px;
  width: 280px;
  background-color: rgba(103, 150, 180, 0.7);
}

.villige_pics {
  position: absolute;
  height: 50px;
  width: 260px;
  top: 9px;
  left: 20px;
}

.introduction_village {
  position: absolute;
  top: 160px;
  left: 13px;
  width: 260px;
  height: 70px;
}

.text_village {
  font-size: 2px;
  font-family: "微软雅黑";
  color: aliceblue;
}

/*智慧乡村管理系统的界面的 “乡村用地展示及乡村人员成分展示” */
.village_stastics {
  position: absolute;
  top: 320px;
  left: 25px;
  height: 150px;
  width: 280px;
  background-color: rgba(103, 150, 180, 0.7);
}

.text_satics {
  position: relative;
  top: 3px;
  left: 13px;
  width: 260px;
  font-size: 2px;
  font-family: "微软雅黑";
  color: aliceblue;
}

/*智慧乡村管理系统的界面的 “输入面板” 的样式设置*/
.Input_Box {
  position: absolute;
  bottom: 80px;
  left: 814px;
  height: 30px;
  width: 40%;
}

.videoshed_button {
  position: absolute;
  left: 20px;
}
</style>