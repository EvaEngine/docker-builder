import { Command, DI } from 'evaengine';
import { spawn } from 'child-process-promise';

const runCommand = (command, args, options) => {
  const logger = DI.get('logger');
  const promise = spawn(command, args, options);
  const childProcess = promise.childProcess;
  logger.info('[Executed]', command, args, options, childProcess.pid);
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

    const options = {
      cwd: '/opt/htdocs/' + builder.project,
      stdio: 'inherit'
    };
    builder.status = 'running';
    builder.buildCount++;
    builder.startedAt = new Date();
    await cache.namespace('docker').set(key, builder);
    try {
      await runCommand('git', ['checkout', builder.version], options);
      await runCommand('make', ['docker-build'], options);
      await runCommand('make', ['docker-ship'], options);

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
