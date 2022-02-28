from app import models
import time
from tool.tool import now


class Work(models.Model):
    __tablename__ = 'work'  # 表名
    uid = models.Column(models.Integer(), primary_key=True, nullable=False)
    gid = models.Column(models.Integer(), primary_key=True, nullable=False)
    time = models.Column(models.String(30), primary_key=True, nullable=False)
    operation = models.Column(models.String(20), primary_key=True, nullable=False)
    info = models.Column(models.String(20), nullable=False)

    def __init__(self, uid, gid, op, info):
        self.uid = uid
        self.gid = gid
        self.operation = op
        self.info = info
        if op != "Join" and op != "Leave":
            self.time = now()
        else:
            self.time = str(time.time())

    def getWork(uid, gid):
        return Work.query.filter(Work.uid == uid, Work.gid == gid).all()

    def getWorkByOperation(uid, gid, op):
        res = Work.query.filter(Work.uid == uid, Work.gid == gid, Work.operation == op).all()
        if not res:
            return None
        return res

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        Work.query.filter(Work.uid == self.uid, Work.gid == self.gid).delete()
        models.session.commit()
