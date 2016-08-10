module.exports = {
  sequelize: {
    logging: false
  },
  db: {
    database: 'circle_test',
    replication: {
      write: {
        host: 'localhost',
        username: 'ubuntu',
        password: ''
      },
      read: [
        {
          host: 'localhost',
          username: 'ubuntu',
          password: ''
        }
      ]
    }
  },
  token: {
    faker: {
      enable: true
    }
  }
};
