local:
	docker context use default
	docker compose up -d --build backend
	docker compose up -d --build frontend

remote:
	docker context use remote
	docker compose up -d --build backend
	docker compose up -d --build frontend

front-remote:
	docker context use remote
	docker compose up -d --build frontend

front-local:
	docker context use default
	docker compose up -d --build frontend-hot-reload

back-remote:
	docker context use remote
	docker compose up -d --build backend

back-local:
	docker context use default
	docker compose up -d --build backend

down-local:
	docker context use default
	docker compose down

down-remote:
	docker context use remote
	docker compose down

prune:
	docker system prune