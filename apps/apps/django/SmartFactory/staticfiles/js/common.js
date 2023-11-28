let cTable = ['922B21','212F3D',
	    '76448A','A569BD',
	    '1F618D','5DADE2',
	    '148F77','AF601A',
	    'F4D03F','85929E',
	    '4A235A','145A32'];

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};


function cs(text){
    return '<div class="ccb"><div class="ccl">'+text+'</div></div>';
}

function cs(text, st){
    return '<div class="ccb"><div class="ccl" style="'+st+'">'+text+'</div></div>';
}

function cs(text, event, fuc){
    return '<div '+event+'="'+fuc+'" class="ccb"><div class="ccl">'+text+'</div></div>';
}

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

function getObjectValue(obj, key, def){
    return obj.hasOwnProperty(key)?obj[key]:(def!=undefined?def:'');

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

function getCenterTag(val){
	return '<div class="ccb"><div class="ccl">'+val+'</div></div>';
}

function getCenterTag(val, style){
	return '<div class="ccb"><div class="ccl" style="'+style+'">'+val+'</div></div>';
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

function setComma(val){
	val = val+"";
	var vals = val.split(".");
	var loop = Math.ceil(vals[0].length/3);
	var comVal = '';
	for(var i=0;i<loop;i++){
		var sPoint = (vals[0].length)-((i*1)*3);
		var ePoint = sPoint-3;
		if(ePoint < 0)ePoint = 0;
		comVal = vals[0].substring(ePoint, sPoint)+comVal;
		if(i<loop-1)comVal = ','+comVal;
	}
	if(vals.length>1)comVal+="."+vals[1];
	return comVal;
}

function getCookie(name) {
    var cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function createCustomSelect(){
    var x, i, j, l, ll, selElmnt, a, b, c;
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
      selElmnt = x[i].getElementsByTagName("select")[0];
      ll = selElmnt.length;
      a = document.createElement("DIV");
      a.setAttribute("class", "select-selected");
      a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
      x[i].appendChild(a);
      b = document.createElement("DIV");
      b.setAttribute("class", "select-items select-hide");
      for (j = 1; j < ll; j++) {
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function(e) {
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
              if (s.options[i].innerHTML == this.innerHTML) {
                s.selectedIndex = i;
                h.innerHTML = this.innerHTML;
                y = this.parentNode.getElementsByClassName("same-as-selected");
                yl = y.length;
                for (k = 0; k < yl; k++) {
                  y[k].removeAttribute("class");
                }
                this.setAttribute("class", "same-as-selected");
                break;
              }
            }
            h.click();
        });
        b.appendChild(c);
      }
      x[i].appendChild(b);
      a.addEventListener("click", function(e) {
          e.stopPropagation();
          closeAllSelect(this);
          this.nextSibling.classList.toggle("select-hide");
          this.classList.toggle("select-arrow-active");
        });
        document.addEventListener("click", closeAllSelect);

    }
}

function closeAllSelect(elmnt) {
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

function getRandomColor(idx, isShape) {
    var color = isShape?'#':'';
    if(idx == -1 || idx >= cTable.length){
        var letters = '0123456789ABCDEF';
        for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
        }
    }else{
        color += cTable[idx];
    }
    return color;
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});
