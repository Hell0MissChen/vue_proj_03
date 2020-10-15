<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="top-left">
        <span>电商管理系统</span>
      </div>
      <div>
        <span>你好，{{username}}</span>
        <el-button type="info" @click="logout">注销</el-button>
      </div>
    </el-header>
    <!-- 主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 收放按钮 -->
        <div class="toggle-button" @click="toogleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#E95A92"
          :collapse="isCollapse"
          :collapse-transition="false"
          :unique-opened="true"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
      //
      menulist: [],
      iconsObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        102: "iconfont icon-danju",
        101: "iconfont icon-shangpin",
        145: "iconfont icon-baobiao"
      },
      //被激活的链接地址
      activePath: "",
      username: window.sessionStorage.getItem("username")
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    //注销功能
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
      this.$message({
        duration: 1500,
        message: "注销成功"
      });
    },
    //保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
    },
    //点击按钮，切换菜单的折叠和展开
    toogleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //获取所有的请求
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status != 200) {
        this.$message({
          message: res.meta.msg,
          type: "error",
          duration: 1500
        });
      } else {
        //获取所有菜单
        this.menulist = res.data;
      }
      // console.log(res);
    }
  }
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: rgb(184, 184, 184);
}

.home-container {
  height: 100%;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em; //文字之间间距0.2em
  cursor: pointer; //鼠标移入变成小手
}

.iconfont {
  padding: 10px;
}
</style>