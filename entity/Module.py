from app import models


class Module(models.Model):
    __tablename__ = 'module'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    email = models.Column(models.String(24), primary_key=True, nullable=False)
    name = models.Column(models.String(12), nullable=False)

    def __init__(self, email, name):
        self.email = email
        self.name = name

    def get(email):
        try:
            return Module.query.filter(Module.email == email).first()
        except:
            return None

    def all(self):
        try:
            return Module.query.all()
        except:
            return []

    def put(self):
        models.session.add(self)
        return True
