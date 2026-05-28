.PHONY: up up-all down logs test test-e2e

up:
	docker-compose up -d --build

up-all:
	docker-compose up -d --build

down:
	docker-compose down -v

logs:
	docker-compose logs -f

test:
	./test.sh

test-e2e:
	./e2e-test.sh
