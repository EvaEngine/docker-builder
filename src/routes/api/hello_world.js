import { EvaEngine, DI, wrapper, exceptions } from 'evaengine';

const router = EvaEngine.createRouter();

//@formatter:off
/**
 @swagger
 Token:
   properties:
     token:
       type: string
       description: Token
     expiredAt:
       type: string
       description: Token expire time
 @swagger
 Login:
   properties:
     username:
       type: string
       description: Username
       default: evaengine
     password:
       type: string
       description: password
       default: helloworld
 @swagger
 /login:
   post:
     summary: Fake login demo API
     tags:
       - Demo
     parameters:
       - name: body
         in: body
         required: true
         schema:
           $ref: '#/definitions/Login'
     responses:
       200:
         schema:
           type: object
           $ref: '#/definitions/Token'
 @throws {ResourceNotFoundException} Login user not exists
 @throws {InvalidArgumentException}  Input invalided
 */
//@formatter:on
router.post('/login', wrapper(async(req, res) => {
  const { username, password } = req.body;
  if (username !== 'evaengine') {
    throw new exceptions.ResourceNotFoundException('User not exist, try use evaengine as user name');
  }
  if (password !== 'helloworld') {
    throw new exceptions.InvalidArgumentException('Password not match, try use helloworld as password');
  }
  res.json({
    token: username,
    expiredAt: new Date()
  });
}));

//@formatter:off
/**
 @swagger
 /hello/world:
   get:
     summary: Hello World
     tags:
       - Demo
     parameters:
     responses:
       200:
         schema:
           type: object
           $ref: '#/definitions/Token'
 @throws {UnauthorizedException}  Permission not allowed
 */
//@formatter:on
router.get('/hello/world', wrapper(async(req, res) => {
  res.json({
    hello: 'world'
  });
}));

module.exports = router;
