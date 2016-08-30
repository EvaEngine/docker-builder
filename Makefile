list:
	@echo "build"
	@echo "pre-build"

pre-build:
	apt-get install git redis-server

build: install

install:
	git pull
	npm install
	npm run build

migrate:
	sequelize db:migrate

seeder:
	sequelize db:seed:all --harmony

deploy:
	git pull
	npm run build
	supervisorctl restart all

docker-clear:
	docker rmi -f $(shell docker images | grep "<none>" | awk '{print $3}')