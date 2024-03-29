from django import forms

class FileUploadForm(forms.Form):
    fileNm = forms.CharField(max_length=50)
    filePath = forms.CharField(max_length=50)
    aasxNm = forms.CharField(max_length=50)
    file = forms.FileField()

class AASXUploadForm(forms.Form):
    aasxNm = forms.CharField(max_length=50)
    ver = forms.CharField(max_length=10)
    desc = forms.CharField(max_length=1000)
    file = forms.FileField()


class AASXEditForm(forms.Form):
    aasx_id = forms.IntegerField(widget=forms.HiddenInput())  # 수정할 AASX의 ID
    ver = forms.CharField(max_length=10)
    desc = forms.CharField(max_length=1000)