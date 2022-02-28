import os

from app import models

from entity.File import Record


class Path(models.Model):
    __tablename__ = 'path'
    id = models.Column(models.Integer(), primary_key=True, autoincrement=True)
    lastid = models.Column(models.Integer())
    root = models.Column(models.Boolean(), nullable=False)
    gid = models.Column(models.Integer())
    name = models.Column(models.String(30), nullable=False)
    number = models.Column(models.Integer(), default=0)
    realpath = models.Column(models.String(255), nullable=False)

    def __init__(self, gid, name, realpath, lastid=None, root=False):
        self.lastid = lastid
        self.gid = gid
        self.root = root
        self.name = str(name)
        self.number = 0
        self.realpath = realpath

    def get(id):
        try:
            return Path.query.get(id)
        except:
            return None

    def getByName(name):
        return Path.query.filter(Path.name == name).first()

    def getRoot(self):
        return Path.get(self.lastid)

    def getTotalPath(self):
        paths = [self.name]
        tmp = self.getRoot()
        while tmp is not None:
            paths.append(tmp.name)
            tmp = tmp.getRoot()
        return reversed(paths)

    def getChildren(self):
        return Path.query.filter(Path.lastid == self.id).all()

    def put(self):
        models.session.add(self)
        path = Path.get(self.lastid)
        if path is not None:
            path.number += 1
        return True

    def dele(self):
        ## 只删除当前文件夹下文件
        if self.number != 0:
            records = Record.getRecordByPath(self.id)
            for i in records:
                i.dele()
        os.rmdir(self.realpath)

    def deleAll(id):
        root = Path.get(id)
        for i in root.getChildren():
            Path.deleAll(i.id)
        root.dele()
        if not root.root:
            Path.query.filter(Path.id == id).delete()
