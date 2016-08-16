module.exports = {
  dockerBuilder: {
    rootPath: '/opt/htdocs',  //源代码根目录
    composeSite: '',  //docker-compose保存网站
    projects: {   //支持的项目
      //项目示例
      // pdf: {
      //   path: '',  //项目路径, 相对于根目录, 如果以斜线开头则为绝对路径
      //   allowNoTag: false //是否允许构建非Tag版本
      // }
    },
    qiniu: { //Compose 文件上传
      bucket: '',
      key: '',
      secret: ''
    }
  },
  sequelize: {
    logging: true
  },
  logger: {
    file: `${__dirname}/../logs/application.log`
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  db: {
    dialect: 'mysql',
    port: 3306,
    database: '',
    dialectOptions: {
      multipleStatements: true,
      timeout: 3
    },
    replication: {
      write: {
        host: '',
        username: '',
        password: '',
        pool: {}
      },
      read: [
        /*
         {
         host: '',
         username: '',
         password: '',
         pool: {}
         }
         */
      ]
    }
  },
  session: {
    cookie: {
      path: '/',
      httpOnly: false,
      secure: false,
      maxAge: 3600 * 1000
    },
    store: null,
    secret: 'your_secret',
    resave: true,
    saveUninitialized: true
  },
  token: {
    prefix: 'evaskeleton',
    secret: 'your_secret',
    faker: {
      enable: false,
      key: 'abc',
      uid: 1
    }
  },
  swagger: {
    info: {
      title: 'Docker builder API',
      description: 'Docker builder API',
      version: '1.0'
    },
    host: 'localhost:3000',
    basePath: '/v1',
    schemes: [
      'http'
    ]
  }
};
