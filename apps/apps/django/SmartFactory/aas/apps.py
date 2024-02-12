import os
import shutil
import magic
import requests, json
from os import walk
from os import path
import xml.etree.ElementTree as XmlParser
from django.core.files.storage import FileSystemStorage
import traceback

from io import BytesIO
from wsgiref.util import FileWrapper

import zipfile

from models.smartfactory import Aasx
from django.core import serializers
from django.db.models import Q
from django.core.paginator import Paginator


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + path.sep + 'file'

PAGE_SIZE = 30
AUTH_TOKEN_URL = 'https://aasnest.io/keycloak/auth/realms/AASRestService/protocol/openid-connect/token'
AUTH_CLIENT_ID = 'login-app'

def checkConfigFileName(fileNm):
    if fileNm.find('/_rels/') != -1 or\
            fileNm == '/[Content_Types].xml' or\
            fileNm == '/aasx/aasx-origin':
        return False
    else:
        return True

def getAASFileList(id, aasxNm, configNm):
    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm
    data = []

    for (dirpath, dirnames, filenames) in walk(root):
        #default file
        dirpath = dirpath.replace(root,'').replace(path.sep, '/')

        for filename in filenames:
            fName = dirpath + '/' + filename
            if checkConfigFileName(fName) == True and fName.find(configNm) == -1:
                data.append(fName)
    return data

def getAASXData(id, aasxNm):
    response = {'contentType':[], 'thumbnail':'', 'origin':''}
    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm

    try:
        ## Content_Type
        namespace = 'http://schemas.openxmlformats.org/package/2006/content-types'
        namespace_prefix = "{" + namespace + "}"
        XmlParser.register_namespace('', namespace_prefix)
        ct = XmlParser.parse(root+path.sep+'[Content_Types].xml')
        top = ct.getroot()

        for default in top.iter(namespace_prefix+'Default'):
            response['contentType'].append(default.attrib)


        ## Thumbnail
        namespace = 'http://schemas.openxmlformats.org/package/2006/relationships'
        namespace_prefix = "{" + namespace + "}"
        XmlParser.register_namespace('', namespace_prefix)
        ct = XmlParser.parse(root+path.sep+'_rels'+path.sep+'.rels')
        top = ct.getroot()

        for rShip in top.iter(namespace_prefix+'Relationship'):
            if rShip.attrib['Type'] == 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail' and len(response['thumbnail']) == 0:
                response['thumbnail'] = rShip.attrib['Target']
            elif rShip.attrib['Type'] == 'http://www.admin-shell.io/aasx/relationships/aasx-origin':
                response['origin'] = rShip.attrib['Target']

        ## AASX PATH
        ct = XmlParser.parse(root + path.sep + 'aasx' + path.sep + '_rels' + path.sep + 'aasx-origin.rels')
        top = ct.getroot()

        for rShip in top.iter(namespace_prefix + 'Relationship'):
            if rShip.attrib['Type'] == 'http://www.admin-shell.io/aasx/relationships/aas-spec':
                response['aasSpec'] = rShip.attrib['Target']
        response['fileList'] = getAASFileList(id, aasxNm, response['aasSpec'])
    except Exception as e:
        print(e)
    return response


def getAASXTree(id, aasxNm, aasSpec):
    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm
    response = open(root + path.sep + aasSpec, 'rt', encoding='UTF8').read()
    return response


def getAASXFile(id, aasxNm, tPath):
    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm
    response = open(root + path.sep + tPath, 'rb').read()
    return response


def getAASXFileMime(id, aasxNm, tPath):
    filePath = PROJECT_ROOT + path.sep + id + path.sep + aasxNm + path.sep + tPath
    mime_type = magic.from_file(filePath, mime=True)
    return mime_type


def downloadAASX(id, aasxNm):
    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm + path.sep
    response = None
    try:
        buffer = BytesIO()
        z = zipfile.ZipFile(buffer, "w")
        lenPath = len(root)
        for dirpath, dirnames, filenames in walk(root):
            for file in filenames:
                filePath = os.path.join(dirpath, file)
                z.write(filePath, filePath[lenPath:])
        z.close()
        response = buffer
    except Exception as e:
        print(e)
        response = None
    return response


def getAASXThumbnailPath(id, aasxNm):
    thumbnail = None
    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm

    try:
        ## Content_Type
        namespace = 'http://schemas.openxmlformats.org/package/2006/content-types'
        namespace_prefix = "{" + namespace + "}"
        XmlParser.register_namespace('', namespace_prefix)
        ct = XmlParser.parse(root + path.sep + '[Content_Types].xml')
        top = ct.getroot()

        ## Thumbnail
        namespace = 'http://schemas.openxmlformats.org/package/2006/relationships'
        namespace_prefix = "{" + namespace + "}"
        XmlParser.register_namespace('', namespace_prefix)
        ct = XmlParser.parse(root + path.sep + '_rels' + path.sep + '.rels')
        top = ct.getroot()

        for rShip in top.iter(namespace_prefix + 'Relationship'):
            if rShip.attrib['Type'] == 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail':
                thumbnail = rShip.attrib['Target']
                break
    except Exception as e:
        print(e)
        thumbnail = None
    return thumbnail


def addAASX(id, file, aasxNm, ver, desc):
    response = {'code' : -1, 'message' : 'FAILURE'}

    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm

    try:

        if os.path.isdir(root) == True:
            response['code'] = -2
            response['message'] = 'FAILURE'
            return response
        else:
            os.makedirs(os.path.join(root))
        fs = FileSystemStorage(root)
        fs.save(file.name, file)

        zipFile = root + path.sep + file.name
        with zipfile.ZipFile(zipFile) as zf:
            zf.extractall(root)
            zf.close()
            fs.delete(file.name)

        a = Aasx()
        a.aasxNm = aasxNm
        a.userId = id
        a.version = ver
        a.desc = desc
        thumb = getAASXThumbnailPath(id, aasxNm)
        if thumb is not None:
            a.imgUrl = thumb

        a.save()
        print(thumb)

        response['code'] = 100
        response['message'] = 'SUCCESS'
    except Exception as ex:
        print(ex)
        print('ERROR')
    return response


def editAASX(aasx_id, ver, desc):
    response = {'code': -1, 'message': 'FAILURE'}

    try:
        # AASX 인스턴스를 찾고 해당 필드를 업데이트합니다.

        print("apps.py -->  editAASX --> aasx_id : ", aasx_id, ", desc : ", desc)
        aasx = Aasx.objects.get(pk=aasx_id)  # pk는 primary key (고유 식별자)
        aasx.version = ver
        aasx.desc = desc
        aasx.save()

        response['code'] = 100
        response['message'] = 'SUCCESS'
    except Aasx.DoesNotExist:
        response['message'] = 'AASX does not exist'
    except Exception as ex:
        print(ex)
        response['message'] = 'An error occurred'

    return response


def getAASXList(userId, data):
    response = {'code':-1, 'items':[], 'page':0, 'totalCount':0}
    try:
        q = Q()

        q &= Q(userId=userId)

        if data.get('search', None) is not None:
            q &= (Q(aasxNm__icontains=data.get('search')) | Q(version__icontains=data.get('search')) | Q(desc__icontains=data.get('search')))


        aasxList = Aasx.objects.filter(q)
        items = serializers.serialize('python', aasxList)

        pageNum = int(data.get('page', 1)) if int(data.get('page')) > 0 else 1
        page = Paginator(items, PAGE_SIZE).page(pageNum)

        response['code'] = 100
        response['items'] = list(page)
        response['page'] = pageNum
        response['totalCount'] = len(items)
    except Exception as e:
        print(e)
        response['code'] = -1

    return response

def deleteAASX(id, aasxNo):
    response = {'code' : -1, 'message' : 'FAILURE'}


    try:
        print(aasxNo, id)

        a = Aasx.objects.get(aasxNo=aasxNo, userId=id)

        if a is None:
            response['code'] = -2
            return response

        root = PROJECT_ROOT + path.sep + id + path.sep + a.aasxNm

        print(a, root)
        if os.path.isdir(root) == True:
            shutil.rmtree(root, ignore_errors=True)
        a.delete()

        response['code'] = 100
        response['message'] = 'SUCCESS'
    except Exception as e:
        print(e)

    return response

def addSupplementaryFile(file, aasxNm, filePath, fileNm):
    try:
        root = 'data' + path.sep + aasxNm
        print(root)

        if os.path.isdir(root) == False:
            print('NotFound')
            return False
        fs = FileSystemStorage(root + path.sep + filePath)
        fs.save(fileNm, file)
        return True
    except Exception as ex:
        print(ex)
        print('ERROR')
        return False


def AASRestApi_getOAuth2Token(repoId, repoPwd):
    postData = {
        'client_id': AUTH_CLIENT_ID,
        'username':repoId,
        'password':repoPwd,
        'grant_type':'password'
    }
    print(AUTH_TOKEN_URL, postData)
    res = requests.post(AUTH_TOKEN_URL, data=postData, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    print(res)
    if res.ok :
        token_json = res.json()
        return token_json['access_token']
    else:
        return None


def AASRestApi_getAASXList(url, repoId, repoPwd):
    response = {'code':-1, 'items':[]}

    try:
        token = AASRestApi_getOAuth2Token(repoId, repoPwd)

        if token is None:
            response['code'] = -2
            return response
        headers = {
            'Authorization': 'Bearer '+ token,
            'Accept': 'application/json'
        }
        listUrl = url + '/packages'

        res = requests.get(listUrl, headers=headers)
        if res.ok :
            response['code'] = 100
            response['items'] = res.json()
        else:
            response['code'] = -3
            return response
    except Exception as ex:
        print(traceback.print_exc())
    return response


def AASRestApi_exportAASX(id, aasxNm, ver, desc, packageId, url, repoId, repoPwd):
    response = {'code' : -1, 'message' : 'FAILURE'}

    root = PROJECT_ROOT + path.sep + id + path.sep + aasxNm

    try:
        token = AASRestApi_getOAuth2Token(repoId, repoPwd)

        if token is None:
            response['code'] = -3
            return response

        if os.path.isdir(root) == True:
            response['code'] = -2
            response['message'] = 'FAILURE'
            return response
        else:
            os.makedirs(os.path.join(root))

        downloadUrl = url + '/packages/' + packageId
        headers = {
            'Authorization': 'Bearer '+ token,
            'Accept': 'application/asset-administration-shell-package'
        }

        file = requests.get(downloadUrl, headers=headers)
        fileName = aasxNm + '.aasx'

        open(root + path.sep + fileName, 'wb').write(file.content)
        fs = FileSystemStorage(root)
        #fs.save(fileName, file.content)


        zipFile = root + path.sep + fileName
        with zipfile.ZipFile(zipFile) as zf:
            zf.extractall(root)
            zf.close()
            fs.delete(zipFile)

        a = Aasx()
        a.aasxNm = aasxNm
        a.userId = id
        a.version = ver
        a.desc = desc
        thumb = getAASXThumbnailPath(id, aasxNm)
        if thumb is not None:
            a.imgUrl = thumb

        a.save()

        response['code'] = 100
        response['message'] = 'SUCCESS'
    except Exception as ex:
        print(traceback.print_exc())
        print('ERROR')
    return response
