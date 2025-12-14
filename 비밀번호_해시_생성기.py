"""
비밀번호 해시 생성기
이 스크립트를 사용하여 특정 비밀번호의 SHA256 해시를 생성할 수 있습니다.
생성된 해시를 MySQL Workbench에서 UPDATE 쿼리에 사용할 수 있습니다.
"""
import hashlib

def hash_password(password: str) -> str:
    """비밀번호를 SHA256으로 해시"""
    password = password.strip() if password else ""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

if __name__ == "__main__":
    print("=" * 60)
    print("비밀번호 해시 생성기")
    print("=" * 60)
    
    # 테스트 비밀번호들
    test_passwords = [
        "password123",
        "test123",
        "admin123",
    ]
    
    print("\n[기본 테스트 비밀번호 해시]")
    for pwd in test_passwords:
        hashed = hash_password(pwd)
        print(f"비밀번호: '{pwd}'")
        print(f"해시:     {hashed}")
        print(f"길이:     {len(hashed)} 문자")
        print()
    
    # 사용자 입력 받기
    print("\n" + "=" * 60)
    print("직접 비밀번호 입력 (종료하려면 'quit' 입력)")
    print("=" * 60)
    
    while True:
        try:
            password = input("\n비밀번호를 입력하세요: ").strip()
            if password.lower() == 'quit':
                break
            if not password:
                print("비밀번호를 입력해주세요.")
                continue
            
            hashed = hash_password(password)
            print(f"\n비밀번호: '{password}'")
            print(f"SHA256 해시: {hashed}")
            print(f"해시 길이: {len(hashed)} 문자")
            print("\nMySQL UPDATE 쿼리:")
            print(f"UPDATE signup_users")
            print(f"SET password = '{hashed}'")
            print(f"WHERE phone = 'YOUR_PHONE_NUMBER' AND role = 'job_seeker';")
            print()
        except KeyboardInterrupt:
            print("\n\n종료합니다.")
            break
        except Exception as e:
            print(f"오류 발생: {e}")

