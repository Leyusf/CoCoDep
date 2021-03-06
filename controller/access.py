import time
import uuid
import random
from flask import render_template, request, jsonify, session, Blueprint, redirect, url_for
from flask_mail import Message, Mail

from app import models, organizationName, organizationInfo, organizationEmail
from entity.User import User
from tool.tool import validate, captcha_drop

mail = Mail()
access = Blueprint("access", __name__)


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


def email_send_html_ft(email, pwd):
    message = Message(subject='CoCoDep Change Password', recipients=[email])
    try:
        message.html = render_template('email_ft.html', pwd=pwd)
        mail.send(message)
        return True
    except:
        return False


@access.route('/login/', methods=['post'])
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
    session['role'] = user.role
    return jsonify({"code": 0})


@access.route('/logout/', methods=['post', 'get'])
def logout():
    session['email'] = None
    session['name'] = None
    session['id'] = None
    session['login'] = None
    if request.method == 'POST':
        return jsonify({"code": 0})
    else:
        return redirect(url_for('launch', Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail))


@access.route('/validate_r/<code>', methods=['POST'])
def validate_r(code):
    if validate(code):
        captcha_drop()
        session['login'] = True
        return jsonify({"code": 0})
    return jsonify({"code": -1})


@access.route('/validate_f/', methods=['POST'])
def validate_f():
    email = request.form.get('email')
    code = request.form.get('code')
    if validate(code):
        captcha_drop()
        pwd = str(uuid.uuid4())[0:12]
        user = User.get(email)
        user.set_password(pwd)
        email_send_html_ft(email, pwd)
        return jsonify({"code": 0, 'msg': 'reset password successfully'})
    return jsonify({"code": -1, 'msg': 'failed to reset password'})


# 发送一个html
@access.route('/email_captcha/<email>', methods=['POST'])
def send_email(email):
    if email_send_html(email):
        return jsonify({"code": 0})
    return jsonify({"code": -1})


@access.route('/checkUser/', methods=['post'])
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
        session['role'] = int(request.form.get("role"))
        return jsonify({"code": 0})
    else:
        return jsonify({"code": -2})


@access.route('/register/<code>', methods=['post'])
def register(code):
    if validate(code) is False:
        return jsonify({"code": -1})
    captcha_drop()
    user = User(session['email'], session['name'], session['pwd'], session['role'])
    user.put()
    user = User.get(session['email'])
    session['id'] = user.id
    session['pwd'] = None
    session['login'] = True
    return jsonify({"code": 0})


@access.route('/ps/<email>/', methods=['post', 'get'])
def person(email):
    return render_template('ps.html', email=email, name=User.get(email).name, Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@access.route('/personal/<email>/', methods=['post', 'get'])
def personalization(email):
    flag = 0
    if 'email' in session and str(session['email']) == str(email):
        flag = 1
    user = User.get(email)
    return render_template('personal.html', email=email, name=user.name, sign=user.sign, Oname=organizationName,
                           pic=str(user.headpic)[2:-1], flag=flag, Oinfo=organizationInfo, Oemail=organizationEmail)


@access.route('/resume/<email>/', methods=['post', 'get'])
def resume(email):
    flag = 0
    if 'email' in session and str(session['email']) == str(email):
        flag = 1
    user = User.get(email)
    return render_template('resume.html', email=email, name=user.name, pic=str(user.headpic)[2:-1], exp=user.experience,
                           waddress=user.workaddress, flag=flag, Oname=organizationName, Oinfo=organizationInfo,
                           Oemail=organizationEmail)


@access.route('/forget/<email>/', methods=['get'])
def forget(email):
    user = User.get(email)
    if user is None:
        return jsonify({'code': -1, 'msg': 'Email not registered'})
    email_send_html(email)
    return jsonify({'code': 0, 'msg': 'Send successfully'})


@access.route('/setSign/', methods=['post'])
def setSign():
    sign = request.form.get('sign')
    user = User.get(session['email'])
    user.sign = sign
    models.session.commit()
    return jsonify({"msg": sign})
