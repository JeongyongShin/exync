# Create your views here.
import os
import aas.apps as apps

from django.http import HttpResponse
from django.http import StreamingHttpResponse
from django.http import JsonResponse
from django.http import Http404
from django.core import serializers

from aas.aasForm import FileUploadForm
from aas.aasForm import AASXUploadForm


from models.smartfactory import Aasx
from models.smartfactory import Eclass

from django.db.models import Q
from django.core.paginator import Paginator

#test
from .main import AAS2OPCUA


from django.template.context_processors import csrf

PAGE_SIZE = 20


def aasxData(request):
    if request.method == 'GET':
        args = apps.getAASXData(request.user.user_id, request.GET.get('aasxNm'))
        return JsonResponse(args, safe=False)


def aasxTree(request):
    if request.method == 'GET':
        return HttpResponse(apps.getAASXTree(request.user.user_id, request.GET.get('aasxNm'),  request.GET.get('aasSpec')), content_type='text/xml')


def aasxThumbnail(request):
    if request.method == 'GET':
        res = apps.getAASXFile(request.user.user_id, request.GET.get('aasxNm'), request.GET.get('path'))
        return HttpResponse(res, content_type='image/jpeg')


def aasxFile(request):
    if request.method == 'GET':
        mime = apps.getAASXFileMime(request.user.user_id, request.GET.get('aasxNm'), request.GET.get('path'))
        print(mime)
        res = apps.getAASXFile(request.user.user_id, request.GET.get('aasxNm'), request.GET.get('path'))
        return HttpResponse(res, content_type=mime)


def aasxFileDownload(request):
    if request.method == 'GET':
        try:
            mime = apps.getAASXFileMime(request.user.user_id, request.GET.get('aasxNm'), request.GET.get('path'))
            res = apps.getAASXFile(request.user.user_id, request.GET.get('aasxNm'), request.GET.get('path'))
            if res is not None:
                response = HttpResponse(res)
                response['Content-Type'] = mime
                response['Content-Disposition'] = 'attachment; filename=' + request.GET.get('fileNm')
                return response
            else:
                raise Exception()
        except Exception as e:
            print(e)
            raise Http404
        return HttpResponse(res, content_type=mime)

    return


def aasxDownload(request):
    if request.method == 'GET':
        try:
            zip = apps.downloadAASX(request.user.user_id, request.GET.get('aasxNm'))
            print(zip)
            if zip is not None:
                response = HttpResponse(zip.getvalue())
                response['Content-Type'] = 'application/x-zip-compressed'
                response['Content-Disposition'] = 'attachment; filename=' + request.GET.get('aasxNm') + '.aasx'
                return response
            else:
                raise Exception()
        except Exception as e:
            print(e)
            raise Http404



def aasxAdd(request):
    if request.method == 'POST':
        form = AASXUploadForm(request.POST, request.FILES)
        if form.is_valid():
            # apps.addSupplementaryFile(form)
            return JsonResponse(apps.addAASX(request.user.user_id, request.FILES['file'], request.POST['aasxNm'], request.POST['ver'], request.POST['desc']))
        else:
            return JsonResponse({'code': -1, 'message': 'ERROR'})


def aasxEdit(request):
    if request.method == 'POST':
        form = AASXUploadForm(request.POST, request.FILES)
        if form.is_valid():
            print('form true')
            apps.addAASX(request.FILES['file'], request.POST['aasxNm'])
            # apps.addSupplementaryFile(form)
            return JsonResponse({'error': False, 'errors': form.errors})
        else:
            print('form false')
            return JsonResponse({'error': True, 'errors': form.errors})


def aasxDelete(request):
    if request.method == 'POST':
        return JsonResponse(apps.deleteAASX(request.user.user_id, request.POST['aasxNo']))


def aasxList(request):
    if request.method == 'GET':
        return JsonResponse(apps.getAASXList(request.user.user_id, request.GET))


def aasxSearch(request):
    if request.method == 'GET':
        args = {}
        args.update(csrf(request))
        # aasxList = Aasx.objects.all()
        # return JsonResponse({'code': 100, 'items': serializers.serialize('python', aasxList)})
        return HttpResponse(open('resources/data/aasxlist.json').read(), content_type='application/json')

def aasxtoopcua(request):
    if request.method == 'GET':
        try:
            aasxNm = request.GET.get('aasxNm')
            args = apps.getAASXData(request.user.user_id, aasxNm)
            filePath = os.path.abspath('file/'+request.user.user_id+'/'+aasxNm+args['aasSpec'])
            print(os.path.abspath('file/'+request.user.user_id+'/'+aasxNm+args['aasSpec']))
            #os.system('cp -a ' + filePath + ' /opt/cfg/aas/aas.xml')
            os.system('/opt/bin/aas/main.py --aas '+filePath)
            os.system('/opt/bin/aas/syscfg.py --aas '+filePath)
            #os.system('/opt/bin/aas/engineering.py --aas '+filePath)
            #os.system('/opt/bin/regi_cmd.py')
            return JsonResponse({'code':100, 'message':'SUCCESS'}, safe=False)
        except Exception as e:
            print(e)
            raise Http404("ERROR")

#@csrf_exempt
def aasxUpload(request):
    if request.method == 'POST':
        print(request.POST)
        print(request.FILES)
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            print('form true')
            apps.addSupplementaryFile(request.FILES['file'], request.POST['aasxNm'], request.POST['filePath'], request.POST['fileNm'])
            #apps.addSupplementaryFile(form)
            return JsonResponse({'error': False, 'errors': form.errors})
        else:
            print('form false')
            return JsonResponse({'error': True, 'errors': form.errors})


def opcuaDeploy(request):
    if request.method == 'GET':
        try:
            fileNm = request.GET.get('fileNm')
            print(fileNm)
            if fileNm == 'nodeset.xml' or fileNm == 'syscfg.json' or fileNm or 'engineering.csv':
                file = open('/opt/cfg/'+fileNm.replace('/',''), 'rt', encoding='UTF8')
                return HttpResponse(file.read(), content_type='text/plain')
            else:
                return Http404("ERROR")
        except:
            raise Http404("ERROR")


def eclassList(request):
    if request.method == 'GET':
        q = Q()
        if request.GET.get('pName', None) != None:
            q &= Q(pName__icontains=request.GET.get('pName'))
        if request.GET.get('type', None) != None:
            q &= Q(type=request.GET.get('type'))
        eclass = Eclass.objects.filter(q)
        items = serializers.serialize('python',eclass)

        pageNum = int(request.GET.get('page',1)) if int(request.GET.get('page')) > 0 else 1
        page = Paginator(items, PAGE_SIZE).page(pageNum)
        #print(page)
        return JsonResponse({'code': 100, 'items': list(page), 'page':pageNum, 'totalCount':len(items)})


def aasRestApi_getAASXList(request):
    if request.method == 'GET':
        res = apps.AASRestApi_getAASXList(request.GET.get('url'), request.GET.get('id'), request.GET.get('pwd'))
        return JsonResponse(res)


def aasRestApi_exportAASX(request):
    if request.method == 'POST':
        print(request.body)
        res = apps.AASRestApi_exportAASX(request.user.user_id, request.POST['aasxNm'], request.POST['ver'],
                         request.POST['desc'], request.POST['packageId'], request.POST['url'], request.POST['id'], request.POST['pwd'])
        return JsonResponse(res)