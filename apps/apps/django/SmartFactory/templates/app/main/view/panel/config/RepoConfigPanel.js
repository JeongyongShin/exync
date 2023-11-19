Ext.define('app.view.panel.config.RepoConfigPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.RepoConfigPanel',
    style:{'background-color':'#252529'},
    initComponent: function() {
        let me = this;
        var repoUrl = '';
        var repoId = '';
        var repoPwd = '';
        var keyword = '';
        var pageNum = 1;

        var repoListStore = Ext.create('app.store.Repository',{
            autoLoad:false,
            listeners: {
       			beforeload:function(store, operation, eOpts){
    				operation.setParams({
                            url: repoUrl,
                            id: repoId,
                            pwd: repoPwd
    				});
    			},
    			load :function( ts , records , successful , operation , eOpts ){
                    if(me.isFirst && records.length > 0){
                        me.isFirst = false;
                        me.selectionAASX = records[me.selectionTree].data;
                        //me.down('#aasxGridView').getStore().loadPage(pageNum);
                    }
        		}
    		}
        });

        function connectRepositoryForm(){
            var addWindow = null;
            var addForm = null;
			addForm = Ext.create('Ext.form.Panel', {
		        bodyPadding: 5,
		        layout: 'anchor',
			    fieldDefaults:{
			        labelAlign:'left',
			        labelWidth:110,
			        anchor:'100%',
			        msgTarget:'under'
			    },
		        defaultType: 'textfield',
		        items: [{
		            fieldLabel: 'URL',
		            name: 'repoUrl',
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		        },{
		            fieldLabel: 'Repository Id',
		            name: 'repoId',
		            maxLength:20,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		        },{
		            fieldLabel: 'Repository Password',
                    inputType: 'password',
		            name: 'repoPwd',
		            maxLength:20,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        }],
		        // Reset and Submit buttons
		        buttons: [{
		            text: '저장',
		            formBind: true, //only enabled once the form is valid
		            disabled: true,
		            handler: function() {
		                var imgF = addForm.getForm();
                        if (imgF.isValid()) {
                            values = imgF.getValues();
                            repoUrl = values.repoUrl;
                            repoId = values.repoId;
                            repoPwd = values.repoPwd;
                            me.down('#repoGridView').getStore().loadPage(pageNum);
		            	    addWindow.close();
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
			    title: 'AAS Repository 연결',
			    layout: 'fit',
			    modal: true,
			    items: [addForm]
			});
			addWindow.show();
        }


        function createAddForm(selection){
            var addWindow = null;
            var addForm = null;
            var addFile = null;
			addForm = Ext.create('Ext.form.Panel', {
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
		        items: [/*{
		            xtype:'displayfield',
		            fieldLabel: 'AAS명',
		            value: selection.data.userId
		        },*/{
		            fieldLabel: 'AASX 파일명',
		            name: 'aasxNm',
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		        },{
		            fieldLabel: '버전',
		            name: 'ver',
		            maxLength:10,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        },{
		            fieldLabel: '설명',
		            name: 'desc',
		            maxLength:1000,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        }],
		        // Reset and Submit buttons
		        buttons: [{
		            text: '저장',
		            formBind: true, //only enabled once the form is valid
		            disabled: true,
		            handler: function() {
		                var imgF = addForm.getForm();
                        if (imgF.isValid()) {
                            var form = {};
                            form.packageId = selection.data.packageId;
                            form.url = repoUrl;
                            form.id = repoId;
                            form.pwd = repoPwd;
		                    for ( var key in imgF.getValues() ) {
                                form[key] = imgF.getValues()[key];
                            }
		                    console.log(form);

		                    showLoading(true, addWindow);
                            $.ajax({
                                url : '/api/aas/packages/edit',
                                type : 'POST',
                                data : form,
                                timeout: 60000,
                                success:function( response, request ){
                                    showLoading(false, addWindow);
                                    //let res = JSON.parse(response.responseText);
                                    if(response.code == 100){
                                        me.down('#repoGridView').getStore().loadPage(pageNum);
		            	                addWindow.close();
                                    }else if(response.code == -2){
                                        Ext.Msg.alert('AASX파일 추가.', '중복된 AAS 파일명 입니다.');
                                    }else{
                                        Ext.Msg.alert('AASX파일 추가.', '오류가 발생하였습니다 다시시도해주세요');
                                    }
                                },
                                error: function( result, request ){
                                    showLoading(false, addWindow);
                                    Ext.Msg.alert('AASX파일 추가.', '오류가 발생하였습니다 다시시도해주세요');
                                }
                            });
                            /*

                            imgF.submit({
                                useDefaultXhrHeader:false,
                                headers:{'X-CSRFToken':getCookie('csrftoken')},
                                waitMsg : '파일 전송중...',
                                success: function(result, request) {
                                    Ext.Msg.alert('AASX파일 추가','추가되었습니다');
                                },
                                failure: function(form, action) {
                                    Ext.Msg.alert('AASX파일 추가', '실패하였습니다.');
                                }
                            });*/
                        };
		            }
		        }, {
		            text: '취소',
		            handler : function() {
		            	addWindow.close();
		            }
		        }]
		    });

			addWindow = Ext.create('Ext.window.Window', {
			    title: 'AASX파일 추가',
			    layout: 'fit',
			    modal: true,
			    items: [addForm]
			});
			addWindow.show();
        }

        
        Ext.apply(this, {
        	reloadData:function(){
            },
            dockedItems: [],
            items:[{
                itemId:'repoGridView',
                xtype:'grid',
                //layout:'fit',
                //forceFit: true,
                store: repoListStore,
                emptyText: cs('목록이 없습니다.'),
                cls:'grid_custom',
                multiSelect: false,
                columns: [
                    { text: 'AAS IDs',  dataIndex: 'aasIds' ,flex:1,
                    renderer : function(value,metaData,record,rowIndex) {
                        return value.join(',').replaceAll(',','<br/>');
                    }},
                    { text: 'Package ID',  dataIndex: 'packageId' ,width:300}
                ],
                listeners: {
                    render: function(panel) {
                        this.getSelectionModel().select(me.selection);
                    },
                    itemdblclick: function( ts, record, item, index, e, eOpts ) {
    	        		Ext.getCmp('MainTreePanel').getAASX(record.data);
    	        		me.close();
                    }
                },
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    cls:'log_pagebar',
                    items: [{
                        xtype:'textfield',
                        maxHeight:30,
                        style:{height:'30px'},
                        margin:'5px 10px 5px 5px', // (top, right, bottom, left).
                        enableKeyEvents:true,
                        listeners:{
                            change: function( ts, newValue, oldValue, eOpts ){
                                keyword = newValue.trim();
                            },
                            keyup : function( ts, event, eOpts ){
                                if(event.keyCode == 13){
                                    me.down('#aasxGridView').getStore().loadPage(pageNum);
                                }
                            }

                        }
                    },' ',{
                        xtype:'button',
                        text: 'CONNECT',
                        handler: function() {
                            connectRepositoryForm();
                        }
                    },' ',{
                        xtype:'button',
                        text: 'EXPORT',
                        handler: function() {
                            var selection = me.down('#repoGridView').getSelectionModel().getSelection();

                            if(selection.length < 1){
                                Ext.Msg.alert('AASX Export', 'export할 AASX를 선택헤주세요');
                            }else{
                                createAddForm(selection[0]);
                            }

                        }
                    },'|',/*{
                        xtype:'button',
                        text: '다운로드',
                        handler: function() {
                            if(me.down('#repoGridView').getSelectionModel().getSelection().length < 1){
                                Ext.Msg.alert('AASX 다운로드', '파일을 선택헤주세요');
                            }else{

                        	    let data = me.down('#repoGridView').getSelectionModel().getSelection()[0].data;
                                location.href = '/aasx/download?aasxNm='+data.aasxNm;
                            }
                        }
                    },*/{
                        xtype:'box',
                        flex:1
                    },{
                        xtype: 'pagingtoolbar',
                        border: false,
                        componentCls:'log_pagebar_child',
                        store: repoListStore,
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