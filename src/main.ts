import { createApp } from 'vue';
import App from './App.vue';
import router from "./router";
import ElementPlus from 'element-plus';
import DataV from '@kjgl77/datav-vue3';
import axios from 'axios';
import 'element-plus/dist/index.css';


const app =  createApp(App);
app.use(router);
app.use(ElementPlus);
app.use(DataV)
//配置全局axios
axios.defaults.baseURL = ""
app.mount('#app');

