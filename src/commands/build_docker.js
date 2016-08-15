import { Command, DI } from 'evaengine';
import { spawn, exec } from 'child-process-promise';
import qiniu from 'qiniu';
import moment from 'moment';

const runCommand = (command, args, options) => {
  const logger = DI.get('logger');
  const promise = spawn(command, args, options);
  const childProcess = promise.childProcess;
  logger.info('-----------------------------------------------------');
  logger.info('[Executed]', command, args, options, childProcess.pid);
  logger.info('-----------------------------------------------------');
  if (!childProcess.stdout || !childProcess.stderr) {
    return promise;
  }
  childProcess.stdout.on('data', (data) => {
    logger.verbose(data.toString());
  });
  childProcess.stderr.on('data', (data) => {
    logger.verbose(data.toString());
  });
  return promise;
};


const upload = (key, filePath) => {
  const config = DI.get('config').get('dockerBuilder.qiniu');
  qiniu.conf.ACCESS_KEY = config.key;
  qiniu.conf.SECRET_KEY = config.secret;
  const bucket = config.bucket;
  const token = (new qiniu.rs.PutPolicy([bucket, key].join(':'))).token();

  return new Promise((resolve, reject) => {
    qiniu.io.putFile(token, key, filePath, null, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

export class BuildDocker extends Command {
  static getName() {
    return 'build:docker';
  }

  static getDescription() {
    return 'Build docker images';
  }

  static getSpec() {
    return {
      key: {
        required: true
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const cache = DI.get('cache');
    const { key } = this.getArgv();
    if (!key) {
      return logger.error('No build target found by %s!', key);
    }

    const builder = await cache.namespace('docker').get(key);
    if (!builder) {
      return logger.error('No build target found by %s!', key);
    }

    if (!(
        ['failed', 'pending'].includes(builder.status) ||
        //Timeout
        builder.status === 'running' && moment().subtract(15, 'minutes').isAfter(moment(builder.startedAt))
      )) {
      return logger.error('Builder is running for %s', key);
    }

    const options = {
      cwd: builder.cwd,
      stdio: 'inherit'
    };
    builder.status = 'running';
    builder.buildCount++;
    builder.startedAt = new Date();
    await cache.namespace('docker').set(key, builder);
    try {
      await runCommand('make', ['sync-codes'], options);
      await runCommand('git', ['checkout', builder.version], options);
      await runCommand('make', ['docker-build'], options);
      await runCommand('make', ['docker-ship'], options);
      let uploadRes = await upload(`${builder.project}/${builder.version}/docker-compose.yml`, `${builder.cwd}/compose/${builder.version}_docker-compose.yml`);
      logger.info('Uploaded docker-compose test yml', uploadRes);
      uploadRes = await upload(`${builder.project}/${builder.version}/docker-compose.production.yml`, `${builder.cwd}/compose/${builder.version}_docker-compose.production.yml`);
      logger.info('Uploaded docker-compose production yml', uploadRes);
      builder.status = 'finished';
      builder.finishedAt = new Date();
      await cache.namespace('docker').set(key, builder);
    } catch (e) {
      builder.status = 'failed';
      builder.finishedAt = new Date();
      await cache.namespace('docker').set(key, builder);
      return logger.error(e.message);
    }

  }
}
