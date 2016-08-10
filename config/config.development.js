module.exports = {
  sequelize: {
    logging: false
  },
  redis: {
    host: 'evaskeleton_redis',
    port: 6379
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
