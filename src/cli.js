import { EvaEngine, DI, exceptions } from 'evaengine';
import * as HelloWorldCommands from './commands/hello_world';

const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`
}, 'cli');
engine.registerCommands([
  HelloWorldCommands
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
  return true;
})();
