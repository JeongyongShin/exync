from django.contrib import admin
from django.urls import path

from django.shortcuts import redirect
from django.http import Http404

import app.views
import aas.views
import aas_rest.views

def interceptor(request):
    if request.user.is_authenticated : # 로그인
        ## page
        if request.path == '/':
            if request.user.is_admin :
                return app.views.main(request)
            else:
                return app.views.monitor(request)
        elif request.path == '/main':
            return redirect('/')
        elif request.path == '/server':
            return app.views.cloud(request)

        elif request.path == '/monitor':
            return app.views.monitor(request)
        elif request.path == '/history':
            return app.views.history(request)
        elif request.path.find('/app/') == 0:
            return app.views.apps(request)
        elif request.path == '/3dview':
            return app.views.view3d(request)
        elif request.path == '/dgview':
            return app.views.viewDiagram(request)
        elif request.path == '/chart':
            return app.views.chart(request)


        ## user
        elif request.path == '/user/edit' and request.method == 'POST':
            return app.views.userEdit(request)
        elif request.path == '/user/edit/api' and request.method == 'POST':
            return app.views.userAPIEdit(request)
        elif request.path == '/logout':
            return app.views.logout(request)

        ## aas
        elif request.path == '/aasx':
            return aas.views.aasxData(request)
        elif request.path == '/aasx/add' and request.method == 'POST':
            return aas.views.aasxAdd(request)
        elif request.path == '/aasx/edit' and request.method == 'POST':
            return aas.views.aasxEdit(request)
        elif request.path == '/aasx/del' and request.method == 'POST':
            return aas.views.aasxDelete(request)
        elif request.path == '/aasx/tree':
            return aas.views.aasxTree(request)
        elif request.path == '/aasx/thumbnail':
            return aas.views.aasxThumbnail(request)
        elif request.path == '/aasx/file':
            return aas.views.aasxFile(request)
        elif request.path == '/aasx/file/download':
            return aas.views.aasxFileDownload(request)
        elif request.path == '/aasx/download':
            return aas.views.aasxDownload(request)
        elif request.path == '/aasx/list':
            return aas.views.aasxList(request)
        elif request.path == '/aasx/search':
            return aas.views.aasxSearch(request)
        elif request.path == '/aasx/upload':
            return aas.views.aasxUpload(request)
        elif request.path == '/aasx/deploy':
            return aas.views.opcuaDeploy(request)
        elif request.path == '/aasx/opcua':
            return aas.views.aasxtoopcua(request)
        elif request.path == '/aasx/eclass/list':
            return aas.views.eclassList(request)
        elif request.path == '/test':
            return aas.views.test(request)

        ## common
        elif request.path == '/comm/list':
            return app.views.getCommonList(request)
        elif request.path == '/comm/edit':
            return app.views.editCommon(request)

        ## api
        elif request.path == '/api/aas/packages':
            return aas.views.aasRestApi_getAASXList(request)
        elif request.path == '/api/aas/packages/edit':
            return aas.views.aasRestApi_exportAASX(request)
        elif request.path == '/opcua/deploy':
            return aas.views.opcuaDeploy(request)
        elif request.path == '/api/tag':
            return aas_rest.views.Tag(request)
        elif request.path == '/api/meta':
            return aas_rest.views.Meta(request)

        else:
            raise Http404('NOT FOUND URLS')

    else: #비로그인
        if request.path == '/' or (request.path == '/login' and request.method == 'POST'):
            return app.views.login(request)
        elif request.path == '/login' or request.path == '/main':
            return redirect('/')
        elif request.path == '/opcua/deploy':
            return aas.views.opcuaDeploy(request)
        elif request.path == '/api/tag':
            return aas_rest.views.Tag(request)
        elif request.path == '/api/meta':
            return aas_rest.views.Meta(request)
        else:
            raise Http404('USER AUTHENTICATION FAIL')

def grafana(request):
    print(request.path)
    if request.user.is_authenticated : # 로그인
        raise Http404('USER AUTHENTICATION FAIL')
    else:  # 비로그인
        raise Http404('USER AUTHENTICATION FAIL')
