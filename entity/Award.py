from app import models


class Award(models.Model):
    __tablename__ = 'award'  # 表名
    id = models.Column(models.Integer(), primary_key=True, autoincrement=True)
    email = models.Column(models.String(30), nullable=False)
    year = models.Column(models.String(4), nullable=False)
    des = models.Column(models.String(200), nullable=False)

    def __init__(self, email, year, des):
        self.email = email
        self.year = year
        self.des = des

    def getRecordByEmail(email):
        return Award.query.filter(Award.email == email).all()

    def get(id):
        try:
            return Award.query.get(id)
        except:
            return None

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        Award.query.filter(Award.id == self.id).delete()
        models.session.commit()
