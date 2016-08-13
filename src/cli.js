import { EvaEngine, DI, exceptions } from 'evaengine';
import * as BuilderCommands from './commands/build_docker';

const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`
}, 'cli');
engine.registerCommands([
  BuilderCommands
]);

const logger = DI.get('logger');
global.p = (...args) => {
  logger.debug(...args);
};

(async() => {
  try {
    await engine.runCLI();
  } catch (e) {
    if (e instanceof exceptions.LogicException) {
      if (e instanceof exceptions.FormInvalidateException) {
        return logger.warn(e.getDetails());
      }
      return logger.warn(e.message);
    }
    logger.error(e);
  }

  const redis = DI.get('redis');
  if (redis.isConnected()) {
    redis.cleanup();
  }
  return true;
})();
