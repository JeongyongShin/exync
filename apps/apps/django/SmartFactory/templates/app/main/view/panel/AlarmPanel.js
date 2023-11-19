Ext.define('app.view.panel.AlarmPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.AlarmPanel',
    style:{'background-color':'#252529'},
    initComponent: function() {
        let me = this;
        var cType = null;
        var pName = '';
        var pageNum = 1;


        var evt = Ext.create('Ext.data.Store', {
  	      fields:['abbr','name'],
  	      data : [{"abbr":'0', "name":"ALL"},
  	    	      {"abbr":'01', "name":"발송자"},
  	    	      {"abbr":'02', "name":"발송번호"},
  	    	      {"abbr":'02', "name":"발생위치"},
  	    	      {"abbr":'02', "name":"태그"},
  	    	      {"abbr":'02', "name":"코드"}]
		});

        var tagListStore = Ext.create('app.store.AlarmLogList',{
            listeners: {
       			beforeload:function(store, operation, eOpts){
    				operation.setParams({
    				        type:cType,
    						search: pName.length>0?pName:null,
    						to:me.down('#alarmTo').getSubmitValue(),
    						from:me.down('#alarmFrom').getSubmitValue(),
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

        function createAlarmConfig(){
            var addWindow = null;
            var addForm = Ext.create('Ext.form.Panel', {
		        bodyPadding: 5,
		        layout: 'anchor',
			    fieldDefaults:{
			        labelAlign:'top',
			        anchor:'100%',
			        msgTarget:'under'
			    },
		        items: [{
		            xtype:'textareafield',
		            itemId:'alarmJsonValue',
		            fieldLabel:'JSON',
		            name: 'jsonValue',
		            height:'100%',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		        }],
		        // Reset and Submit buttons
		        buttons: [{
		            text: 'EXPORT',
		            handler : function() {
		            }
		        },{
                    xtype:'box',
                    flex:1
                },{
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
                                url: '/alarm/edit',
                                method:'POST',
                                params:params,
                                timeout: 10000,
                                success:function( response, request ){
                                    let res = JSON.parse(response.responseText);
                                    if(res.code == 100){
                                        Ext.Msg.alert('수기 추가','저장하였습니다');
                                        me.down('#alarmGridView').getStore().loadPage(pageNum);
                                        addWindow.close();
                                    }if(res.code == -2){
                                        Ext.Msg.alert('수기 추가','등록된 수기입니다.');
                                    }else{
                                        Ext.Msg.alert('수기 추가.', '오류가 발생하였습니다 다시시도해주세요');
                                    }
                                },
                                failure: function( result, request ){
                                    Ext.Msg.alert('수기 추가.', '오류가 발생하였습니다 다시시도해주세요');
                                }
                            });
                        }
		            }
		        },{
		            text: '취소',
		            handler : function() {
		            	addWindow.close();
		            }
		        }]
		    });

			addWindow = Ext.create('Ext.window.Window', {
			    title: '알람 설정',
			    layout: 'fit',
			    modal: true,
			    shadow:false,
			    width:500,
			    height:500,
			    items: [addForm]
			});
			addWindow.show();
        }

        function createDeleteForm(datas){
            if(datas ==  null || datas.length == 0){
                Ext.Msg.alert('알림 삭제', '삭제할 알람을 선택하세요');
                return;
            }
            let len = datas.length;
            Ext.MessageBox.confirm('알람 삭제', '선택한 '+len+' 개의 알림을 삭제하시겠습니까?', function(btn){
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
                                me.down('#alarmGridView').getStore().loadPage(pageNum);
                            }else{
                                Ext.Msg.alert('알림 삭제', '오류가 발생하였습니다 다시시도해주세요');
                            }
                        },
                        failure: function( result, request ){
                            Ext.Msg.alert('알림 삭제', '오류가 발생하였습니다 다시시도해주세요');
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
                itemId:'alarmGridView',
                xtype:'grid',
                //layout:'fit',
                //forceFit: true,
                store: tagListStore,
                emptyText: cs('목록이 없습니다.'),
                cls:'grid_custom',
                multiSelect: true,
                columns: [
                    { text: '발생시간',  dataIndex: 'alarmDte' ,width:200,
                        renderer: function(value){
                            if(value != null && value.length > 0)return value.replace('T',' ');
                        }
                    },
                    { text: '발생위치',  dataIndex: 'location' ,width:190},
                    { text: '중요도',  dataIndex: 'imp' ,width:150},
                    { text: '코드',  dataIndex: 'code' ,width:100},
                    { text: '태그',  dataIndex: 'tagId' ,width:250},
                    { text: '내용',  dataIndex: 'desc' ,flex:1}

                ],
                listeners: {
                    render: function(panel) {
                        panel.getStore().loadPage(pageNum);
                    },
                    itemdblclick: function( ts, record, item, index, e, eOpts ) {
                        	var data = me.down('#alarmGridView').getSelectionModel().getSelection()[0].data;
			        	    createEditForm(data);
                    }
                },
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    cls:'log_pagebar',
                    items: [{
                        xtype: 'datetimefield',
                        itemId: 'alarmTo',
                        format: 'Y-m-d H:i:s',
                        name: 'from_date',
                        width: 180,
                        cls:'log_datefield',
                        value: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 00, 00, 00),
                        allowBlank: false
                    },'~',{
                        xtype: 'datetimefield',
                        itemId: 'alarmFrom',
                        format: 'Y-m-d H:i:s',
                        name: 'to_date',
                        width: 180,
                        cls:'log_datefield',
                        value: new Date(),
                        allowBlank: false
                    },' ',{
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
                                    me.down('#alarmGridView').getStore().loadPage(pageNum);
                                }
                            }

                        }
                    },{
                        xtype: 'button',
                        style:  'background: transparent; color:white;',
                        iconCls:'fas fa-search',
                        handler : function() {
                            me.down('#alarmGridView').getStore().loadPage(pageNum);
                        }
                    },{
                        xtype:'button',
                        text: '알람 설정',
                        handler: function() {
			        	    createAlarmConfig();
                        }
                    },{
                        xtype:'button',
                        text: '삭제',
                        handler: function() {
			        	    createDeleteForm(me.down('#alarmGridView').getSelectionModel().getSelection());
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