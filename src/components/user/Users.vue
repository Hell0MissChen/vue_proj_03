<template>
  <div class="test">
    <div>
      <!-- 面包屑区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区 -->
      <el-card>
        <!-- 搜索框区域 -->
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input v-model="queryInfo.query" clearable @clear="getUsersList" placeholder="请输入内容">
              <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              style="margin-left: 10px"
              @click="addDialogVisible = true"
            >添加用户</el-button>
          </el-col>
        </el-row>

        <!-- 表格区域 -->
        <el-table :data="usersList" border stripe style="width: 100%">
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="username" label="姓名" width='120px'></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <!-- 作用域插槽渲染 -->
          <el-table-column prop="mg_state" label="状态" width='100px' align="center">
            <template slot-scope="scope">
              <!-- 通过scope.row拿到当前行的数据{{scope.row}} -->
              <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200px" align="center">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="open(scope.row)"></el-button>
              <!-- 分配角色按钮 -->
              <el-tooltip effect="dark" content="设置" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </el-card>
      <!-- 添加用户的对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮区 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 内容主体区 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮区 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的正则表达式
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("邮箱不能为空"));
      }
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      if (regEmail.test(value)) {
        callback();
      } else {
        callback(new Error("错误的邮箱地址"));
      }
    };

    //验证手机号的正则表达式
    var checkMobile = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("手机号不能为空"));
      }
      const regmobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
      if (regmobile.test(value)) {
        callback();
      } else {
        callback(new Error("错误的手机号"));
      }
    };

    return {
      queryInfo: {
        query: "",
        //当前的页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 2
      },
      //用户数据集合
      usersList: [],
      //总记录条数
      total: 0,
      //控制增加对话框的显示
      addDialogVisible: false,
      //控制修改对话框的显示
      editDialogVisible: false,
      //添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      editForm: {},
      //添加用户表单规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 12, message: "长度在 3 到 12 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 12, message: "长度在 3 到 12 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUsersList();
  },
  methods: {
    //渲染用户列表
    async getUsersList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        this.$message({
          message: res.meta.msg,
          type: "error",
          duration: 1500
        });
      } else {
        this.usersList = res.data.users;
        this.total = res.data.total;
      }
      // console.log(res);
    },
    //监听pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUsersList();
    },
    //
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUsersList();
    },
    //监听状态改变
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        this.$message({
          message: "修改用户状态失败",
          type: "error",
          duration: 1000
        });
      } else {
        this.$message({
          message: "修改用户状态成功",
          type: "success",
          duration: 1000
        });
      }
    },
    //监听添加用户对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        //可以发起添加用户请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          this.$message({
            message: "添加用户失败",
            type: "error",
            duration: 1500
          });
        } else {
          this.$message({
            message: "添加用户成功",
            type: "success",
            duration: 1500
          });
          //隐藏对话框
          this.addDialogVisible = false;
          //刷新用户列表
          this.getUsersList();
        }
      });
    },
    //编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.Error("查询用户信息失败！");
      } else {
        this.editForm = res.data;
        this.editDialogVisible = true;
      }
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //发起修改请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status !== 200) {
          return this.$message.Error("更新用户信息失败！");
        } else {
          //隐藏对话框
          this.editDialogVisible = false;
          //刷新用户列表
          this.getUsersList();
          //提示修改成功
          this.$message({
            message: "添加用户成功",
            type: "success",
            duration: 1500
          });
        }
      });
    },
    //弹出确认消息框
    async open(mes) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除" + mes.username + "的数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //如果用户确定删除，则返回confirm
      //如果用户取消删除，则返回cancel
      if (confirmResult !== 'confirm') {
        return this.$message({
          type: "info",
          message: "已取消删除"
        });
      }
      //发出请求
      const { data: res } = await this.$http.delete("users/" + mes.id);
      if (res.meta.status !== 200) {
        this.$message({
          message: "删除失败",
          type: "error",
          duration: 1500
        });
      } else {
        //刷新用户列表
        this.getUsersList();
        this.$message({
          type: "success",
          message: "删除成功!"
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>