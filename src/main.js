import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入axios包
import axios from 'axios'
//配置请求根路径
axios.defaults.baseURL = `http://127.0.0.1:8888/api/private/v1/`
axios.interceptors.request.use(config =>{
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
//挂载到Vue原型对象(全局挂载)
Vue.prototype.$http = axios;

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
