from app import models
from sqlalchemy import and_

from entity.File import Record


class Path(models.Model):
    __tablename__ = 'path'  # 表名
    id = models.Column(models.Integer(), primary_key=True, autoincrement=True)
    lastid = models.Column(models.Integer())
    gid = models.Column(models.Integer())
    root = models.Column(models.Boolean(), nullable=False)
    name = models.Column(models.String(30), nullable=False)
    empty = models.Column(models.Integer(), default=0)

    def __init__(self, gid, name, lastid=None, root=False):
        self.lastid = lastid
        self.gid = gid
        self.root = root
        self.name = str(name)
        self.empty = 0

    def get(id):
        try:
            return Path.query.get(id)
        except:
            return None

    def getPathByName(name, gid):
        path = Path.query.filter(and_(Path.name == name, Path.gid == gid)).first()
        return path

    def getRoot(self, gid):
        return Path.query.filter(Path.gid == gid, Path.root == True).first()

    def getChild(self):
        return Path.query.filter(Path.lastid == self.id).all()

    def put(self):
        models.session.add(self)
        path = Path.get(self.lastid)
        if path is not None:
            path.empty += 1
        return True

    def dele(self):
        ## 只删除当前文件夹下文件
        if self.empty != 0:
            records = Record.getRecordByPath(self.id)
            for i in records:
                i.dele()
                self.empty -= 1

    def deleAll(id):
        root = Path.get(id)
        for i in root.getChild():
            Path.deleAll(i.id)
        root.dele()
        if not root.root:
            Path.query.filter(Path.id == id).delete()
