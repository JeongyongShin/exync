from django.shortcuts import render

# Create your views here.

import app.apps as app

from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from django.core.exceptions import PermissionDenied
from datetime import datetime
import time

from django.contrib import auth
from account.models import User
from models.smartfactory import Common
from Crypto.PublicKey import RSA

from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password

import random
import string

##################################################################
##      VIEW        ##
##################################################################
def login(request):
    if request.method == 'GET':
        return render(request, 'login.html')
    if request.method == 'POST':
        userId = request.POST['userId']
        password = request.POST['password']
        #key = request.POST['key']
        #f = open('/opt/apps/django/private.key','r')
        #r=RSA.importKey(f.read())
        user = auth.authenticate(request, user_id=userId, password=password)
        if user is not None:
            auth.login(request, user)
            app.saveLoginLog(userId, app.get_client_ip(request), 1)
            return JsonResponse({'code': 100, 'message': 'SUCCESS'})
        else:
            app.saveLoginLog(userId, app.get_client_ip(request), -1)
            return JsonResponse({'code': -1, 'message': 'FAILURE'})


def logout(request):
    if request.method == 'GET':
        auth.logout(request)
        return HttpResponseRedirect('/')


@login_required
def main(request):
    if request.method == 'GET':
        return render(request, 'home.html', {'controller':'AASXController', 'view':'app.view.viewport.aasx', 'title':'AASX PACKAGE BROWSER'})


@login_required
def monitor(request):
    if request.method == 'GET':
        return render(request, 'home.html', {'controller':'MonitorController', 'view':'app.view.viewport.monitor', 'title':'기기 모니터링', 'url': app.getDashboardUrl(request, '01', '00002')})


@login_required
def history(request):
    if request.method == 'GET':
        return render(request, 'home.html', {'controller':'HistoryController', 'view':'app.view.viewport.history', 'title':'히스토리', 'url': app.getDashboardUrl(request, '01', '00003')})


@login_required
def cloud(request):
    if request.method == 'GET':
        return render(request, 'home.html',{'controller': 'CloudMonitorController', 'view': 'app.view.viewport.cloudmonitor', 'title': '클라우드 상태 모니터링', 'url': app.getDashboardUrl(request, '01', '00001')})


@login_required
def apps(request):
    #print('re '+request.content_type)
    if request.method == 'GET':
        return render(request, request.path[1:], content_type='application/javascript')


@login_required
def alarm(request):
    if request.method == 'GET':
        return render(request, 'home.html', {'controller': 'MonitorController', 'view': 'app.view.viewport.monitor', 'title': 'SYSTEM MONITORING'})


@login_required
def view3d(request):
    if request.method == 'GET':
        return render(request, 'viewer.html', {'aasxNm': request.GET.get('aasxNm'), 'path': request.GET.get('path')})


@login_required
def chart(request):
    if request.method == 'GET':
        return render(request, 'chart.html', {'tagId': request.GET.get('tagId')})

@login_required
def viewDiagram(request):
    if request.method == 'GET':
        return render(request, 'diagram.html', {})


##################################################################
##      USER        ##
##################################################################


def userEdit(request):
    if request.method == 'POST':
        try:
            userId = request.user
            password = request.POST['password']
            newPassword = request.POST['npassword']
            if check_password(password, request.user.password):
                u = User.objects.get(user_id=userId)
                u.set_password(newPassword)
                u.save()
                auth.login(request,u)
                return JsonResponse({'code': 100, 'message': 'SUCCESS'})
            else:
                return JsonResponse({'code': -1, 'message': 'FAILURE'})
        except Exception as e:
            print(e)
            return JsonResponse({'code': -1, 'message': 'ERROR'})


def userAPIEdit(request):
    if request.method == 'POST':
        try:
            userId = request.user
            nApiKey = ''.join((random.choice(string.ascii_letters + string.digits) for i in range(50))).upper()
            u = User.objects.get(user_id=userId)
            u.api_key = nApiKey
            u.save()
            return JsonResponse({'code': 100, 'message': nApiKey})
        except Exception as e:
            print(e)
            return JsonResponse({'code': -1, 'message': 'ERROR'})

##################################################################
##      COMMON        ##
##################################################################


def getCommonList(request):
    if request.method == 'GET':
        return JsonResponse(app.getCommon(request.GET))


def editCommon(request):
    if request.method == 'POST':
        return JsonResponse(app.editCommon(request.POST))
