from app import models


class MSTable(models.Model):
    __tablename__ = 'modulestudent'  # 表名
    MID = models.Column(models.String(10), primary_key=True, nullable=False)
    email = models.Column(models.String(24), primary_key=True, nullable=False)

    def __init__(self, MID, email):
        self.MID = MID
        self.email = email

    def get(mid, email):
        try:
            return MSTable.query.filter(MSTable.MID == mid, MSTable.email == email).first()
        except:
            return None

    def getModulesByEmail(email):
        try:
            return MSTable.query.filter(MSTable.email == email).all()
        except:
            return []

    def getAllByModule(mid):
        try:
            return MSTable.query.filter(MSTable.MID == mid).all()
        except:
            return []

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        MSTable.query.filter(MSTable.MID == self.MID, MSTable.email == self.email).delete()
        models.session.commit()
