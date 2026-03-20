.PHONY: build up down restart logs ps prune dev prod test

# Development commands
dev:
	docker compose up -d --build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

# Production commands
prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

# Specific service logs
logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

list-subscribers:
	docker compose exec backend python subscribers_cli.py

# Cleanup
prune:
	docker system prune -af

clean-volumes:
	docker volume prune -f

# Help
help:
	@echo "Available commands:"
	@echo "  make dev              - Build and start development environment"
	@echo "  make up               - Start containers"
	@echo "  make down             - Stop and remove containers"
	@echo "  make restart          - Restart all containers"
	@echo "  make logs             - View all logs"
	@echo "  make ps               - List containers"
	@echo "  make prod-up          - Start production environment"
	@echo "  make prod-down        - Stop production environment"
	@echo "  make logs-backend     - View backend logs"
	@echo "  make list-subscribers - List all newsletter subscribers"
	@echo "  make prune            - Remove unused docker objects"
