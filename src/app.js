import { EvaEngine, DI, express } from 'evaengine';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

const engine = new EvaEngine({
  projectRoot: `${__dirname}/..`,
  port: process.env.PORT || 3000
});
engine.bootstrap();

const app = EvaEngine.getApp();
const logger = DI.get('logger');
global.p = (...args) => {
  logger.debug(...args);
};

app.set('logger', logger);
app.set('views', path.join(__dirname, '/../views'));
app.set('view engine', 'pug');
app.set('trust proxy', () => true);

//-----------Middleware Start
const config = DI.get('config').get();
const session = DI.get('session')();
const auth = DI.get('auth')();

app.use(DI.get('trace')('eva_skeleton'));
app.use(DI.get('debug')());
app.use(express.static(path.join(__dirname, '/../public')));
app.use(cors({
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//-----------Middleware End


//-----------Routers Start
app.use('/', require('./routes/index'));
app.use('/v1', require('./routes/api/hello_world'));
//-----------Routers End


engine.run();
