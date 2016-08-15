import { EvaEngine, DI, wrapper, exceptions } from 'evaengine';

const router = EvaEngine.createRouter();

//@formatter:off
/**
 @swagger
 Builder:
   properties:
     project:
       type: string
       description: 项目名称
     version:
       type: string
       description: 版本号
     status:
       type: string
       description: 构建状态
     createdAt:
       type: string
       description: 创建时间
     startedAt:
       type: string
       description: 构建开始时间
     finishedAt:
       type: string
       description: 构建结束时间
 @swagger
 /build/{project}/{version}:
   get:
     summary: 构建一个项目
     tags:
       - Builder
     parameters:
       - name: project
         in: path
         description: 项目名
         required: true
         type: string
       - name: version
         in: path
         description: 版本号
         required: true
         type: string
     responses:
       200:
         schema:
           type: object
           $ref: '#/definitions/Builder'
 @throws {UnauthorizedException}  Permission not allowed
 */
//@formatter:on
router.get('/build/:project/:version', wrapper(async(req, res) => {
  const { project, version } = req.params;
  const config = DI.get('config').get('dockerBuilder');
  if (!Object.keys(config.projects).includes(project)) {
    throw new exceptions.ResourceNotFoundException('Request project not found');
  }

  const projectInfo = config.projects[project];
  const cwd = projectInfo.path.startsWith('/') ? projectInfo.path : [config.rootPath, projectInfo.path].join('/');

  const cache = DI.get('cache');
  const cacheKey = [project, version].join(':');
  const newBuilder = {
    project,
    version,
    cwd,
    status: 'pending',
    buildCount: 0,
    createdAt: new Date(),
    startedAt: null,
    finishedAt: null,
    updatedAt: new Date(),
    logUrl: '',
    buildCommandDev: `babel-node src/cli.js build:docker --key=${cacheKey}`,
    buildCommand: `NODE_ENV=production node build/cli.js build:docker --key=${cacheKey}`,
  };
  let builder = await cache.namespace('docker').get(cacheKey);

  if (!builder) {
    builder = newBuilder;
  } else {
    if (['failed'].includes(builder.status)) {
      builder.status = 'pending';
      builder.updatedAt = new Date();
    }
  }
  await cache.namespace('docker').set(cacheKey, builder);
  const compose = {
    test: `${config.composeSite}/${project}/${version}/docker-compose.yml`,
    production: `${config.composeSite}/${project}/${version}/docker-compose.production.yml`,
  };
  const run = {};
  Object.entries(compose).forEach(([key, value]) => {
    run[key] = `curl -s ${value} > docker-compose.yml && docker-compose up -d --no-build`;
  });

  res.json(Object.assign(builder, {
    compose,
    run
  }));
}));

// router.get('/hello/world', wrapper(async(req, res) => {
//   var tail = spawn("tail", ["-f", '/tmp/mysqld_query.log']);
//   tail.stdout.pipe(res);
//   onFinished(res, function (err, res) {
//     console.log(111111111111111)
//     tail.kill();
//   })
// }));

module.exports = router;
