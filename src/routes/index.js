import { EvaEngine, wrapper } from 'evaengine';
const router = EvaEngine.createRouter(); // eslint-disable-line new-cap

router.get('/', wrapper(async(req, res) => {
  res.render('index', { title: 'Express' });
}));
module.exports = router;
