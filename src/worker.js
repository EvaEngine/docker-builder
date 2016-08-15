import { EvaEngine, DI, engine } from 'evaengine';
import kue from 'kue';
import * as BuilderCommands from './commands/build_docker';

const app = new EvaEngine({
  projectRoot: `${__dirname}/..`
}, 'cli');
app.registerCommands([
  BuilderCommands
]);
app.registerServiceProviders(EvaEngine.getServiceProvidersForCLI());
const logger = DI.get('logger');

kue.createQueue().process('builder', (job, done) => {
  const { data: { key } } = job;
  logger.info(key);
  const argv = engine.yargs(`build:docker --key=${key}`).argv;
  const command = new BuilderCommands.BuildDocker(argv);
  (async() => {
    try {
      await command.run();
    } catch (e) {
      if (e instanceof exceptions.LogicException) {
        if (e instanceof exceptions.FormInvalidateException) {
          return logger.warn(e.getDetails());
        }
        return logger.warn(e.message);
      }
      logger.error(e);
      done(e);
    }
    done();
  })();
});
