<!--
 * @Author: xyb 1467931050@qq.com
 * @Date: 2023-06-04 15:45:24
 * @LastEditors: xyb 1467931050@qq.com
 * @LastEditTime: 2023-06-05 12:49:23
 * @FilePath: \vite-vue3-ts-cesium\src\views\search.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%A
-->
<template>
  <div>
    <div class="mt-4">
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
          <el-button type="success" :icon="Check" circle />
          <el-button type="Search" id="send_button" @click="handleClick()" />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const Cesium = window.Cesium;
let viewer;
export default {
  data() {
    return {
      input: "",
      radio: "host_name",
      searchInfo: "",
    };
  },
  methods: {
    handleClick() {
      let vs = this;
      let inputValue = vs.input.trim();
      console.group(inputValue);
      if (vs.radio === "户主姓名") {
        vs.searchByHostName(inputValue);
      } else if (vs.radio === "房屋ID") {
        vs.searchByBuildingId(inputValue);
      }
    },
    searchByHostName(value) {
      console.group(value);
      axios
        .post(
          "http://localhost:8008/SeachByOwnerName",
          encodeURIComponent(value),
          { headers: { "Content-Type": "text/plain" } }
        )
        .then((Response) => {
          this.searchInfo = Response.data.data;
        })
        .then(() => {
          viewer = window.viewer;
          const coordinateArray = JSON.parse(this.searchInfo.coordinate);
          var destination_point = Cesium.Cartesian3.fromDegrees(
            coordinateArray[0],
            coordinateArray[1],
            65
          );
          viewer.camera.flyTo({ destination: destination_point });
        })
        .catch((Error) => {
          console.error(Error);
        });
    },
    searchByBuildingId(value) {
      axios
        .post(
          "http://localhost:8008/SeachByHouseId",
          encodeURIComponent(value),
          { headers: { "Content-Type": "text/plain" } }
        )
        .then((Response) => {
          this.searchInfo = Response.data.data;
        })
        .then(() => {
          viewer = window.viewer;
          const coordinateArray = JSON.parse(this.searchInfo.coordinate);
          var destination_point = Cesium.Cartesian3.fromDegrees(
            coordinateArray[0],
            coordinateArray[1],
            65
          );
          viewer.camera.flyTo({ destination: destination_point });
        })
        .catch((Error) => {
          console.error(Error);
        });
    },
  },
};
</script>

<style scoped>
.Input_Box {
  position: absolute;
  bottom: 80px;
  left: 814px;
  height: 30px;
  width: 40%;
}
</style>
