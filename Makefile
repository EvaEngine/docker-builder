list:
	@echo "build"
	@echo "pre-build"

pre-build:
	npm install -g nodemon babel-cli sequelize-cli git://github.com/AlloVince/sequelize-auto#feature/column-comments

build: install

install:
	git pull
	npm install
	bower install --allow-root
	gulp build
	npm run build

migrate:
	sequelize db:migrate

seeder:
	sequelize db:seed:all --harmony

docker-proxy:
	docker run -p 443:443  -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --net nginx-proxy --rm --name nginx-proxy -t jwilder/nginx-proxy

docker-pre-build:
	docker-compose build

docker-build:
	git pull
	docker run -v $(shell pwd -P):/opt/htdocs/EvaSkeleton.js --rm -it evaskeleton-node npm install
	docker run -v $(shell pwd -P):/opt/htdocs/EvaSkeleton.js --rm -it evaskeleton-node npm run build

docker-up:
	docker-compose up

docker-rm:
	docker rm $(shell docker ps -a -q)

docker-stop:
	docker stop $(shell docker ps -a -q)

