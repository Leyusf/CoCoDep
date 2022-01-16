from app import models


class Contact(models.Model):
    __tablename__ = 'contact'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    email = models.Column(models.String(24), primary_key=True, nullable=False)
    name = models.Column(models.String(12), nullable=False)
    msg = models.Column(models.String(300), nullable=False)

    def __init__(self, email, name, msg):
        self.email = email
        self.name = name
        self.msg = msg

    def get(email):
        try:
            return Contact.query.filter(Contact.email == email).first()
        except:
            return None

    def all(self):
        try:
            return Contact.query.all()
        except:
            return []

    def put(self):
        contact = Contact.get(self.email)
        if contact is None:
            models.session.add(self)
            return True
        else:
            return False
