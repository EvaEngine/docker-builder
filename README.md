# EvaSkeleton.js

A Skeleton project based on [EvaEngine.js](https://github.com/EvaEngine/EvaEngine.js)

## Install and Start develop:

Requirements:

- NodeJS >= v4.4.5


*1*. Install global dependencies

```
make pre-build
```

*2*. Install project dependencies

```
make build
```

*3*. Start project (development mode)

```
npm run dev
```

Visit http://localhost:3000/ to see HelloWorld web page demo

*4*. Generate API documents

```
npm run swagger-dev
```

Visit http://localhost:15638/ to see Swagger document demo


*5*. CLI command (development mode)

```
babel-node --harmony src/cli.js hello:world
```

*6*. Run unit test

```
npm test
```

## Deploy to production server

*1*. Install global dependencies

```
make pre-build
```

*2*. Install project dependencies

```
make build
```

*3*. Compile & Start project

```
npm run build
npm start
```

