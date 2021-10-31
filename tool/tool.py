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
