function getCookie(cName)
{
	return $.cookie(cName);
}

function setCookie(cName, cValue){
	$.cookie(cName, escape(cValue), {path: '/' });
}

function deleteCookie(cName){
	$.removeCookie(cName, { path: '/' });
}