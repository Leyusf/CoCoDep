import os

from app import models
from datetime import datetime

from entity.User import User


class Record(models.Model):
    __tablename__ = 'record'  # 表名
    id = models.Column(models.Integer(), primary_key=True, autoincrement=True)
    datetime = models.Column(models.DATETIME(), nullable=False)
    pathid = models.Column(models.Integer(), nullable=False)
    size = models.Column(models.Integer(), nullable=False)
    name = models.Column(models.String(200), nullable=False)
    realpath = models.Column(models.String(255), nullable=False)

    def __init__(self, name, realpath, pathid, size):
        self.pathid = pathid
        self.size = size
        self.datetime = datetime.now()
        self.name = name
        self.realpath = realpath

    def getRecordByPath(pathid):
        return Record.query.filter(Record.pathid == pathid).all()

    def getRecord(pathid, filename):
        for i in Record.getRecordByPath(pathid):
            if i.name == filename:
                return i
        return None

    def get(id):
        try:
            return Record.query.get(id)
        except:
            return None

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        path = os.path.join(self.realpath, self.name)
        os.remove(path)
        user = User.get(self.email)
        user.restcapacity += self.size
        Record.query.filter(Record.id == self.id).delete()
        models.session.commit()