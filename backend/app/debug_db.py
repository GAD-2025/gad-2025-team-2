from sqlmodel import Session, select
from app.db import engine
from app.models import Nationality

def check_nationalities():
    with Session(engine) as session:
        statement = select(Nationality)
        results = session.exec(statement).all()
        if not results:
            print("!!! The nationalities table is empty.")
        else:
            print("--- Nationalities in the database ---")
            for nationality in results:
                print(f"Code: {nationality.code}, Name: {nationality.name}")
            print("------------------------------------")

if __name__ == "__main__":
    check_nationalities()
