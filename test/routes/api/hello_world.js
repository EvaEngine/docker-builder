import { exceptions } from 'evaengine';
import { test, mockRequest, runController } from '../../bootstrap';
import authController from '../../../src/routes/api/hello_world';

test('Could login success', async(t) => {
  const res = await runController(authController, mockRequest({
    method: 'POST', url: '/login', body: {
      username: 'evaengine',
      password: 'helloworld'
    }
  }));
  t.true(typeof res.token === 'string');
});
