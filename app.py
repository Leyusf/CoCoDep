import os
from datetime import timedelta
from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
mail = Mail()
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)  # 配置1天有效

app.config['MAIL_SERVER'] = "smtp.qq.com"
app.config['MAIL_PORT'] = "587"
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = "1911663703@qq.com"
app.config['MAIL_PASSWORD'] = "moejsohrpkecbhhi"  # 生成的授权码
app.config['MAIL_DEFAULT_SENDER'] = "1911663703@qq.com"

mail.init_app(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:991123@localhost:3306/CoCoDep?charset=utf8'
models = SQLAlchemy(app)
socketio = SocketIO(app)

from entity.User import User
from entity.Module import Module
from entity.Contact import Contact
from entity.Task import Task
from entity.ModuleStudent import MSTable
from entity.Group import Group
from entity.GroupMember import GroupMember
from entity.Path import Path
from entity.File import Record
from entity.Work import Work

# models.drop_all()
# models.create_all()

organizationName = 'SWJTU-Leeds Joint School'
organizationInfo = 'Address: SWJTU CHENGDU SiChuan Tel:  00000000000 Fax: 00000000000'
organizationEmail = 'Email: 847805259@qq.com'


@app.route('/')
def index():
    return render_template('index.html', Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@app.route('/services/')
def services():
    return render_template('services.html', Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@app.route('/introduction/')
def introduction():
    return render_template('introduction.html', Oname=organizationName, Oinfo=organizationInfo,
                           Oemail=organizationEmail)


@app.route('/launch/')
def launch():
    email = request.cookies.get("email")
    if "email" in session and str(session['email']) == str(email) and 'login' in session and session['login'] == True:
        return redirect(url_for('access.person', email=email))
    return render_template('launch.html', Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@app.route('/lor/')
def lor():
    return render_template('lor.html', Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@app.route('/contact/', methods=['post'])
def contact():
    name = request.form.get('name')
    email = request.form.get('email')
    msg = request.form.get('msg')
    contact = Contact(email, name, msg)
    res = contact.put()
    if res is True:
        return jsonify({'code': 0, 'msg': 'Sent successfully'})
    return jsonify({'code': 1, 'msg': 'Please wait for us to contact you'})


@app.route('/forgetpwd/', methods=['get'])
def forget():
    return render_template('forgetpwd.html')


# test for students
@app.route('/addUsers/', methods=['post'])
def addStudent():
    file = request.files.get('file')
    filetype = file.filename.split(".")[-1]
    if filetype != 'csv' and filetype != 'xls' and filetype != 'xlsx':
        return jsonify({'code': -1, 'msg': 'error format'})
    f = file.read()  # 文件内容
    data = xlrd.open_workbook(file_contents=f)
    table = data.sheets()[0]
    nrows = table.nrows  # 获取该sheet中的有效行数
    users = []
    for i in range(nrows):
        row = table.row_values(i)
        user = []
        for text in row:
            if type(text) == float:
                text = int(text)
            text = str(text).strip()
            user.append(text)
        users.append(user)
    for i in users:
        user = User(i[1], i[0], i[2], int(i[3]))
        user.put()
    return jsonify({'code': 0, 'msg': 'successfully'})


# 注册蓝图
from controller.access import *
from controller.private import *

app.register_blueprint(access)
app.register_blueprint(private)

if __name__ == '__main__':
    # app.run(use_reloader=False)
    CORS(app, supports_credentials=True)  # 设置跨域
    socketio.run(app)
