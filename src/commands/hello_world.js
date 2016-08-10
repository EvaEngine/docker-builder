import { Command, DI } from 'evaengine';

export class HelloWorld extends Command {
  static getName() {
    return 'hello:world';
  }

  static getDescription() {
    return 'Hello world CLI demo';
  }

  static getSpec() {
    return {
      id: {
        required: false
      }
    };
  }

  async run() {
    const logger = DI.get('logger');
    const { id } = this.getArgv();
    if (id) {
      return logger.info('Hello world %s!', id);
    }
    return logger.info('Hello world!');
  }
}
