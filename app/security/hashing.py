from passlib.context import CryptContext

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Hash:
    @staticmethod
    def make(plain_password: str) -> str:
        return _pwd_ctx.hash(plain_password)

    @staticmethod
    def verify(hashed_password: str, plain_password: str) -> bool:
        return _pwd_ctx.verify(plain_password, hashed_password)