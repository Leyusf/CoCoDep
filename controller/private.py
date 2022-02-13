import os
import pathlib

import xlrd
from flask import url_for, redirect, send_from_directory, Blueprint, render_template, session, request, jsonify
from flask_socketio import emit, join_room, leave_room, rooms

from app import models, app, organizationName, organizationInfo, organizationEmail, socketio
from entity.File import Record
from entity.Group import Group
from entity.GroupMember import GroupMember as GM
from entity.Module import Module
from entity.Path import Path
from entity.Task import Task
from entity.User import User
from entity.ModuleStudent import MSTable as MS
from tool.tool import randomGroup, mkdir, get_files, isExisted, getAllChildren, now

private = Blueprint("private", __name__)


# @private.before_request
# def before():
#     if not session.get('login'):
#         return 'Please log in'


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
        for module in modules:
            module.leader = user.name
        return render_template('module.html', role=user.role, modules=modules, email=user.email, name=user.name,
                               Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)
    else:
        # 查询学生的课程
        modules = [Module.getById(i.MID) for i in MS.getModulesByEmail(session['email'])]
        modules.sort(key=lambda m: m.email)
        for module in modules:
            module.leader = User.get(module.email).name
        return render_template('module.html', role=user.role, modules=modules, email=user.email, name=user.name,
                               Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


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
                j.leader = user.name
                tasks.append(j)
        tasks.sort(key=lambda t: t.end, reverse=True)
        return render_template('tasksPage.html', role=user.role, name=user.name, email=user.email, tasks=tasks,
                               Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)
    else:
        # 查询学生的任务
        modules = MS.getModulesByEmail(session['email'])
        tasks = []
        for module in modules:
            leader = User.get(Module.getById(module.MID).email).name
            name = Module.getById(module.MID).name
            for task in Task.getAllByModule(module.MID):
                task.module = name
                task.leader = leader
                tasks.append(task)
        tasks.sort(key=lambda t: t.end, reverse=True)
        return render_template('tasksPage.html', role=user.role, name=user.name, email=user.email, tasks=tasks,
                               Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


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


@private.route('/moduleInfo/<id>/<int:page>', methods=['get'])
def moduleInfo(id, page):
    if session['role'] != 1:
        # student
        modu = Module.getById(id)
        leader = User.get(modu.email)
        tasks = Task.getAllByModule(id)
        students = [User.get(i.email) for i in MS.getAllByModule(id)]
        num_students = len(students)
        return render_template('moduleInfo.html', role=0, tasks=tasks, module=modu, leader=leader.name,
                               Oemail=organizationEmail, num_students=num_students, Oname=organizationName,
                               Oinfo=organizationInfo)
    if not page:
        page = 1
    modu = Module.getById(id)
    user = User.get(modu.email)
    tasks = []
    students = [User.get(i.email) for i in MS.getAllByModule(id)]
    num_students = len(students)
    students = sorted(students, key=lambda student: student.id)
    per_page = 8
    num_page = int(len(students) / per_page)
    if len(students) == 0:
        num_page += 1
    if len(students) % per_page != 0:
        num_page += 1
    students = students[(page - 1) * per_page:page * per_page]
    ts = Task.getAllByModule(modu.id)
    for j in ts:
        j.module = Module.getById(j.MID).name
        tasks.append(j)
    return render_template('moduleInfo.html', tasks=tasks, module=modu, leader=user.name, students=students, page=page,
                           num_page=num_page, num_students=num_students, role=1, Oname=organizationName,
                           Oinfo=organizationInfo, Oemail=organizationEmail)


@private.route('/upload/', methods=['get'])
def uploadView():
    if session['role'] != 1:
        return "You have no power to do this"
    return render_template('up.html')


@private.route('/downloadTask/<id>/', methods=['get', 'post'])
def downloadTask(id):
    task = Task.get(id)
    return send_from_directory(task.realpath, task.filename,
                               as_attachment=True)  # as_attachment=True 一定要写，不然会变成打开，而不是下载


@private.route('/delete/', methods=['post'])
def delete():
    if session['role'] != 1:
        return "You have no power to do this"
    id = request.form.get('id')
    modu = Module.getById(id)
    if modu is None:
        return jsonify({'code': '-1', 'msg': 'Module does not exist'})
    for i in MS.getAllByModule(modu.id):
        i.dele()
    modu.dele()
    return jsonify({'code': '0', 'msg': 'Delete succeeded'})


@private.route('/deleteTask/', methods=['post'])
def deleteTask():
    if session['role'] != 1:
        return "You have no power to do this"
    id = request.form.get('id')
    task = Task.get(id)
    if task is None:
        return jsonify({'code': '-1', 'msg': 'There is no this task'})
    task.dele()
    return jsonify({'code': '0', 'msg': 'Delete succeeded'})


@private.route('/tasksCreate/<mid>', methods=['get'])
def createTaskPage(mid):
    if session['role'] != 1:
        return "You have no power to do this"
    studentsNum = len(MS.getAllByModule(mid))
    return render_template("newTask.html", mid=mid, studentNum=studentsNum, email=session['email'],
                           Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@private.route('/tasksCreatePage/<mid>', methods=['get'])
def tasksCreatePage(mid):
    if session['role'] != 1:
        return "You have no power to do this"
    studentsNum = len(MS.getAllByModule(mid))
    return render_template("taskCreatePage.html", mid=mid, studentNum=studentsNum)


@private.route('/createTask/', methods=['post'])
def createTask():
    mid = request.form.get('mid').strip()
    name = request.form.get('name').strip()
    des = request.form.get('des').strip()
    file = request.files.get('file')
    st = request.form.get('startTime')
    et = request.form.get('endTime')
    member_b = request.form.get('member').strip()[0:-1].split(",")
    group_b = request.form.get('group').strip()[0:-1].split(",")
    if file is None or file.filename is "":
        file = None
    task = Task.getByName(name)
    if task is None:
        task = Task(mid, name, st, et, des, file)
        task.put()
        students = MS.getAllByModule(mid)
        res = randomGroup(group_b, member_b, students)
        for i in res:
            group = Group(task.id)
            group.put()
            for j in i:
                member = GM(group.id, students[j].email)
                member.put()
        return jsonify({'code': 0, 'msg': 'Created successfully'})
    return jsonify({'code': -1, 'msg': 'Task already exists'})


# test for students
@private.route('/students/', methods=['post'])
def addStudent():
    file = request.files.get('file')
    mid = request.form.get('mid')
    filetype = file.filename.split(".")[-1]
    if filetype != 'xls':
        return jsonify({'code': -1, 'msg': 'error format'})
    f = file.read()  # 文件内容
    data = xlrd.open_workbook(file_contents=f)
    table = data.sheets()[0]
    nrows = table.nrows  # 获取该sheet中的有效行数
    if table.ncols != 2:
        return jsonify({'code': -1, 'msg': 'the file should only have two columns which are name and email, then and '
                                           'no indicated row'})
    students = []
    try:
        for i in range(nrows):
            row = table.row_values(i)
            student = []
            for text in row:
                text = str(text).strip()
                student.append(text)
            students.append(student)
    except:
        return jsonify({'code': -1, 'msg': 'the file should only have two columns which are name and email, then and '
                                           'no indicated row'})
    for i in students:
        user = User.get(i[1])
        if user is None or user.role == 1:
            continue
        if MS.get(mid, i[1]) is None:
            ms = MS(mid, i[1])
            ms.put()
    return jsonify({'code': 0, 'msg': 'Import Successfully'})


@private.route('/updateEndTime/', methods=['post'])
def updateEndTime():
    id = request.form.get('id')
    endTime = request.form.get('end')
    task = Task.get(id)
    task.end = endTime
    models.session.commit()
    return jsonify({'code': '0', 'msg': task.end.strftime("%Y-%m-%d")})


@private.route('/updateFile/', methods=['post'])
def updateFile():
    id = request.form.get('id')
    file = request.files.get('file')
    task = Task.get(id)
    if task.realpath is None or task.realpath == "":
        task.realpath = os.path.join(app.root_path, str(task.id))
        mkdir(task.realpath)
        path = os.path.join(task.realpath, file.filename)
        file.save(path)
        task.filename = file.filename
    else:
        path = os.path.join(task.realpath, file.filename)
        os.remove(os.path.join(task.realpath, task.filename))
        file.save(path)
    task.filename = file.filename
    models.session.commit()
    return jsonify({'code': '0', 'msg': task.filename})


@private.route('/updateDes/', methods=['post'])
def updateDes():
    id = request.form.get('id')
    des = request.form.get('des')
    task = Task.get(id)
    task.des = des
    models.session.commit()
    return jsonify({'code': '0'})


@private.route('/taskInfo/<id>/<int:page>', methods=['get'])
def taskInfo(id, page):
    if not page:
        page = 1
    task = Task.get(id)
    modu = Module.getById(task.MID)
    modu.leader = User.get(modu.email).name
    if session['role'] == 1:
        # teachers
        groups = Group.getByTask(id)
        num_groups = len(groups)
        groups = sorted(groups, key=lambda groups: groups.id)
        per_page = 8
        num_page = int(len(groups) / per_page)
        if len(groups) == 0:
            num_page += 1
        if len(groups) % per_page != 0:
            num_page += 1
        groups = groups[(page - 1) * per_page:page * per_page]
        for group in groups:
            group.number = len(GM.getAllByGroup(group.id))
        return render_template("taskInfo_teacher.html", task=task, groups=groups, module=modu, role=1,
                               num_groups=num_groups, page=page, num_page=num_page, email=session['email'],
                               Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)
    # students
    groups = Group.getByTask(id)
    num_groups = len(groups)
    thisGroup = None
    for group in groups:
        if GM.get(group.id, session['email']):
            thisGroup = group
    groupMembers = [User.get(i.email) for i in GM.getAllByGroup(thisGroup.id)]
    return render_template("taskInfo_teacher.html", task=task, module=modu, role=0, group=thisGroup,
                           members=groupMembers, num_groups=num_groups, email=session['email'],
                           Oname=organizationName, Oinfo=organizationInfo, Oemail=organizationEmail)


@private.route('/workspace/<id>/')
def workSpace(id):
    group = Group.get(id)
    task = Task.get(group.TID)
    user = User.get(session['id'])
    pathname = "T" + str(task.id) + "G" + str(group.id)
    mkdir(pathname)
    realPath = os.path.join(app.root_path, pathname)
    path = Path.getByName(pathname)
    if path is None:
        path = Path(id, pathname, realPath, root=True)
        path.put()
    groupMemberEmail = [i.email for i in GM.getAllByGroup(id)]
    groupMember = []
    results = getAllChildren(path)
    for i in groupMemberEmail:
        if i != session['email']:
            groupMember.append(User.get(i).name)
    return render_template('workSpace.html', taskName=task.name, gid=id, user=user, members=groupMember, root=path,
                           content=results)


@private.route("/newPath/", methods=['POST'])
def newPath():
    rid = request.form.get('rid')
    gid = request.form.get('gid')
    root = Path.get(rid)
    pathName = request.form.get('name')
    if root is None:
        return jsonify({'code': -1})
    paths = root.getTotalPath()
    realPath = app.root_path
    for i in paths:
        realPath = os.path.join(realPath, i)
    if isExisted(pathName, realPath):
        return jsonify({'code': -1})
    realPath = os.path.join(realPath, pathName)
    mkdir(realPath)
    path = Path(gid, pathName, realPath, lastid=rid)
    path.put()
    return jsonify({'code': 0})


@private.route("/newFile/", methods=['POST'])
def newFile():
    rid = request.form.get('rid')
    name = request.form.get('name')
    root = Path.get(rid)
    if root is None:
        return jsonify({'code': -1})
    realPath = app.root_path
    paths = root.getTotalPath()
    for i in paths:
        realPath = os.path.join(realPath, i)
    if isExisted(name, realPath):
        return jsonify({'code': -1})
    realPath = os.path.join(realPath, name)
    record = Record(name, realPath, rid)
    record.put()
    pathlib.Path(realPath).touch()
    root.number += 1
    return jsonify({'code': 0})


@private.route("/addFile/", methods=['POST'])
def addFile():
    rid = request.form.get('rid')
    file = request.files.get('file')
    root = Path.get(rid)
    if root is None:
        return jsonify({'code': -1})
    realPath = app.root_path
    paths = root.getTotalPath()
    for i in paths:
        realPath = os.path.join(realPath, i)
    if isExisted(file.filename, realPath):
        return jsonify({'code': -1})
    realPath = os.path.join(realPath, file.filename)
    record = Record(file.filename, realPath, rid)
    record.put()
    file.save(realPath)
    root.number += 1
    return jsonify({'code': 0})


@socketio.on('send_voice', namespace='/socket')
def on_send_voice(data):
    voice = data['file']
    gid = data['gid']
    uid = data['uid']
    emit('voice', {'name': session['name'], 'voice': voice}, room=session['room'])


@private.route('/checkChildrenPaths/', methods=['POST'])
def checkChildrenPaths():
    id = request.form.get('id')
    path = Path.get(id)
    results = getAllChildren(path)
    return jsonify({'paths': results})


@private.route('/deleteFile/', methods=['POST'])
def deleteFile():
    id = request.form.get('id')
    file = Record.get(id)
    if file is None:
        return jsonify({'code': -1})
    root = Path.get(file.pathid)
    root.number -= 1
    file.dele()
    return jsonify({'code': 0})


@private.route('/deletePath/', methods=['POST'])
def deletePath():
    id = request.form.get('id')
    path = Path.get(id)
    if path is None:
        return jsonify({'code': -1})
    root = Path.get(path.lastid)
    root.number -= 1
    Path.deleAll(id)
    return jsonify({'code': 0})


@private.route('/goTo/', methods=['POST'])
def goTo():
    rid = request.form.get('rid')
    path = Path.get(rid)
    lastid = 0
    if path.lastid is not None:
        lastid = path.lastid
    root = {'id': path.id, 'name': path.name, 'type': 'path'}
    return jsonify({'root': root, 'lastID': lastid})


@socketio.on('join', namespace='/socket')
def on_join(data):
    room = data['gid']
    session['room'] = room
    join_room(room)
    emit('sysMsg', {'data': session['name'] + ' joins the room.'}, room=room)


@socketio.on('disconnect', namespace='/socket')
def on_disconnect():
    room = session['room']
    leave_room(room)
    emit('sysMsg', {'data': session['name'] + ' leaves the room.'}, room=room)


@socketio.on('send', namespace='/socket')
def on_send(data):
    room = session['room']
    emit('receive', {'msg': data['msg'], 'uid': data['uid'], 'name': data['name']}, room=room)


@socketio.on('readAction', namespace='/socket')
def on_read(data):
    room = session['room']
    fid = data['id']
    file = Record.get(fid)
    try:
        f = open(file.realpath, 'r', encoding='GBK').read()
        emit('readText', {'content': f, 'id': fid}, room=room)
    except OSError as reason:
        print('Error: %s' % str(reason))


@socketio.on('writeAction', namespace='/socket')
def on_write(data):
    room = session['room']
    fid = data['fid']
    content = data['content']
    file = Record.get(fid)
    try:
        text = open(file.realpath, 'r', encoding='GBK').read()
        if data['operation'] is 1:
            text = text[:data['start']] + content + text[data['start']:]
        elif data['operation'] is 0:
            text = text[:data['start']] + content + text[data['end']:]
        else:
            text = text[:data['start']] + content + text[data['end']:]
        open(file.realpath, 'w', encoding='GBK').write(text)
        emit('readChange', {'content': content, 'fid': fid, 'uid': data['uid'],
                            'start': data['start'], 'end': data['end'], 'operation': ['operation']}, room=room)
    except OSError as reason:
        print('Error: %s' % str(reason))


@socketio.on('folderChange', namespace='/socket')
def on_folder_change(data):
    emit('folder', {'id': data['id']}, room=session['room'])
