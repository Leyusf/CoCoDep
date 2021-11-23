import os

from app import models, app
from tool.tool import mkdir


class Task(models.Model):
    __tablename__ = 'task'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    MID = models.Column(models.String(10), nullable=False)
    name = models.Column(models.String(12), nullable=False)
    start = models.Column(models.DATETIME)
    end = models.Column(models.DATETIME)
    des = models.Column(models.String(255))
    realpath = models.Column(models.String(255))
    filename = models.Column(models.String(40))

    def __init__(self, MID, name, start, end, des, file):
        self.MID = MID
        self.name = name
        self.start = start
        self.end = end
        if des is None:
            self.des = ""
        else:
            self.des = des
        if file is None:
            self.file = ""
            self.realpath = ""
        else:
            self.realpath = os.path.join(app.root_path, self.name)
            mkdir(self.realpath)
            path = os.path.join(self.realpath, file.filename)
            file.save(path)
            self.filename = file.filename

    def get(id):
        try:
            return Task.query.filter(Task.id == id).first()
        except:
            return None

    def getByName(name):
        try:
            return Task.query.filter(Task.name == name).first()
        except:
            return None

    def getAllByModule(MID):
        try:
            return Task.query.filter(Task.MID == MID).all()
        except:
            return []

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        try:
            path = os.path.join(self.realpath, self.filename)
            os.remove(path)
            os.rmdir(self.realpath)
        except:
            pass
        Task.query.filter(Task.id == self.id).delete()
        models.session.commit()
