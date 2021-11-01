import os
from datetime import timedelta
from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy

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

from entity.User import User
from entity.Module import Module
from entity.Resource import Resource


# models.drop_all()
# models.create_all()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/services/')
def services():
    return render_template('services.html')


@app.route('/introduction/')
def introduction():
    return render_template('introduction.html')


@app.route('/launch/')
def launch():
    email = request.cookies.get("email")
    if "email" in session and str(session['email']) == str(email) and 'login' in session and session['login'] == True:
        return redirect(url_for('access.person', email=email))
    return render_template('launch.html')


@app.route('/lor/')
def lor():
    return render_template('lor.html')


# 注册蓝图
from controller.access import *
from controller.private import *

app.register_blueprint(access)
app.register_blueprint(private)

if __name__ == '__main__':
    app.run(use_reloader=False)
