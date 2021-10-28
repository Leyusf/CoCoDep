import base64
import os

from werkzeug.security import generate_password_hash, check_password_hash

from app import models, app


class User(models.Model):
    __tablename__ = 'user'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    email = models.Column(models.String(24), primary_key=True, nullable=False)
    name = models.Column(models.String(12), nullable=False)
    password = models.Column(models.String(108), nullable=False)
    headpic = models.Column(models.LargeBinary(length=2048 * 493), nullable=False)
    sign = models.Column(models.String(120))
    experience = models.Column(models.String(200), default="******")
    workaddress = models.Column(models.String(20), default="******")
    role = models.Column(models.Integer(), nullable=False, autoincrement=True)

    def __init__(self, email, name, password, role):
        self.email = email
        self.name = name
        self.set_password(password)
        self.role = role
        f = open(file=os.path.join(app.root_path, 'static', 'images', 'headpic', '1.png'), mode='rb')
        self.headpic = base64.b64encode(f.read())

        self.sign = "I’m an independent creative freelancer focusing on web design,mobile application and UI design."

    def set_password(self, value):
        self.password = generate_password_hash(value)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def match(self, pwd):
        return self.check_password(pwd)

    def get(email):
        try:
            return User.query.filter(User.email == email).first()
        except:
            return None

    def all(self):
        try:
            return User.query.all()
        except:
            return []

    def put(self):
        user = User.get(self.email)
        if user is None:
            models.session.add(self)
            return True
        else:
            return False
