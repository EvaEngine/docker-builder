module.exports = {
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
  }
};
