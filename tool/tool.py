from flask import session


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
