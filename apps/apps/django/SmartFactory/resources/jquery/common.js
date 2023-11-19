function checkParameter(val) {
	if(val == null || val == 'undefined' || val == ''){
		return false;
	}else{
		if(val.replace(/^\s*/,'') == ''){
			return false;
		}else{
			return true;
		}
	}
}

function checkHtml(val) {
	if(val == null || val == 'undefined'){
		return false;
	}else{
		return true;

	}
}

function getTimeStamp(val) { // 24시간제
	var d = null;
	if(val == null){
		d = new Date();
	}else{
		d = val;
	}
	var s =
	leadingZeros(d.getFullYear(), 4) + '-' +
	leadingZeros(d.getMonth() + 1, 2) + '-' +
	leadingZeros(d.getDate(), 2) + ' ' +
	leadingZeros(d.getHours(), 2) + ':' +
	leadingZeros(d.getMinutes(), 2) + ':' +
	leadingZeros(d.getSeconds(), 2);
	return s;
}

function leadingZeros(n, digits) {
	var zero = '';
	n = n.toString();
	if (n.length < digits) {
	  for (var i = 0; i < digits - n.length; i++)
	    zero += '0';
	}
	return zero + n;
}