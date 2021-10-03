import os
import uuid
import random
from datetime import timedelta
from flask import Flask, render_template, request
from flask_mail import Message, Mail
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
mail = Mail()
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)  # 配置30天有效

app.config['MAIL_SERVER'] = "smtp.qq.com"
app.config['MAIL_PORT'] = "587"
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = "1911663703@qq.com"
app.config['MAIL_PASSWORD'] = "moejsohrpkecbhhi"  # 生成的授权码
app.config['MAIL_DEFAULT_SENDER'] = "1911663703@qq.com"

mail.init_app(app)


# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:991123@localhost:3306/7mian?charset=utf8'
# models = SQLAlchemy(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/services')
def services():
    return render_template('services.html')


@app.route('/introduction')
def introduction():
    return render_template('introduction.html')


@app.route('/launch')
def launch():
    return render_template('launch.html')


@app.route('/login')
def login():
    return render_template('lor.html')


# 发送一个html
@app.route('/email_captcha/<email>')
def email_send_html(email):
    message = Message(subject='CoCoDep validation', recipients=[email])
    try:
        # 发送渲染一个模板
        first = random.randint(0, 25)
        captcha = str(uuid.uuid4())[first:first + 6]
        message.html = render_template('email_temp.html', captcha=captcha)
        mail.send(message)
        return '0'
    except:
        return '1'


if __name__ == '__main__':
    app.run(use_reloader=False)
