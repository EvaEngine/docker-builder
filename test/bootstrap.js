import { EvaEngine, DI, utils } from 'evaengine';
import test from 'ava';

const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`,
  port: process.env.PORT || 3000
});
engine.bootstrap();

global.p = (...args) => {
  DI.get('logger').debug(...args);
};

module.exports = utils.test;
module.exports.test = test;
