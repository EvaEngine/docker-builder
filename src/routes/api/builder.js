import { EvaEngine, DI, wrapper, exceptions } from 'evaengine';
import kue from 'kue';
import { spawn } from 'child-process-promise';
import onFinished from 'on-finished';

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
    logUrl: req.protocol + '://' + req.get('host') + `/v1/stats/${project}/${version}`,
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
  const compose = {};
  const run = {};
  const upgrade = {};
  const proxy = 'docker run -p 443:443  -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --net nginx-proxy --rm --name nginx-proxy -t jwilder/nginx-proxy';
  if (builder.status === 'finished') {
  compose.dev = `${config.composeSite}/${project}/${version}/dev/docker-compose.yml`;
    compose.test = `${config.composeSite}/${project}/${version}/test/docker-compose.yml`;
    compose.production = `${config.composeSite}/${project}/${version}/production/docker-compose.yml`;
    Object.entries(compose).forEach(([key, value]) => {
      const path = [project, version, key].join('/');
      const file = [path, 'docker-compose.yml'].join('/');
      if (key === 'dev') {
        run.dev = `curl -s ${value} -o docker-compose.latest.dev.yml && make docker-dev`;
        //Demo will remove volumes mount
        run.dev_demo = `curl -s ${value} | sed -E "s/ +volumes://g" | sed -E "s/ +- \.:.+//g" > docker-compose.yml && export MACHINE_IP=$(ipconfig getifaddr en0) && docker-compose up`;
      } else {
        run[key] = `mkdir -p ${path} && curl -s ${value} -o ${file} && docker-compose -f ${file} up -d --no-build`;
        upgrade[key] = `mkdir -p ${path} && curl -s ${value} -o ${file} && docker-compose -f ${file} pull && docker stop $(docker ps -a -q) && docker rm -f $(docker ps -a -q) && docker-compose -f ${file} up -d --no-build`;
      }
    });
  }

  const logger = DI.get('logger');
  kue.createQueue({
    // redis: {
    //   createClientFactory: () => DI.get('redis').getInstance()
    // }
  }).on('error', (err) => {
    logger.error(err);
  }).create('builder', {
    key: cacheKey
  }).save();

  res.json(Object.assign(builder, {
    compose,
    proxy,
    run,
    upgrade
  }));
}));

router.get('/stats/:project/:version', wrapper(async(req, res) => {
  const { project, version } = req.params;
  const config = DI.get('config').get('dockerBuilder');
  if (!Object.keys(config.projects).includes(project)) {
    throw new exceptions.ResourceNotFoundException('Request project not found');
  }
  const filepath = `${__dirname}/../../../logs/${project}_${version}.log`;
  const { childProcess } = spawn('tail', ['-f', filepath]);
  childProcess.stdout.pipe(res);
  onFinished(res, () => {
    childProcess.kill();
  })
}));

module.exports = router;
