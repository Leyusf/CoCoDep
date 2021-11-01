import os

from app import models, app
from datetime import datetime

from tool.tool import get_FileSize, mkdir


class Resource(models.Model):
    __tablename__ = 'resource'  # 表名
    id = models.Column(models.Integer(), primary_key=True, autoincrement=True)
    MID = models.Column(models.Integer(), nullable=False)
    datetime = models.Column(models.DATETIME(), nullable=False)
    size = models.Column(models.Integer(), nullable=False)
    name = models.Column(models.String(200), nullable=False)
    realpath = models.Column(models.String(255), nullable=False)

    def __init__(self, MID, file):
        self.realpath = os.path.join(app.root_path, "MODULE_"+str(MID))
        mkdir(self.realpath)
        path = os.path.join(self.realpath, file.filename)
        file.save(path)
        self.MID = MID
        self.size = get_FileSize(path)
        self.datetime = datetime.now()
        self.name = file.filename

    def getAllByModule(MID):
        return Resource.query.filter(Resource.MID == MID).all()

    def get(id):
        try:
            return Resource.query.get(id)
        except:
            return None

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        path = os.path.join(self.realpath, self.name)
        os.remove(path)
        Resource.query.filter(Resource.id == self.id).delete()
        models.session.commit()

