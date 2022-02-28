import random
import datetime
import zipfile

from flask import session
import time
import os

from entity.File import Record


def validate(code):
    if session['captcha'] is None:
        return False
    ac_time = session['captcha_time'] + 10 * 60
    if session['captcha_time'] >= ac_time or str(code) != str(session['captcha']):
        return False
    return True


def captcha_drop():
    session['captcha'] = None
    session['captcha_time'] = None


def TimeStampToTime(timestamp):
    timeStruct = time.localtime(timestamp)
    return time.strftime('%Y-%m-%d %H:%M:%S', timeStruct)


def get_FileSize(filePath):
    fsize = os.path.getsize(filePath)
    fsize = fsize / float(1024)
    return round(fsize, 0)


def get_FileCreateTime(filePath):
    t = os.path.getctime(filePath)
    return TimeStampToTime(t)


def mkdir(path):
    folder = os.path.exists(path)
    if not folder:  # 判断是否存在文件夹如果不存在则创建为文件夹
        os.makedirs(path)  # makedirs 创建文件时如果路径不存在会创建这个路径


def get_files(root):
    paths = []
    for path in os.listdir(root):
        if os.path.isfile(os.path.join(root, path)):
            paths.append({'path': path, 'empty': True, 'type': 'file'})
        elif os.listdir(os.path.join(root, path)) is not None:
            paths.append({'path': path, 'empty': True, 'type': 'path'})
        else:
            paths.append({'path': path, 'empty': False, 'type': 'path'})
    return paths


def randomGroup(groupList, memberList, totalList):
    '''
    :param groupList: 3,2
    :param memberList: 2,3
    :param totalList: 9
    :return: [[1,2],[3,4],[5,6],[7,8,9]]
    '''
    num = [i for i in range(len(totalList))]
    random.shuffle(num)
    header = 0
    res = []
    for i in range(len(groupList)):
        num_member = int(memberList[i])  # 2
        num_group = int(groupList[i])  # 3
        for j in range(num_group):
            group = num[header:header + num_member]
            header += num_member
            res.append(group)
    return res


def isExisted(name, path):
    if name in os.listdir(path):
        return True
    return False


def getAllChildren(path):
    paths = path.getChildren()
    files = Record.getRecordByPath(path.id)
    results = []
    for i in paths:
        tmp = {'id': i.id, 'name': i.name, 'type': 'path'}
        results.append(tmp)
    for i in files:
        tmp = {'id': i.id, 'name': i.name, 'type': 'file'}
        results.append(tmp)
    return results


def now():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def log(objects, name):
    if objects is None:
        return []
    res = []
    for i in objects:
        res.append(name + " " + i.operation + " " + i.info + " " + i.time)
    return res


def zipDir(startdir, file_news):
    z = zipfile.ZipFile(file_news, 'w', zipfile.ZIP_DEFLATED)  # 参数一：文件夹名
    for dirpath, dirnames, filenames in os.walk(startdir):
        fpath = dirpath.replace(startdir, '')  # 这一句很重要，不replace的话，就从根目录开始复制
        fpath = fpath and fpath + os.sep or ''  # 这句话理解我也点郁闷，实现当前文件夹以及包含的所有文件的压缩
        for filename in filenames:
            z.write(os.path.join(dirpath, filename), fpath + filename)
    z.close()
