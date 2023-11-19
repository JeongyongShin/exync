from django.core import serializers
from django.db.models import Q
from django.core.paginator import Paginator

from models.smartfactory import Common
from models.smartfactory import LoginLog

PAGE_SIZE = 30
IP_ADDRESS = '/grafana'


def get_client_ip(request):
    x_forwarded_for = request.META.get('X-Forwarded-For')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = 'unknown'
    return ip


def saveLoginLog(userId, ip, state):
    log = LoginLog()
    log.userId = userId
    log.ip = ip
    log.state = state
    log.save()


def getDashboardUrl(request, baseCd, commCd):

    comm = Common.objects.get(baseCd=baseCd, commCd=commCd)
    ip = IP_ADDRESS+comm.item1
    return ip


def getCommon(data):
    response = {'code': -1, 'items': [], 'page': 0, 'totalCount': 0}
    try:
        q = Q()
        if data.get('baseCd', None) is not None:
            q &= Q(baseCd=data.get('baseCd'))

        commList = Common.objects.filter(q)
        items = serializers.serialize('python', commList)

        pageNum = int(data.get('page', 1)) if int(data.get('page', '1')) > 0 else 1
        page = Paginator(items, PAGE_SIZE).page(pageNum)

        response['code'] = 100
        response['items'] = list(page)
        response['page'] = pageNum
        response['totalCount'] = len(items)
    except Exception as e:
        print(e)
        response['code'] = -1

    return response


def editCommon(data):
    response = {'code': -1, 'message': 'FAILURE'}
    try:
        Common.objects.filter(baseCd=data['baseCd'], commCd=data['commCd']).update(item1=data['item1'])

        response['code'] = 100
        response['message'] = 'SUCCESS'
    except Exception as e:
        print(e)
        response['code'] = -1

    return response
