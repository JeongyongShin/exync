Ext.define('app.view.panel.MainPanel',{
    extend : 'app.view.frame.DefaultPanel',
    id: 'mainPanel',
    alias : 'widget.MainPanel',
	style:  'background: #212124',

    listeners: {
    	render: function(panel) {
    		//panel.setRefresh(true,1000);
    	}
    },
    initComponent: function() {

        var me = this;

        var busId = null;
        var canType = null;

		var pointList = {};

		var selId;
		var selType;
		var selName;
		var selData;
		var selMap;
		var selMode = 0;

		var isElement = false;
		var isContent = false;


		var onSubscribe = function(){
		}

        var isCall = false;
        var isMainShow = false;

        Ext.apply(this, {
        	showView:function (mode){
        		if(mode == 0){
    				me.down('#mainContentToolbar').show();
    				me.down('#mainEmptyPanel').hide();
    				me.down('#mainContentPanel').show();
    				me.down('#mainGridPanel').hide();

    				me.setContentView();
				}else if(mode == 1){
    				me.down('#mainContentToolbar').show();

    				me.down('#mainEmptyPanel').hide();
    				me.down('#mainContentPanel').hide();
    				me.down('#mainGridPanel').show();
				}else if(mode == 2){
    				me.down('#mainContentToolbar').show();

    				me.down('#mainEmptyPanel').hide();
    				me.down('#mainContentPanel').show();
    				me.down('#mainGridPanel').hide();

    				me.setContentView();
				}else if(mode == 3){
    				me.down('#mainContentToolbar').show();

    				me.down('#mainEmptyPanel').hide();
    				me.down('#mainContentPanel').show();
    				me.down('#mainGridPanel').show();

    				me.setContentView();
				}
			},
			updateSelection:function(selection){
        		var btn1 = me.down('#buttonElement');
        		var btn2 = me.down('#buttonCustom');
        		if(selection == 1){
        			btn1.selection = !btn1.selection;
        			if(!btn1.selection && !btn2.selection)btn1.selection = true;
				}else if(selection == 2){
        			btn2.selection = !btn2.selection;
        			if(!btn1.selection && !btn2.selection)btn2.selection = true;
				}
        		if(btn1.selection && !btn2.selection){
        			btn1.addCls('toggle-button')
					btn2.removeCls('toggle-button');
        			selMode = 1;
				}else if(!btn1.selection && btn2.selection){
        			btn1.removeCls('toggle-button')
					btn2.addCls('toggle-button');
        			selMode = 2;
				}else if(btn1.selection && btn2.selection){
        			btn1.addCls('toggle-button')
					btn2.addCls('toggle-button');
        			selMode = 3;
				}else {
        			btn1.removeCls('toggle-button')
					btn2.removeCls('toggle-button');
        			selMode = 0;
				}
        		me.showView(selMode);
			},
			setContentView:function (){
        		if(selType == 'pfile'){
        			if(selData.data.mimeType != undefined && selData.data.mimeType.__text != undefined){
        				let mType = selData.data.mimeType.__text;
        				if(mType.indexOf('image') == 0){
        					me.setImageView(selName, selData.data.value.__text);
						}else if(mType == 'application/pdf'){
    		    			me.down('#mainContentPanel').setHtml('<iframe class="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="' +
								'/aasx/file?aasxNm=' + selName + '&path=' + selData.data.value.__text +
								'" scrolling="yes"></iframe>');
						}else if(mType == 'application/sla' ||
								mType == 'application/stl'){
    		    			me.down('#mainContentPanel').setHtml('<iframe class="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="' +
								'/3dview?aasxNm=' + selName + '&path=' + selData.data.value.__text +
								'" scrolling="yes"></iframe>');
						}else{
							me.down('#mainContentPanel').setHtml('<div class="ccb"><div class="ccl" style="text-align: center">Preview is not supported.</div></div>');
						}
					}else {
						let values = selData.data.value.__text.split('.');
						var fType = values[values.length-1].toLowerCase();
						if(fType == 'png' || fType == 'jpg' || fType == 'jpeg' || fType == 'bmp' || fType == 'gif'){
        					me.setImageView(selName, selData.data.value.__text);
						}else if(fType == 'pdf'){
    		    			me.down('#mainContentPanel').setHtml('<iframe class="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="' +
								'/aasx/file?aasxNm=' + selName + '&path=' + selData.data.value.__text +
								'" scrolling="yes"></iframe>');
						}else if(fType == 'stl'){
    		    			me.down('#mainContentPanel').setHtml('<iframe class="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="' +
								'/3dview?aasxNm=' + selName + '&path=' + selData.data.value.__text +
								'" scrolling="yes"></iframe>');
						}else{
							me.down('#mainContentPanel').setHtml('<div class="ccb"><div class="ccl" style="text-align: center">Preview is not supported.</div></div>');
						}
					}
				}else if(selType == 'item'){
        			if(selData.itemType == 'imagemap'){
        				var link = null;
        				var map = null;
        				if(selData.data.imagefile != null && selData.data.imagefile.length > 0){
        					link = selData.data.imagefile[0].value.__text;
						}
        				if(selData.data.imagemapentity != null && selData.data.imagemapentity.length > 0){
        					selMap = selData.data.imagemapentity;
						}
        				me.setImageView(selName, link, selMap);
					}
				}
			},

			setImageView(aasxNm, imagePath, imageMaps){
        		var tag = null;
        		if(imageMaps!=undefined && imageMaps!=null){
        			tag = '<div style="position: relative; width:fit-content; margin: 0 auto;"><img id="MainImageMap" src="aasx/file?aasxNm=' + aasxNm + '&path=' + imagePath +'" usemap="#imagemap">';
        			var maps = '<map name="imagemap">\n';

        			for (var i=imageMaps.length-1; i>-1; i--){
        				let imageMap = imageMaps[i];
        				try {
        					let title = imageMap.statements.submodelElement[0].property.idShort.__text;
        					var pointType = imageMap.statements.submodelElement[0].property.semanticId.keys.key.__text;
        					var pointString = imageMap.statements.submodelElement[0].property.value.__text;
        					let point = pointString.replace('[','').replace(']','').trim().split(',');
        					var shape = '';
        					if(pointType=='http://admin-shell.io/aasx-package-explorer/plugins/ImageMap/RegionRect/1/0') shape = 'rect';
							if(pointType=='http://admin-shell.io/aasx-package-explorer/plugins/ImageMap/RegionPolygon/1/0') shape = 'poly';
							if(pointType=='http://admin-shell.io/aasx-package-explorer/plugins/ImageMap/RegionCircle/1/0') shape = 'circle';
							let color = getRandomColor(i, false);

        					maps+='<area style="cursor: pointer" shape="'+shape+'" coords="'+(point.join(','))+'" title="'+title+'" ondblclick="Ext.getCmp(\'mainPanel\').selectImageView('+i+')" ' +
								'data-maphilight=\'{"strokeColor":"'+color+'","fillColor":"'+color+'","strokeOpacity":0.8,"fillOpacity":0.3,"alwaysOn":true}\'>\n';
        					//tag+='<div style="position: absolute; left:'+point[0]+'px;  top:'+point[1]+'px;  width:'+(point[2]-point[0])+'px; height:'+(point[3]-point[1])+'px; background-color:black;"></div>';
						}catch (e){
        					console.log(e);
						}


					}
        			maps+='</map>';
        			tag+=maps+'</div>';
				}else{
        			tag = '<img src="aasx/file?aasxNm=' + aasxNm + '&path=' + imagePath +'">';
				}
        		me.down('#mainContentPanel').setHtml('<div class="ccb"><div class="ccl" style="text-align: center">'+tag+'</div></div>');
        		$('#MainImageMap').maphilight();
			},
			setIframeView(){
        		cTagId=encodeURIComponent('ns=2;s='+selData.idPath);
        		document.getElementById('mainPanelIframe').innerHTML = '<iframe class="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="/chart?tagId='+cTagId+'" scrolling="no"></iframe>';

			},
        	setGridTitle:function(title){
				me.down('#MainPanelGridTitle').update('<div class="ccb"><div class="ccl">'+title+'</div></div>');
        	},
        	setTreeData:function(type, id, html, aasxNm, content){
        	    selId = id;
        	    selType = type;
        	    selName = aasxNm;
        	    selData = content;

        	    if(selType == 'pfile'){
        	    	me.down('#buttonElement').show();
        	    	me.down('#buttonCustom').show();
				}else if(selType == 'item'){
        	    	me.down('#buttonElement').hide();
        	    	me.down('#buttonCustom').hide();
        	    	selMode = 10;
				}else {
        	    	me.down('#buttonElement').show();
        	    	me.down('#buttonCustom').hide();
        	    	selMode = 0;
				}
        	    isMainShow = true;
        	    if(selMode == 0){
        	    	me.down('#buttonElement').selection = false;
        	    	me.down('#buttonCustom').selection = false;
        	    	me.updateSelection(1);
				}else if(selMode == 10){
        	    	me.down('#buttonElement').selection = false;
        	    	me.down('#buttonCustom').selection = false;
        	    	me.updateSelection(10);
				}else{
        	    	me.updateSelection(0);
				}
    		    me.down('#mainGridPanel').setHtml(html);
        	},
        	reloadData:function(){
				//me.down('#mainTreePanel').reloadData();
				/*var jsonResult = Ext.JSON.decode('{"time": "'+getTimeStamp()+'", "bus_id": "E30001", "message": "connect failed"}');
				Ext.getCmp('alarmPanel').addAlarm(jsonResult);*/
            },
			selectImageView:function(idx){
        		Ext.getCmp('MainTreePanel').selectImageMapLink(selMap[idx].statements.submodelElement[1].referenceElement.value.keys.key);

			},
            dockedItems: [{
				xtype: 'toolbar',
				itemId:'mainContentToolbar',
				dock: 'top',
				height :40,
				style:  'background: transparent',
				padding:'0 4px',
				hidden:true,
				items:[{
					xtype:'button',
					itemId: 'buttonElement',
					cls:'button_custom',
					text: 'Element',
					selection:false,
					handler: function() {
						me.updateSelection(1);
					}
				},{
					xtype:'button',
					itemId: 'buttonCustom',
					cls:'button_custom',
					text: 'Content',
					selection:false,
					handler: function() {
						me.updateSelection(2);
					}
				},/*{
					itemId:'MainPanelGridTitle',
					style:{'background-color':'transparent','color':'#eee', 'font-size':'20px', 'font-weight':'normal', 'border':'0'},
					html:'',
				},*/'->',{
					xtype: 'button',
					style:  'background: transparent; color:white;',
					iconCls:'x-fa fa-times',
					handler : function() {
						isMainShow = false;
						selId = null;
						selType = null;
						selName = null;
						selData = null;
						selMap = null;
						selMode = 0;
						me.down('#buttonElement').selection = false;
						me.down('#buttonCustom').selection = false;
						me.showView(selMode);
						me.down('#mainGridPanel').setHtml('');
						me.down('#mainContentPanel').setHtml('');
					}
				}]
			}],
            items:[{
            	flex:1,
            	layout:{type: 'hbox',align: 'stretch'},
                border:false,
                items:[{
					flex:1,
					itemId:'mainEmptyPanel',
					xtype: 'panel',
					hidden:false,
					layout:'fit',
					style:{'text-align':'center', 'color':'white', 'background-color':'transparent', 'font-size':'23px', 'font-weight':'bold'},
					html:'<div class="ccb"><div class="ccl">목록에서 데이터를 선택하시요.</div></div>',
					listeners: {
						render: function(panel) {
							panel.formPanelDropTarget = new Ext.dd.DropTarget(this.body, {
								ddGroup: 'MainDD',
								notifyDrop: function(ddSource, e, data) {
									me.reloadPointList(data.bus, data.canType);

								}
							});
						}
					}
				},{
					flex:1,
					itemId:'mainGridPanel',
					hidden:true,
					html:''
				},{
					flex:1,
					itemId:'mainContentPanel',
					hidden:true,
					scrollable: true,
					style: 'overflow: hidden !important;',
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'top',
						height :40,
						style:  'background: transparent',
						padding:'0 4px',
						items:[{
							xtype:'button',
							itemId: 'buttonElement',
							cls:'button_custom',
							text: 'Download',
							handler: function() {
								if(selData && selData.data && selData.data.value && selData.data.value.__text) {
									let names = selData.data.value.__text.split('/');
									let fileName = names[names.length-1];
									location.href = '/aasx/file/download?aasxNm=' + selName + '&path=' + selData.data.value.__text + '&fileNm=' + fileName;
								} else {
									console.log('selData 또는 selData.data가 null입니다.');
									// 여기서 오류를 적절하게 처리하세요.
								}
							}
						}]
					}],
					html:''
				}]
            }]
        });

        me.callParent(arguments);
    }
});
