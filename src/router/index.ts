import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
const history = createWebHashHistory();
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/Main",
  },
  {
    path: "/Main",
    component: () => import("../views/Main.vue"),
    children:[
      {
        path:'/flood',
        name:'flood',
        component:()=>import('../views/flood.vue')
      },
      {
        path: "/singleHouse",
        name: "singleHouse",
        component: () => import("../views/singleHouse.vue"),
      },
      {
          path:"/measure",
          name:"measureManage",
          component: ()=>import("../views/measureManage.vue"),
      },
      // {
      //     path:"/flood",
      //     name:"floodwater",
      //     component: ()=>import("../views/flood.vue"),
      // },
      //   {
      //     path:"/player",
      //     name:"player",
      //     component: ()=>import("../views/player.vue"),
      // },
    {
          path:"/single",
          name:"single",
          component: ()=>import("../views/single.vue"),
      },
      {
          path:"/mark",
          name:"mark",
          component: ()=>import("../views/MilitaryPlottingTools.vue"),
      },
    {
          path:"/viewershe",
          name:"viewershe",
          component: ()=>import("../views/viewershed.vue"),
      },
      {
          path:"/viewfly",
          name:"viewfly",
          component: ()=>import("../views/viewfly.vue"),
      },

    ]
  },
  
];

const router = createRouter({
  history,
  routes,
});
export default router;