from sqlmodel import Session, select
from app.models import Nationality
from app.db import engine


def seed_nationalities():
    """Seed nationality data"""
    nationalities_data = [
        {"code": "KR", "name": "대한민국 (South Korea)", "phone_code": "+82"},
        {"code": "US", "name": "United States", "phone_code": "+1"},
        {"code": "CA", "name": "Canada", "phone_code": "+1"},
        {"code": "JP", "name": "日本 (Japan)", "phone_code": "+81"},
        {"code": "CN", "name": "中国 (China)", "phone_code": "+86"},
        {"code": "VN", "name": "Việt Nam (Vietnam)", "phone_code": "+84"},
        {"code": "TH", "name": "ประเทศไทย (Thailand)", "phone_code": "+66"},
        {"code": "PH", "name": "Philippines", "phone_code": "+63"},
        {"code": "ID", "name": "Indonesia", "phone_code": "+62"},
        {"code": "MY", "name": "Malaysia", "phone_code": "+60"},
        {"code": "SG", "name": "Singapore", "phone_code": "+65"},
        {"code": "TW", "name": "台灣 (Taiwan)", "phone_code": "+886"},
        {"code": "HK", "name": "香港 (Hong Kong)", "phone_code": "+852"},
        {"code": "MO", "name": "澳門 (Macau)", "phone_code": "+853"},
        {"code": "IN", "name": "India", "phone_code": "+91"},
        {"code": "BD", "name": "Bangladesh", "phone_code": "+880"},
        {"code": "PK", "name": "Pakistan", "phone_code": "+92"},
        {"code": "NP", "name": "Nepal", "phone_code": "+977"},
        {"code": "LK", "name": "Sri Lanka", "phone_code": "+94"},
        {"code": "MM", "name": "Myanmar", "phone_code": "+95"},
        {"code": "KH", "name": "Cambodia", "phone_code": "+855"},
        {"code": "LA", "name": "Laos", "phone_code": "+856"},
        {"code": "MN", "name": "Mongolia", "phone_code": "+976"},
        {"code": "KZ", "name": "Kazakhstan", "phone_code": "+7"},
        {"code": "UZ", "name": "Uzbekistan", "phone_code": "+998"},
        {"code": "RU", "name": "Russia", "phone_code": "+7"},
        {"code": "AU", "name": "Australia", "phone_code": "+61"},
        {"code": "NZ", "name": "New Zealand", "phone_code": "+64"},
        {"code": "GB", "name": "United Kingdom", "phone_code": "+44"},
        {"code": "FR", "name": "France", "phone_code": "+33"},
        {"code": "DE", "name": "Germany", "phone_code": "+49"},
    ]
    
    with Session(engine) as session:
        # Check if data already exists
        existing = session.exec(select(Nationality)).first()
        if existing:
            print("Nationalities already seeded")
            return
        
        # Add all nationalities
        for nat_data in nationalities_data:
            nationality = Nationality(**nat_data)
            session.add(nationality)
        
        session.commit()
        print(f"Seeded {len(nationalities_data)} nationalities")


if __name__ == "__main__":
    seed_nationalities()
