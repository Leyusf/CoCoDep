from app import models, app
from entity.Resource import Resource
from entity.Task import Task


class MSTable(models.Model):
    __tablename__ = 'modulestudent'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    MID = models.Column(models.Integer(), nullable=False, autoincrement=True)
    SID = models.Column(models.Integer(),  nullable=False, autoincrement=True)

    def __init__(self, MID, SID):
        self.MID = MID
        self.SID = SID

    def get(mid, sid):
        try:
            return MSTable.query.filter(MSTable.MID == mid, MSTable.SID == sid).first()
        except:
            return None

    def getAllByModule(mid):
        try:
            return MSTable.query.filter(MSTable.MID == mid).all()
        except:
            return []

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        MSTable.query.filter(MSTable.id == self.id).delete()
        models.session.commit()
