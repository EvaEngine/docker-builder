import { EvaEngine } from 'evaengine';
import * as HelloWorldCommands from './commands/hello_world';

const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`
}, 'cli');
engine.registerCommands([
  HelloWorldCommands
]);

engine.runCrontab('0/10 * * * * *', 'hello:world --id=EvaEngine');
