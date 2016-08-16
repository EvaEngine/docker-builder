list:
	@echo "build"
	@echo "pre-build"

pre-build:
	npm install -g nodemon babel-cli sequelize-cli

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

deploy:
	git pull
	npm run build
	supervisorctl restart all
