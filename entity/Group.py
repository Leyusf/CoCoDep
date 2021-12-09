from app import models, app
from entity.GroupMember import GroupMember as GM


class Group(models.Model):
    __tablename__ = 'group'  # 表名
    id = models.Column(models.Integer(), primary_key=True, nullable=False, autoincrement=True)
    TID = models.Column(models.Integer(), nullable=False)

    def __init__(self, TID):
        self.TID = TID

    def get(id):
        try:
            return Group.query.filter(Group.id == id).first()
        except:
            return None

    def getByTask(tid):
        try:
            return Group.query.filter(Group.TID == tid).all()
        except:
            return []

    def put(self):
        models.session.add(self)
        models.session.flush()
        return True

    def dele(self):
        for i in GM.getAllByGroup(self.id):
            i.dele()
        Group.query.filter(Group.id == self.id).delete()
        models.session.commit()
