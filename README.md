# EvaCD - Continuous Delivery for EvaEngine

基于Docker/Docker-Compose/EvaEngine的持续交付工具, 主要完成单元测试结束到生产环境部署的流程:

- 从项目代码构建Docker镜像
- Push镜像到Docker registry(目前为阿里云)
- 生成docker-compose yaml配置
- 上传docker-compose 配置到七牛
- 构建过程提供实时Log查询接口

工作流:

![flow](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=TG9jYWwtPkNJOiBnaXQgdGFnIC1hIHYxLjAKQ0ktPkJ1aWxkZXIgQVBJOiBHRVQgL3YxL2J1aWxkL3Byb2plY3QvdjEKAB8HACUKUXVldWU6IGNyZWF0ZSB0YXNrIAAdCAAWBgBQCldvcmtlcjogAFAFIGltYWdlcwAjCQAXBi0-RG9ja2VyIFJlZ2lzdHJ5OiBwdXNoABUYQ0ROOiB1cGxvYWQgY29tcG9zZS55bWwKQ0ROLT5Qcm9kdWN0aW9uOiBkb3duABURAFwPACIQY2tlci0ATwcgdXA&s=modern-blue)

[link](https://www.websequencediagrams.com/?lz=TG9jYWwtPkNJOiBnaXQgdGFnIC1hIHYxLjAKQ0ktPkJ1aWxkZXIgQVBJOiBHRVQgL3YxL2J1aWxkL3Byb2plY3QvdjEKAB8HACUKUXVldWU6IGNyZWF0ZSB0YXNrIAAdCAAWBgBQCldvcmtlcjogAFAFIGltYWdlcwAjCQAXBi0-RG9ja2VyIFJlZ2lzdHJ5OiBwdXNoABUYQ0ROOiB1cGxvYWQgY29tcG9zZS55bWwKQ0ROLT5Qcm9kdWN0aW9uOiBkb3duABURAFwPACIQY2tlci0ATwcgdXA&s=modern-blue)

## Setting up

全局依赖:

- Git
- Redis
- Docker
- Docker-Compose

### 项目安装

假设所有项目位于`/opt/htdocs`目录

*1*. 获得本项目代码

```
cd /opt/htdocs
git clone git@github.com:EvaEngine/docker-builder.git
```

*2*. 安装项目依赖

```
cd docker-builder
make install
```

*3*. Clone要构建项目代码, 假设要构建项目为`EvaEngine/EvaSkeleton.js`, 请确保git有权限访问要构建项目

```
cd /opt/htdocs
git clone git@github.com:EvaEngine/EvaSkeleton.js.git
```

*4*. 编辑`config/config.local.production.js`, 将编译项目加入配置

``` js
module.exports = {
  dockerBuilder: {
    rootPath: '/opt/htdocs',  //源代码根目录
    composeSite: 'http://compose.evaegine.com', //存放compose文件的url
    projects: {   //支持编译的项目
      eva_skeleton: {
        path: 'EvaSkeleton.js',  //项目路径, 相对于根目录, 如果以斜线开头则为绝对路径
        allowNoTag: false //是否允许构建非Tag版本
      }
    },
    qiniu: { //七牛文件上传配置
      bucket: 'XXX',
      key: 'XXX',
      secret: 'XXX'
    }
  }
};
```

*5*. Web API启动:

```
npm start
```

*6*. Worker启动:

```
npm run worker
```


*7*. 登录Docker Registry

```
sudo docker login --username=XXX registry-internal.cn-hangzhou.aliyuncs.com
```

*8*. 在Docker Registry创建初始镜像

阿里云中在容器服务内选择创建镜像仓库, 镜像名与项目内镜像名一致, 仓库类型选择私有, 代码源选择本地仓库

*9*. 开始构建

假设构建EvaSkeleton.js项目的v1.0

访问`/v1/build/eva_skeleton/v1.0`, 会开始项目的构建过程, 同一项目同一版本只能有一个Worker对其进行构建

## 构建约定

所有微服务项目需要有自我构建的能力,本项目仅做辅助与调度

### 目录结构

被构建项目必须包含以下结构:

```
.
├── Makefile
├── compose/    存放compose yaml
```

### 构建指令

被构建项目必须包含以下指令:

- `make sync-code` 同步所有分支代码
- `make docker-build` 安装项目依赖, 并将项目构建为Docker镜像
- `make docker-ship` 将项目Docker镜像推送到Docker-Registry, 并在`compose/`生成compose配置文件
