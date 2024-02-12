Ext.define('app.view.panel.TagPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.TagPanel',
    style:{'background-color':'#252529'},
    initComponent: function() {
        let me = this;
        var cType = null;
        var pName = '';
        var pageNum = 1;


        var evt = Ext.create('Ext.data.Store', {
  	      fields:['abbr','name'],
  	      data : [{"abbr":'0', "name":"ALL"},
  	    	      {"abbr":'01', "name":"입력항목"},
  	    	      {"abbr":'02', "name":"설명"}]
		});

        var tagListStore = Ext.create('app.store.TagList',{
            listeners: {
       			beforeload:function(store, operation, eOpts){
    				operation.setParams({
    				        type:cType,
    						search: pName.length>0?pName:null,
	                		page: pageNum
    				});
    			},
    			load :function( ts , records , successful , operation , eOpts ){
                    if(me.isFirst && records.length > 0){
                        me.isFirst = false;
                    }
        		}
    		}
        });

        function createAddForm(selection){
            var addWindow = null;
            var addForm = Ext.create('Ext.form.Panel', {
		        bodyPadding: 5,
		        layout: 'anchor',
            	url : '/aasx/add',
    	        fileUpload: true,
			    fieldDefaults:{
			        labelAlign:'left',
			        labelWidth:110,
			        anchor:'100%',
			        msgTarget:'under'
			    },
		        defaultType: 'textfield',
		        items: [{
		            fieldLabel: '태그명',
		            name: 'tagId',
		            maxLength:255,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		        },{
		            fieldLabel: '수기명',
		            name: 'tagName',
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        },{
		            fieldLabel: '설명',
		            name: 'tagDesc',
		            maxLength:1000,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        },{
		            fieldLabel: '값',
		            name: 'value',
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: true
		        }],
		        // Reset and Submit buttons
		        buttons: [{
		            text: '저장',
		            formBind: true, //only enabled once the form is valid
		            disabled: true,
		            handler: function() {
		                var form = addForm.getForm();
                        if (form.isValid()) {
                            var params = {};
		                    for ( var key in form.getValues() ) {
                                params[key] = form.getValues()[key];
                            }

                            Ext.Ajax.request({
                                url: '/tag/add',
                                method:'POST',
                                params:params,
                                timeout: 10000,
                                success:function( response, request ){
                                    let res = JSON.parse(response.responseText);
                                    if(res.code == 100){
                                        Ext.Msg.alert('수기 추가','저장하였습니다');
                                        me.down('#tagGridView').getStore().loadPage(pageNum);
                                        addWindow.close();
                                    }if(res.code == -2){
                                        Ext.Msg.alert('수기 추가','등록된 수기입니다.');
                                    }else{
                                        Ext.Msg.alert('수기 추가', '오류가 발생하였습니다 다시시도해주세요');
                                    }
                                },
                                failure: function( result, request ){
                                    Ext.Msg.alert('수기 추가', '오류가 발생하였습니다 다시시도해주세요');
                                }
                            });
                        }
		            }
		        }, {
		            text: '취소',
		            handler : function() {
		            	addWindow.close();
		            }
		        }]
		    });

			addWindow = Ext.create('Ext.window.Window', {
			    title: '수기 추가',
			    layout: 'fit',
			    modal: true,
			    shadow:false,
			    items: [addForm]
			});
			addWindow.show();
        }

        function createEditForm(data){
            var editWindow = null;
            var editForm = null;
			editForm = Ext.create('Ext.form.Panel', {
		        bodyPadding: 5,
		        layout: 'anchor',
            	url : '/aasx/edit',
    	        fileUpload: true,
			    fieldDefaults:{
			        labelAlign:'left',
			        labelWidth:110,
			        anchor:'100%',
			        msgTarget:'under'
			    },
		        defaultType: 'textfield',
		        items: [{
		            fieldLabel: '태그명',
		            name: 'tagId',
		            value: data.tagId,
		            readOnly:true
		        },{
		            fieldLabel: '수기명',
		            name: 'tagName',
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		            value: data.tagName
		        },{
		            fieldLabel: '설명',
		            name: 'tagDesc',
		            maxLength:1000,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		            value: data.tagDesc
		        },{
		            fieldLabel: '값',
		            name: 'value',
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: true,
		            value: data.value
		        }],
		        // Reset and Submit buttons
		        buttons: [{
		            text: '수정',
		            formBind: true, //only enabled once the form is valid
		            disabled: true,
		            handler: function() {
                        var form = editForm.getForm();
                        console.log("TagPanel.js --> Form data before submit:", form.getValues()); // 로깅 추가
                        if (form.isValid()) {
                            console.log("Form is valid, submitting..."); // 유효성 검사 성공시 로깅 추가
                            var params = {};
		                    for ( var key in form.getValues() ) {
                                params[key] = form.getValues()[key];
                            }

                            Ext.Ajax.request({
                                url: '/tag/edit',
                                method:'POST',
                                params:params,
                                timeout: 10000,
                                success:function( response, request ){
                                    let res = JSON.parse(response.responseText);
                                    if(res.code == 100){
                                        Ext.Msg.alert('수기 수정','저장하였습니다');
                                       editWindow.close();
                                       me.down('#tagGridView').getStore().loadPage(pageNum);
                                    }else{
                                        Ext.Msg.alert('수기 수정', '오류가 발생하였습니다 다시시도해주세요');
                                    }
                                },
                                failure: function( result, request ){
                                    Ext.Msg.alert('수기 수정', '오류가 발생하였습니다 다시시도해주세요');
                                }
                            });
                        }

                        else {
                            console.log("TagPanel.js -->  Form is invalid, not submitting."); // 유효성 검사 실패시 로깅 추가
                            // ... 나머지 코드 ...
                        }
		            }
		        }, {
		            text: '취소',
		            handler : function() {
		            	editWindow.close();
		            }
		        }]
		    });

			editWindow = Ext.create('Ext.window.Window', {
			    title: '수기 수정',
			    layout: 'fit',
			    modal: true,
			    shadow:false,
			    items: [editForm]
			});
			editWindow.show();
        }

        function createDeleteForm(data){
            Ext.MessageBox.confirm('수기 삭제', '해당 수기를 삭제하시겠습니까?', function(btn){
                if (btn == 'yes'){
                    Ext.Ajax.request({
                        url: '/tag/del',
                        method:'POST',
                        timeout: 10000,
                        params:{
                            tagId:data.tagId
                        },
                        success:function( response, request ){
                            let res = JSON.parse(response.responseText);
                            if(res.code == 100){
                                me.down('#tagGridView').getStore().loadPage(pageNum);
                            }else{
                                Ext.Msg.alert('수기 삭제', '오류가 발생하였습니다 다시시도해주세요');
                            }
                        },
                        failure: function( result, request ){
                            Ext.Msg.alert('수기 삭제', '오류가 발생하였습니다 다시시도해주세요');
                        }
                    });

                }
            });
        }

        Ext.apply(this, {
        	reloadData:function(){
            },
            /*dockedItems: [{
                xtype : 'toolbar',
                dock : 'top',
                style : {'background' : 'transparent'},
                height : 40,
                padding : '0',
                items : [{
                    height:40,
                    itemId : 'MainPanelGridTitle',
                    style : {
                        'background-color' : 'transparent',
                        'border' : '0'
                    },
                    html : '<div class="ccb"><div class="ccl" style="color:#eee; font-size:17px; ">수기관리</div></div>'
                }]
            }],*/
            items:[{
                itemId:'tagGridView',
                xtype:'grid',
                //layout:'fit',
                //forceFit: true,
                store: tagListStore,
                emptyText: cs('목록이 없습니다.'),
                cls:'grid_custom',
                multiSelect: false,
                columns: [
                    { text: '수기명',  dataIndex: 'tagName' ,width:250},
                    { text: '값',  dataIndex: 'value' ,width:190},
                    { text: '설명',  dataIndex: 'tagDesc' ,flex:1},
                    { text: '갱신일자',  dataIndex: 'updateDte' ,width:190,
                        renderer: function(value){
                            if(value != null && value.length > 0)return value.replace('T',' ');
                        }
                    }
                ],
                listeners: {
                    render: function(panel) {
                        panel.getStore().loadPage(pageNum);
                    },
                    itemdblclick: function( ts, record, item, index, e, eOpts ) {
                        	var data = me.down('#tagGridView').getSelectionModel().getSelection()[0].data;
			        	    createEditForm(data);
                    }
                },
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    cls:'log_pagebar',
                    items: [{
                        itemId:'EClassSelectWindow.SearchCombo',
                        xtype:'combo',
                        editable: false,
                        store: evt,
                        cls:'log_combo',
                        width:130,
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'abbr',
                        value: '0',
                        listeners : {
                            select : function(combo, record, eOpts) {
                                if(record.data.abbr == '0')cType = null;
                                else cType = record.data.abbr;
                            }
                        }
                    },{
                        xtype:'textfield',
                        itemId:'EClassSelectWindow.SearchText',
                        maxHeight:30,
                        style:{height:'30px'},
                        margin:'5px 10px 5px 5px', // (top, right, bottom, left).
                        enableKeyEvents:true,
                        listeners:{
                            change: function( ts, newValue, oldValue, eOpts ){
                                pName = newValue;
                            },
                            keyup : function( ts, event, eOpts ){
                                if(event.keyCode == 13){
                                    me.down('#tagGridView').getStore().loadPage(pageNum);
                                }
                            }

                        }
                    },{
                        xtype: 'button',
                        style:  'background: transparent; color:white;',
                        iconCls:'fas fa-search',
                        handler : function() {
                            me.down('#tagGridView').getStore().loadPage(pageNum);
                        }
                    },{
                        xtype:'button',
                        text: '추가',
                        handler: function() {
			        	    //var selection = me.down('#aasxGridView').getSelectionModel().getSelection()[0];
			        	    createAddForm();
                        }
                    },{
                        xtype:'button',
                        text: '수정',
                        handler: function() {
                            if(me.down('#tagGridView').getSelectionModel().getSelection().length < 1){
                                Ext.Msg.alert('수기 삭제', '수정할 수기를 선택해주세요');
                            }
                        	var data = me.down('#tagGridView').getSelectionModel().getSelection()[0].data;
			        	    createEditForm(data);
                        }
                    },{
                        xtype:'button',
                        text: '삭제',
                        handler: function() {
                            if(me.down('#tagGridView').getSelectionModel().getSelection().length < 1){
                                Ext.Msg.alert('수기 삭제', '삭제할 수기를 선택해주세요');
                            }
			        	    var data = me.down('#tagGridView').getSelectionModel().getSelection()[0].data;
                            createDeleteForm(data);
                        }
                    },{
                        xtype:'box',
                        flex:1
                    },{
                        xtype: 'pagingtoolbar',
                        border: false,
                        componentCls:'log_pagebar_child',
                        store: tagListStore,
                        displayInfo: true,
                        //flex: 2,
                        displayMsg : '검색결과 {0} - {1} of {2}',
                        inputItemWidth: 40,
                        refreshText: {text: '새로고침'},
                        firstText : {text: '처음페이지'},
                        prevText : {text: '이전페이지'},
                        nextText : {text: '다음페이지'},
                        lastText : {text: '마지막페이지'},
                        emptyMsg: "검색결과가 없습니다.",
                        listeners:{
                            beforechange: function(ts, page, eOpts){
                                pageNum = page;
                            },
                            render:function ( ts , eOpts ) {
                            }
                        }

                    }]
                }]
            }]
        });

        me.callParent(arguments);
    }
});