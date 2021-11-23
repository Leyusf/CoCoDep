from flask import url_for, redirect, send_from_directory, Blueprint, render_template, session, request, jsonify

from app import models
from entity.Module import Module
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
    return render_template('upInfo.html', wadd=user.workaddress, exp=user.experience)


@private.route('/update/', methods=['post'])
def update():
    exp = request.form.get("exp")
    wadd = request.form.get("wadd")
    pwd = request.form.get("pwd")
    email = session['email']
    user = User.get(email)
    user.experience = exp
    user.workaddress = wadd
    if pwd != "":
        user.set_password(pwd)
    models.session.commit()
    return redirect(url_for("private.upInfo"))


@private.route('/module/', methods=['get'])
def module():
    user = User.get(session['email'])
    if user.role == 1:  # teachers
        modules = Module.get(session['email'])
        return render_template('module.html', role=user.role, modules=modules, email=user.email, name=user.name)
    else:
        # 查询学生的课程
        return


@private.route('/task/', methods=['get'])
def task():
    user = User.get(session['email'])
    if user.role == 1:  # teachers
        modules = Module.get(session['email'])
        tasks = []
        for i in modules:
            ts = Task.getAllByModule(i.id)
            for j in ts:
                j.module = Module.getById(j.MID).name
                tasks.append(j)
        return render_template('tasksPage.html', role=user.role, name=user.name, email=user.email, tasks=tasks)
    else:
        # 查询学生的任务
        return


@private.route('/createModule/', methods=['post'])
def createModule():
    if session['role'] != 1:
        return "You have no power to do this"
    name = request.form.get("name").strip()
    id = request.form.get("id").strip()
    if id is "" or name is "":
        return jsonify({'code': -1, 'msg': 'Module code and name can be empty'})
    if len(id) > 10:
        return jsonify({'code': -1, 'msg': 'Module code needs to be less than ten characters'})
    m_id = Module.getById(id)
    m_name = Module.getByName(name)
    if m_name is None and m_id is None:
        module = Module(id, session['email'], name)
        module.put()
        return jsonify({'code': 0, 'msg': 'Successfully create'})
    if m_name is not None:
        return jsonify({'code': -1, 'msg': 'Module name already exists'})
    return jsonify({'code': -1, 'msg': 'Module code already exists'})


@private.route('/moduleInfo/<id>/', methods=['get'])
def moduleInfo(id):
    modu = Module.getById(id)
    user = User.get(modu.email)
    tasks = []
    students = [User.get('1911663703@qq.com')]
    ts = Task.getAllByModule(modu.id)
    for j in ts:
        j.module = Module.getById(j.MID).name
        tasks.append(j)
    return render_template('moduleInfo.html', tasks=tasks, module=modu, leader=user.name, students=students)


@private.route('/upload/', methods=['get'])
def uploadView():
    if session['role'] != 1:
        return "You have no power to do this"
    return render_template('up.html')


@private.route('/downloadTask/<id>/', methods=['get', 'post'])
def downloadTask(id):
    task = Task.get(id)
    return send_from_directory(task.realpath, task.name, as_attachment=True)  # as_attachment=True 一定要写，不然会变成打开，而不是下载


@private.route('/delete/', methods=['post'])
def delete():
    if session['role'] != 1:
        return "You have no power to do this"
    id = request.form.get('id')
    modu = Module.getById(id)
    if modu is None:
        return jsonify({'code': '-1', 'msg': 'Module does not exist'})
    modu.dele()
    return jsonify({'code': '0', 'msg': 'Delete succeeded'})


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


@private.route('/tasksCreate/<mid>', methods=['get'])
def createTaskPage(mid):
    if session['role'] != 1:
        return "You have no power to do this"
    return render_template("newTask.html", mid=mid, studentNum=75)


@private.route('/tasksCreatePage/<mid>', methods=['get'])
def tasksCreatePage(mid):
    if session['role'] != 1:
        return "You have no power to do this"
    return render_template("taskCreatePage.html", mid=mid, studentNum=75)


@private.route('/createTask/', methods=['post'])
def createTask():
    mid = request.form.get('mid').strip()
    name = request.form.get('name').strip()
    des = request.form.get('des').strip()
    file = request.files.get('file')
    st = request.form.get('startTime')
    et = request.form.get('endTime')
    member = request.form.get('member').strip()
    group = request.form.get('group').strip()
    print("M: " + member)
    print("G: " + group)
    if file is None or file.filename is "":
        file = None
    task = Task.getByName(name)
    if task is None:
        task = Task(mid, name, st, et, des, file)
        task.put()
        return jsonify({'code': 0, 'msg': 'Created successfully'})
    return jsonify({'code': -1, 'msg': 'Task already exists'})


@private.route('/taskInfo/<id>/', methods=['get'])
def taskInfo(id):
    pass
