import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import users from '../components/Users'
import oneByTwo from '../components/1-2'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: users },
      { path: '/1-2', component: oneByTwo }
    ]
  },

]

const router = new VueRouter({
  routes
})

//为路由对象，添加beforeEach 导航守卫
router.beforeEach((to, from, next) =>{
//to 将要访问的路径
//from 代表从哪个路径跳转而来
//next 是一个函数，表示放行
//   next() 放行   next('/login') 强制跳转到login
if(to.path === '/login') return next();
//获取token 
const tokenStr = window.sessionStorage.getItem('token');
if(!tokenStr) return next('/login')
next();
})

export default router
