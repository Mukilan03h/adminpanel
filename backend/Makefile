.PHONY: install dev run migrate revision seed test lint fmt docker-up docker-down

VENV = .venv/bin

install:
	uv venv .venv
	uv pip install -e ".[dev]"

dev run:
	$(VENV)/uvicorn app.main:app --reload --port 8000

migrate:
	$(VENV)/alembic upgrade head

revision:
	$(VENV)/alembic revision --autogenerate -m "$(m)"

seed:
	$(VENV)/python -m app.seed

test:
	$(VENV)/python -m pytest -q

lint:
	$(VENV)/ruff check app tests

fmt:
	$(VENV)/ruff check --fix app tests

docker-up:
	docker compose up --build

docker-down:
	docker compose down -v
