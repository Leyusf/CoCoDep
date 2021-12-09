from app import models, app


class GroupMember(models.Model):
    __tablename__ = 'groupmember'  # 表名
    GID = models.Column(models.Integer(), primary_key=True, nullable=False)
    email = models.Column(models.String(24), primary_key=True, nullable=False)

    def __init__(self, GID, email):
        self.GID = GID
        self.email = email

    def get(gid, email):
        try:
            return GroupMember.query.filter(GroupMember.GID == gid, GroupMember.email == email).first()
        except:
            return None

    def getGroupByEmail(email):
        try:
            return GroupMember.query.filter(GroupMember.email == email).all()
        except:
            return []

    def getAllByGroup(gid):
        try:
            return GroupMember.query.filter(GroupMember.GID == gid).all()
        except:
            return []

    def put(self):
        models.session.add(self)
        return True

    def dele(self):
        GroupMember.query.filter(GroupMember.GID == self.GID, GroupMember.email == self.email).delete()
        models.session.commit()
