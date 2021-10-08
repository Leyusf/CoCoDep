from app import models


class Education(models.Model):
    __tablename__ = 'education'  # 表名
    id = models.Column(models.Integer(), primary_key=True, autoincrement=True)
    email = models.Column(models.String(30), nullable=False)
    des = models.Column(models.String(200), nullable=False)

    def __init__(self, email, des):
        self.email = email
        self.des = des

    def getRecordByEmail(email):
        return Education.query.filter(Education.email == email).all()

    def get(id):
        try:
            return Education.query.get(id)
        except:
            return None

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        Education.query.filter(Education.id == self.id).delete()
        models.session.commit()
