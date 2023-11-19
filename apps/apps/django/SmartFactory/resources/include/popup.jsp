<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
	<style>
		#popup_layer {display:none; position:fixed; _position:absolute; top:0; left:0; width:100%; height:100%; z-index:10000;}
		.popup_bg {position:absolute; top:0; left:0; width:100%; height:100%; background:#000; opacity:.5; filter:alpha(opacity=10);}
		.popup_box {position:relative; margin:100px auto; min-height:30px; width:auto; height:auto; background-color:RGB(255,255,255); float: none; }
		.popup_content {position:relative; width:100%; height:auto; background-color:white; }
		.popup_btnbar {position:relative; top:3px; width:100%; height:30px; background-color:white; }
		.popup_btnbar input[type="button"] {float: right; margin-right: 5px;}
	</style>
  	<div id="popup_layer">
  		<div id="popup_bg" class="popup_bg">
  		</div>
  		<div id="popup_box" class="popup_box">
	  	</div>
	</div>
	<script>
		function setPopupLayer(tag, width){
			document.getElementById('popup_layer').style.display = "block";
			document.getElementById('popup_box').style.width = width+"px";
			document.getElementById('popup_box').innerHTML = tag;
		}
		
		function closePopup(){
			document.getElementById('popup_layer').style.display = "none";
			document.getElementById('popup_box').style.width = "0px";
			document.getElementById('popup_box').innerHTML = '';
		}
	</script>