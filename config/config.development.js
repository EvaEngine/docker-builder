module.exports = {
  dockerBuilder: {
    rootPath: '/opt/htdocs',  //源代码根目录
    projects: {   //支持的项目
    },
    qiniu: { //Compose 文件上传
      key: '',
      secret: ''
    }
  },
  sequelize: {
    logging: false
  },
  db: {
    database: 'YourDatabase',
    replication: {
      write: {
        host: 'MySQL_Master_host',
        username: 'MySQL_Master_user',
        password: 'MySQL_Master_password'
      },
      read: [
        {
          host: 'MySQL_Slave_host',
          username: 'MySQL_Slave_user',
          password: 'MySQL_Slave_password'
        }
      ]
    }
  },
  token: {
    faker: {
      key: 'abc',
      enable: true
    }
  }
};
