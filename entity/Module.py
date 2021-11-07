import os

from app import models, app
from entity.Task import Task


class Module(models.Model):
    __tablename__ = 'module'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    email = models.Column(models.String(24), primary_key=True, nullable=False)
    name = models.Column(models.String(12), nullable=False)

    def __init__(self, email, name):
        self.email = email
        self.name = name

    def get(email):
        try:
            return Module.query.filter(Module.email == email).all()
        except:
            return None

    def getById(id):
        try:
            return Module.query.filter(Module.id == id).first()
        except:
            return None

    def all(self):
        try:
            return Module.query.all()
        except:
            return []

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        resources = Resource.getAllByModule(self.id)
        for i in resources:
            i.dele()
        tasks = Task.getAllByModule(self.id)
        for i in tasks:
            i.dele()
        path = os.path.join(app.root_path,  "MODULE_"+str(self.id))
        try:
            os.rmdir(path)
        except:
            pass
        Module.query.filter(Module.id == self.id).delete()
        models.session.commit()
