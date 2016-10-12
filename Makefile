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

deploy:
	git pull
	npm run build
	supervisorctl restart all


docker-rm:
	docker rm $(shell docker ps -a -q)

docker-stop:
	docker stop $(shell docker ps -a -q)

docker-clear:
	docker rmi -f $(shell docker images | grep "<none>" | awk '{print $3}')