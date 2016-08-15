import { Command, DI } from 'evaengine';
import { spawn, exec } from 'child-process-promise';
import qiniu from 'qiniu';
import moment from 'moment';
import winston from 'winston';

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

  static upload(key, filePath) {
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

  createFileLogger(key) {
    const filename = `${__dirname}/../../logs/${key.replace(':', '_')}.log`;
    return new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename,
          json: false,
          level: 'debug',
          options: { flags: 'w' } //Make log overwritten every time
        }),
        new (winston.transports.Console)({
          level: 'debug'
        })
      ]
    })
  };

  runCommand(command, args, options) {
    const logger = this.logger;
    const promise = spawn(command, args, options);
    const childProcess = promise.childProcess;
    logger.info('-----------------------------------------------------');
    logger.info('[Executed pid %s] %s %s', childProcess.pid, command, args.join(' '), options);
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

  async run() {
    const cache = DI.get('cache');
    const logger = DI.get('logger');
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
      return builder.status === 'running' ? logger.error('Builder is running for %s', key) :
        logger.error('Builder is finished for %s', key);
    }

    this.logger = this.createFileLogger(key);
    const options = {
      //NOTE: 如果Docker使用了-it参数, 则Docker就需要进程使用tty, stdio必须设置为 inherit,
      cwd: builder.cwd
    };
    builder.status = 'running';
    builder.buildCount++;
    builder.startedAt = new Date();
    await cache.namespace('docker').set(key, builder);
    try {
      await this.runCommand('make', ['sync-codes'], options);
      await this.runCommand('git', ['checkout', builder.version], options);
      await this.runCommand('make', ['docker-build'], options);
      await this.runCommand('make', ['docker-ship'], options);
      let uploadRes = await BuildDocker.upload(
        `${builder.project}/${builder.version}/docker-compose.yml`, `${builder.cwd}/compose/${builder.version}_docker-compose.yml`);
      this.logger.info('Uploaded docker-compose test yml', uploadRes);
      uploadRes = await BuildDocker.upload(
        `${builder.project}/${builder.version}/docker-compose.production.yml`, `${builder.cwd}/compose/${builder.version}_docker-compose.production.yml`);
      this.logger.info('Uploaded docker-compose production yml', uploadRes);
      builder.status = 'finished';
      builder.finishedAt = new Date();
      await cache.namespace('docker').set(key, builder);
    } catch (e) {
      builder.status = 'failed';
      builder.finishedAt = new Date();
      await cache.namespace('docker').set(key, builder);
      return this.logger.error(e.message);
    }

  }
}
