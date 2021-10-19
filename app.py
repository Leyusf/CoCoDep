import datetime
import os
import time
import uuid
import random
from datetime import timedelta
from flask import Flask, render_template, request, jsonify, session, url_for, redirect
from flask_mail import Message, Mail
from flask_sqlalchemy import SQLAlchemy

from tool.tool import validate
from tool.tool import captcha_drop

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
from entity.Education import Education
from entity.Award import Award


models.drop_all()
models.create_all()


def email_send_html(email):
    message = Message(subject='CoCoDep validation', recipients=[email])
    try:
        # 发送渲染一个模板
        first = random.randint(0, 25)
        captcha = str(uuid.uuid4())[first:first + 6]
        session['captcha'] = captcha
        session['captcha_time'] = int(time.time())
        message.html = render_template('email_temp.html', captcha=captcha)
        mail.send(message)
        return True
    except:
        return False


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
        return redirect(url_for('person', email=email))
    return render_template('launch.html')


@app.route('/lor/')
def lor():
    return render_template('lor.html')


@app.route('/login/', methods=['post'])
def login():
    email = request.form.get("email")
    user = User.get(email)
    if user is None or user.match(request.form.get("pwd")) is False:
        # 失败
        return jsonify({"code": -1})
    # 成功
    session['id'] = user.id
    session['email'] = user.email
    session['name'] = user.name
    session['login'] = True
    return jsonify({"code":0})


@app.route('/logout/', methods=['post'])
def logout():
    session['email'] = None
    session['name'] = None
    session['id'] = None
    session['login'] = None
    return jsonify({"code": 0})


@app.route('/validate_r/<code>', methods=['POST'])
def validate_r(code):
    if validate(code):
        captcha_drop()
        session['login'] = True
        return jsonify({"code": 0})
    return jsonify({"code": -1})


# 发送一个html
@app.route('/email_captcha/<email>', methods=['POST'])
def send_email(email):
    if email_send_html(email):
        return jsonify({"code": 0})
    return jsonify({"code": -1})


@app.route('/checkUser/', methods=['post'])
def checkUser():
    email = request.form.get("email")
    name = request.form.get("name")
    pwd = request.form.get("pwd")
    user = User.get(email)
    if user is not None:
        return jsonify({"code": -1})
    if email_send_html(email):
        session['name'] = name
        session['email'] = email
        session['pwd'] = pwd
        session['role'] = request.form.get("role")
        return jsonify({"code": 0})
    else:
        return jsonify({"code": -2})


@app.route('/register/<code>', methods=['post'])
def register(code):
    if validate(code) is False:
        return jsonify({"code": -1})
    captcha_drop()
    user = User(session['email'], session['name'], session['pwd'], session['role'])
    user.put()
    print(user.email)
    user = User.get(session['email'])
    print(user.sign)
    session['id'] = user.id
    session['pwd'] = None
    session['login'] = True
    return jsonify({"code": 0})


@app.route('/ps/<email>/', methods=['post', 'get'])
def person(email):
    return render_template('ps.html', email=email, name=User.get(email).name)


@app.route('/personal/<email>/', methods=['post', 'get'])
def personalization(email):
    flag = 0
    if 'email' in session and str(session['email']) == str(email):
        flag = 1
    user = User.get(email)
    return render_template('personal.html', email=email, name=user.name, sign=user.sign,
                           pic=str(user.headpic)[2:-1], flag=flag)


@app.route('/resume/<email>/', methods=['post', 'get'])
def resume(email):
    flag = 0
    if 'email' in session and str(session['email']) == str(email):
        flag = 1
    user = User.get(email)
    education = Education.getRecordByEmail(email)
    award = Award.getRecordByEmail(email)
    return render_template('resume.html', email=email, name=user.name, education=education, birth=user.birth,
                           pic=str(user.headpic)[2:-1], baddress=user.birthaddress, waddress=user.workaddress,
                           flag=flag, numE=len(education), award=award, numA=len(award))


@app.route('/modify/')
def modify():
    email = session['email']
    user = User.get(email)
    return render_template('modify.html', email=email, name=user.name, pic=str(user.headpic)[2:-1])


@app.route('/upInfo/')
def upInfo():
    email = session['email']
    user = User.get(email)
    education = Education.getRecordByEmail(email)
    award = Award.getRecordByEmail(email)
    return render_template('upInfo.html', birthday=user.birth, badd=user.birthaddress, wadd=user.workaddress, sign=user.sign)


@app.route('/update/', methods=['post'])
def update():
    time = request.form.get("time")
    badd = request.form.get("badd")
    wadd = request.form.get("wadd")
    sign = request.form.get("sign")
    email = session['email']
    user = User.get(email)
    user.birth = time
    user.birthaddress = badd
    user.workaddress = wadd
    user.sign = sign
    models.session.commit()
    return redirect(url_for("upInfo"))


@app.route('/education/')
def education():
    return render_template('education.html')


if __name__ == '__main__':
    app.run(use_reloader=False)
