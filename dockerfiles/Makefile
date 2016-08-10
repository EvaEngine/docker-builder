pull:
	docker pull nginx:stable
	docker pull mysql:5.7
	docker pull redis:3
	docker pull node:4

build:
	make build-nginx
	make build-mysql
	make build-node

build-nginx:
	docker build -t debit-nginx ./nginx

run-nginx:
	docker run -it -d -p 80:80 -p 443:443 --volumes-from debit_source --name debit_nginx -t debit-nginx

in-nginx:
	docker exec -it debit_nginx /bin/bash

build-mysql:
	docker build -t eva/mysql ./mysql

run-mysql:
	docker run -i -d -p 3306:3306 -v ~/opt/data/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=huaerjie001 -t eva/mysql

in-mysql:
	docker run -i -p 3306:3306  -v ~/data/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=huaerjie001 -t eva/mysql /bin/bash

build-node:
	docker build -t debit-node ./nodejs

run-node:
	docker run -it -d -p 19000:19000 --volumes-from debit_source --name debit_node -t debit-node

in-node:
	docker run -i -p 8001:8001 -v ~/opt:/opt -t eva/node /bin/bash

build-redis:
	docker build -t debit-redis ./redis

build-source:
	docker build -t debit-source ./source

run-source:
	docker run -it --name debit_source -v ~/opt/htdocs/bmqb_debit:/opt/htdocs/bmqb_debit -d debit-source

clean:
	docker rmi -f $(shell docker images | grep "<none>" | awk "{print \$3}")
