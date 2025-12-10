#!/usr/bin/env python3
"""
Ensure DB schema columns exist according to SQLModel metadata.

This script is idempotent and safe:
- It inspects SQLModel.metadata to find table/column definitions.
- For each table it queries the live database with SQLAlchemy inspector to get existing columns.
- It only issues ALTER TABLE ... ADD COLUMN for columns that are missing.
- New columns are added without NOT NULL constraints or non-trivial defaults to avoid destructive changes.

Run with the project's Python (use the venv for exact environment):
  ./venv/bin/python3 scripts/ensure_schema.py

This avoids hardcoding column names and derives expected columns from the models.
"""
import os
import sys
from sqlmodel import SQLModel
from sqlalchemy import create_engine, inspect, types as sqltypes, text


def get_database_url():
    # Respect env var if set; fallback to local sqlite used by the project
    return os.getenv("DATABASE_URL", "sqlite:///./workfair.db")


def sqlite_type_for_column(col):
    """Return a conservative SQLite column type for a SQLAlchemy Column object.

    We prefer TEXT for string-like types and INTEGER for integer-like types.
    """
    try:
        t = col.type
        # Use isinstance checks for common SQLAlchemy types
        if isinstance(t, sqltypes.Integer):
            return "INTEGER"
        # Treat String/VARCHAR/CHAR/etc as TEXT in SQLite
        if isinstance(t, (sqltypes.String, sqltypes.VARCHAR, sqltypes.Text)):
            return "TEXT"
        # Fallback: inspect the string representation
        st = str(t).upper()
        if "INT" in st:
            return "INTEGER"
        return "TEXT"
    except Exception:
        return "TEXT"


def ensure_columns(engine):
    inspector = inspect(engine)
    created = []
    skipped = []
    errors = []

    for table in SQLModel.metadata.sorted_tables:
        tname = table.name
        try:
            existing_cols = [c["name"] for c in inspector.get_columns(tname)]
        except Exception:
            # Table doesn't exist yet; skip - table creation should be handled elsewhere (SQLModel.metadata.create_all)
            print(f"Skipping table '{tname}': does not exist in DB")
            skipped.append((tname, 'table_missing'))
            continue

        for col in table.c:
            cname = col.name
            if cname in existing_cols:
                continue

            col_type = sqlite_type_for_column(col)
            # Add column as nullable TEXT/INTEGER to avoid breaking existing rows
            stmt = text(f'ALTER TABLE "{tname}" ADD COLUMN "{cname}" {col_type}')
            try:
                with engine.begin() as conn:
                    conn.execute(stmt)
                print(f"Added column {tname}.{cname} ({col_type})")
                created.append((tname, cname, col_type))
            except Exception as e:
                print(f"Failed to add column {tname}.{cname}: {e}")
                errors.append((tname, cname, str(e)))

    return created, skipped, errors


def main():
    db_url = get_database_url()
    print(f"Using database URL: {db_url}")

    engine = create_engine(db_url, connect_args={"check_same_thread": False})

    created, skipped, errors = ensure_columns(engine)

    print("Summary:")
    print(f"  Columns added: {len(created)}")
    for t, c, typ in created:
        print(f"    - {t}.{c} ({typ})")
    print(f"  Tables skipped (missing): {len(skipped)}")
    for t, reason in skipped:
        print(f"    - {t}: {reason}")
    print(f"  Errors: {len(errors)}")
    for t, c, err in errors:
        print(f"    - {t}.{c}: {err}")

    if errors:
        print("One or more ALTER statements failed. Inspect output above.")
        sys.exit(2)


if __name__ == "__main__":
    main()
