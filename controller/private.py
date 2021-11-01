from flask import url_for, redirect, send_from_directory, Blueprint, render_template, session, request, jsonify

from app import models
from entity.Module import Module
from entity.Resource import Resource
from entity.Task import Task
from entity.User import User

private = Blueprint("private", __name__)


@private.before_request
def before():
    if not session.get('login'):
        return 'Please log in'


@private.route('/modify/')
def modify():
    email = session['email']
    user = User.get(email)
    return render_template('modify.html', email=email, name=user.name, pic=str(user.headpic)[2:-1])


@private.route('/upInfo/')
def upInfo():
    email = session['email']
    user = User.get(email)
    return render_template('upInfo.html', wadd=user.workaddress, sign=user.sign, exp=user.experience)


@private.route('/update/', methods=['post'])
def update():
    exp = request.form.get("exp")
    wadd = request.form.get("wadd")
    sign = request.form.get("sign")
    email = session['email']
    user = User.get(email)
    user.experience = exp
    user.workaddress = wadd
    user.sign = sign
    models.session.commit()
    return redirect(url_for("private.upInfo"))


@private.route('/module/', methods=['get'])
def module():
    user = User.get(session['email'])
    if user.role == 1:  # teachers
        module = Module.get(session['email'])
        if module is None:  # No module
            return render_template('module.html', role=user.role, act=0, email=user.email)
        else:
            return render_template('module.html', role=user.role, act=1, email=user.email)
    else:
        # 查询学生的课程
        return


@private.route('/task/', methods=['get'])
def task():
    user = User.get(session['email'])
    if user.role == 1:  # teachers
        module = Module.get(session['email'])
        if module is None:  # No module
            return redirect(url_for('private.module'))
        else:
            return render_template('tasksPage.html', role=user.role, email=user.email)
    else:
        # 查询学生的任务
        return


@private.route('/createM/', methods=['get'])
def createM():
    if session['role'] == 1:
        return render_template('createM.html')
    else:
        return "You have no power to do this"


@private.route('/createModule/', methods=['post'])
def createModule():
    if session['role'] != 1:
        return
    name = request.form.get("name")
    module = Module(session['email'], name)
    module.put()
    return redirect(url_for("private.innerModule"))


@private.route('/m/teacher/', methods=['get'])
def innerModule():
    if session['role'] != 1:
        return "You have no power to do this"
    email = session['email']
    module = Module.get(email)
    file_list = Resource.getAllByModule(module.id)
    return render_template('moduleInner.html', email=email, module=module, leader=session['name'], lr=file_list)


@private.route('/upload/', methods=['get'])
def uploadView():
    if session['role'] != 1:
        return "You have no power to do this"
    return render_template('up.html')


@private.route('/uploadFile/', methods=['post'])
def uploadFile():
    if session['role'] != 1:
        return "You have no power to do this"
    file_list = request.files.getlist('files[]')
    mid = Module.get(session['email']).id
    names = [i.name for i in Resource.getAllByModule(mid)]
    for i in file_list:
        if i.filename in names:
            continue
        resource = Resource(mid, i)
        resource.put()
    return jsonify({'code': '0'})


@private.route('/download/<id>/', methods=['get', 'post'])
def download(id):
    file = Resource.get(id)
    return send_from_directory(file.realpath, file.name, as_attachment=True)  # as_attachment=True 一定要写，不然会变成打开，而不是下载


@private.route('/downloadTask/<id>/', methods=['get', 'post'])
def downloadTask(id):
    task = Task.get(id)
    return send_from_directory(task.realpath, task.name, as_attachment=True)  # as_attachment=True 一定要写，不然会变成打开，而不是下载


@private.route('/delete/', methods=['post'])
def delete():
    if session['role'] != 1:
        return "You have no power to do this"
    id = request.form.get('id')
    file = Resource.get(id)
    if file is None:
        return jsonify({'code': '1'})
    file.dele()
    return jsonify({'code': '0'})


@private.route('/deleteModule/', methods=['post'])
def deleteModule():
    if session['role'] != 1:
        return "You have no power to do this"
    module = Module.get(session['email'])
    module.dele()
    return jsonify({'code': 0})


@private.route('/tasksList/', methods=['get'])
def tasksList():
    if session['role'] != 1:
        return "You have no power to do this"
    email = session['email']
    module = Module.get(email)
    tasks = Task.getAllByModule(module.id)
    return render_template('taskList.html', email=email, module=module, leader=session['name'], tasks=tasks)


@private.route('/deleteTask/', methods=['post'])
def deleteTask():
    if session['role'] != 1:
        return "You have no power to do this"
    id = request.form.get('id')
    task = Task.get(id)
    if task is None:
        return jsonify({'code': '1'})
    task.dele()
    return jsonify({'code': '0'})


@private.route('/tasksCreatePage/', methods=['get'])
def tasksCreatePage():
    if session['role'] != 1:
        return "You have no power to do this"
    return render_template("taskCreatePage.html")


@private.route('/createTask/', methods=['post'])
def createTask():
    name = request.form.get('name')
    des = request.form.get('des')
    file = request.files.get('file')
    st = request.form.get('startTime')
    et = request.form.get('endTime')
    member = request.form.get('member')
    group = request.form.get('group')
    print(file)
    print("M: "+member)
    print("G: "+group)
    module = Module.get(session['email'])
    task = Task(module.id, name, st, et, des, file)
    task.put()
    tasks = Task.getAllByModule(module.id)
    return redirect(url_for('private.tasksList', email=session['email'], module=module, leader=session['name'], tasks=tasks))
