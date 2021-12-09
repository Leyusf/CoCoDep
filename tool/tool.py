import random

from flask import session
import time
import os


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
