import os

from app import models, app
from entity.Group import Group
from tool.tool import mkdir


class Task(models.Model):
    __tablename__ = 'task'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    MID = models.Column(models.String(10), nullable=False)
    name = models.Column(models.String(30), nullable=False)
    start = models.Column(models.DATETIME, nullable=False)
    end = models.Column(models.DATETIME, nullable=False)
    des = models.Column(models.String(255))
    realpath = models.Column(models.String(255))
    filename = models.Column(models.String(255))
    state = models.Column(models.Integer(), nullable=False)

    def __init__(self, MID, name, start, end, des, file, state=0):
        self.MID = MID
        self.name = name
        self.start = start
        self.end = end
        self.state = state
        if des is None:
            self.des = ""
        else:
            self.des = des
        if file is None:
            self.file = ""
            self.realpath = ""
        else:
            models.session.add(self)
            models.session.flush()
            self.realpath = os.path.join(app.root_path, str(self.id))
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
        models.session.flush()
        return True

    def dele(self):
        try:
            path = os.path.join(self.realpath, self.filename)
            os.remove(path)
            os.rmdir(self.realpath)
        except:
            pass
        for i in Group.getByTask(self.id):
            i.dele()
        Task.query.filter(Task.id == self.id).delete()
        models.session.commit()
