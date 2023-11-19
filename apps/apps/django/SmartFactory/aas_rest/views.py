from django.shortcuts import render

from django.http import JsonResponse
from django.http import Http404
from django.views.decorators.csrf import csrf_exempt

import aas_rest.apps as apps


@csrf_exempt
def Meta(request):
    apiKey = request.META['HTTP_AUTHORIZATION']
    if apiKey == 'Api-Key WCPAU2GVRP0INMOMPGUCMFUA70ZBDVR7YB2OOS9WUWWEDY9NYH':
        if request.method == 'GET':
            return JsonResponse(apps.getMeta(request.GET))
        else:
            raise Http404
    else:
        raise Http404

@csrf_exempt
def Tag(request):
    apiKey = request.META['HTTP_AUTHORIZATION']
    if apiKey == 'Api-Key WCPAU2GVRP0INMOMPGUCMFUA70ZBDVR7YB2OOS9WUWWEDY9NYH':
        if request.method == 'GET':
            return JsonResponse(apps.getTag(request.GET))
        elif request.method == 'POST':
            return JsonResponse(apps.editOPCUA(request.body))
        else:
            raise Http404
    else:
        raise Http404
