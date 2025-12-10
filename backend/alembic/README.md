Alembic is initialized to work with this application's SQLModel metadata.

Quick start:

- Install alembic in the backend venv (if not present):
  ./venv/bin/python -m pip install alembic

- Create a new revision (autogenerate):
  ./venv/bin/alembic -c alembic.ini revision --autogenerate -m "describe change"

- Apply migrations:
  ./venv/bin/alembic -c alembic.ini upgrade head

Notes:
- Alembic uses `app.db.get_engine()` and `SQLModel.metadata` in `env.py` so it will operate against the same DB as the app.
- Autogenerate is a convenience; always review generated migrations before applying.
