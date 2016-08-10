module.exports = {
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
      title: 'EvaSkeleton API',
      description: 'EvaSkeleton API',
      version: '1.0'
    },
    host: 'localhost:3000',
    basePath: '/v1',
    schemes: [
      'http'
    ]
  }
};
