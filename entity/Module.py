import os

from app import models, app
from entity.Task import Task


class Module(models.Model):
    __tablename__ = 'module'  # 表名
    id = models.Column(models.String(10), primary_key=True, nullable=False)
    email = models.Column(models.String(24), primary_key=True, nullable=False)
    name = models.Column(models.String(50), primary_key=True, nullable=False)

    def __init__(self, id, email, name):
        self.email = email
        self.name = name
        self.id = id

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

    def getByName(name):
        try:
            return Module.query.filter(Module.name == name).first()
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
        tasks = Task.getAllByModule(self.id)
        for i in tasks:
            i.dele()
        Module.query.filter(Module.id == self.id).delete()
        models.session.commit()
