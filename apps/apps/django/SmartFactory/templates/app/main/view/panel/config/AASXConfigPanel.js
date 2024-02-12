Ext.define('app.view.panel.config.AASXConfigPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.AASXConfigPanel',
    style:{'background-color':'#252529'},
    initComponent: function() {
        let me = this;
        var keyword = '';
        var pageNum = 1;

        var aasxListStore = Ext.create('app.store.AASXList',{
            autoLoad:true,
            listeners: {
       			beforeload:function(store, operation, eOpts){
    				operation.setParams({
    						search: keyword.length>0?keyword:null,
	                		page: pageNum
    				});
    			},
    			load :function( ts , records , successful , operation , eOpts ){
                    if(me.isFirst && records.length > 0){
                        me.isFirst = false;
                        me.selectionAASX = records[me.selectionTree].data;
                        me.down('#aasxGridView').getStore().loadPage(pageNum);
                    }
        		}
    		}
        });

        function createAddForm(){
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
		            xtype:'filefield',
		            fieldLabel: 'AASX 파일',
		            name: 'file',
                    buttonConfig: {
                        text :'추가',
                        width: 50
                    },
		            maxLength:100,
			        allowBlank: false,
		            blankText: '등록할 파일을 선택하세요.',
                    listeners: {
                        change: function (filefield) {
                            addFile = filefield.fileInputEl.dom.files[0];
                            let an = addFile.name.split('.')[0];
                            addForm.getForm().findField('aasxNm').setValue(an);
                        }
                    }
		        },{
		            fieldLabel: 'AAS명',
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
		                    var fileForm = new FormData();
		                    fileForm.append('file',addFile);
		                    for ( var key in imgF.getValues() ) {
                                fileForm.append(key, imgF.getValues()[key]);
                            }
                    	    showLoading(true, addWindow);

                            $.ajax({
                                url : '/aasx/add',
                                //params : this.base_params || this.baseParams || this.params,
                                type : 'POST',
                                data : fileForm,
                                processData: false,
                                contentType: false,
                                timeout: 60000,
                                success:function( response, request ){
    		                    showLoading(false, addWindow);
                                    //let res = JSON.parse(response.responseText);
                                    if(response.code == 100){
                                        me.down('#aasxGridView').getStore().loadPage(pageNum);
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
		            text: '취소_',
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

        function createEditForm(selection){
            var editWindow = null;
            var editForm = null;
            console.log("createEditForm --- selection:", selection); // 로깅 추가
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
                    fieldLabel: 'ID',
                    name: 'id',
                    value: selection.id,
                },{
		            fieldLabel: '생성자',
                    name: 'userId',
                    value: selection.data.fields.userId,
		        },{
		            fieldLabel: 'AAS명',
		            name: 'aasxNm',
		            value: selection.data.aasxNm,
		            maxLength:100,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다',
		        },{
		            fieldLabel: '버전',
		            name: 'ver',
		            maxLength:10,
		            maxLengthText:'최대 입력수 {0}',
		            value: selection.data.ver,
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        },{
		            fieldLabel: '설명',
		            name: 'desc',
		            value: selection.data.desc,
		            maxLength:1000,
		            maxLengthText:'최대 입력수 {0}',
			        allowBlank: false,
		            blankText: '필수입력 입니다'
		        }],
		        // Reset and Submit buttons
		        buttons: [{
		            text: '수정',
		            formBind: true, //only enabled once the form is valid
		            disabled: true,
		            handler: function() {
		                showLoading(true, editWindow);
                        var form = editForm.getForm();
                        console.log("Form data before submit:", form.getValues()); // 로깅 추가
                        if (form.isValid()) {
                            console.log("Form is valid, submitting..."); // 유효성 검사 성공시 로깅 추가
                        }

                    // selection 객체에서 pk 값을 추출하여 aasx_id로 설정합니다.
                    var aasxId = selection.data.pk;  // 데이터베이스의 기본 키 값을 사용합니다.


                        Ext.Ajax.request({
                            url: '/aasx/edit',
                            method: 'POST',
                            params: {
                                aasx_id: aasxId,
                                aasxNm: form.findField('aasxNm').getValue(),
                                ver: form.findField('ver').getValue(),
                                desc: form.findField('desc').getValue()
                            },


                            success: function(response, opts) {
                                showLoading(false, editWindow);
                                var result = Ext.decode(response.responseText);
                                if(result.error) {
                                    Ext.Msg.alert('수정 실패', result.message);
                                } else {
                                    Ext.Msg.alert('AASX 수정 완료', '수정하였습니다');
                                    editWindow.close();
                                    Ext.getCmp('Usgrid').getStore().loadPage(pageNum);
                                }
                            },
                            failure: function(response, opts) {
                                showLoading(false, editWindow);
                                console.log('server-side failure with status code ' + response.status);
                                Ext.Msg.alert('서버 오류', '수정을 완료할 수 없습니다.');
                            }
                        });
                        




		            }
		        }, {
		            text: '취소_',
		            handler : function() {
		            	editWindow.close();
		            }
		        }]
		    });

			editWindow = Ext.create('Ext.window.Window', {
			    title: 'AASX파일 수정',
			    layout: 'fit',
			    modal: true,
			    items: [editForm]
			});
			editWindow.show();
        }

        function createDeleteForm(selection){
            Ext.MessageBox.confirm('AASX파일 삭제', '해당 AASX파일을 삭제하시겠습니까?', function(btn){
                if (btn == 'yes'){

                    Ext.Ajax.request({
                        url: '/aasx/del',
                        method:'POST',
                        timeout: 10000,
                        params:{
                            aasxNo:selection.data.aasxNo
                        },
                        success:function( response, request ){
                            me.down('#aasxGridView').getStore().loadPage(pageNum);
                        },
                        failure: function( result, request ){
                        }
                    });

                }
            });
        }
        
        Ext.apply(this, {
        	reloadData:function(){
            },
            dockedItems: [],
            items:[{
                itemId:'aasxGridView',
                xtype:'grid',
                //layout:'fit',
                //forceFit: true,
                store: aasxListStore,
                emptyText: cs('목록이 없습니다.'),
                cls:'grid_custom',
                multiSelect: false,
                columns: [{
                        text: '',
                        dataIndex: 'imgUrl',
                        width:70,
                        renderer: function(value,metaData,record){
                            if(value != null && value.length > 0) return '<img src="/aasx/thumbnail?aasxNm='+record.data.aasxNm+'&path=' + value + '" height="50" />';
                            else return '<div style="height:50px; text-align:center;">'+cs('No Image')+'</div>';
                        }
                    },
                    { text: 'AAS명',  dataIndex: 'aasxNm' ,width:300},
                    { text: '버전',  dataIndex: 'ver' ,width:70},
                    { text: '설명',  dataIndex: 'desc' ,flex:1},
                    { text: '생성일',  dataIndex: 'createDte' ,width:190,
                        renderer: function(value){
                            if(value != null && value.length > 0)return value.replace('T',' ');
                        }
                    }
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
                    },{
                        xtype: 'button',
                        style:  'background: transparent; color:white;',
                        iconCls:'fas fa-search',
                        handler : function() {
                            me.down('#aasxGridView').getStore().loadPage(pageNum);
                        }
                    },' ',{
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
                        	var selection = me.down('#aasxGridView').getSelectionModel().getSelection()[0];
			        	    createEditForm(selection);
                        }
                    },{
                        xtype:'button',
                        text: '삭제',
                        handler: function() {
			        	    var selection = me.down('#aasxGridView').getSelectionModel().getSelection()[0];
                            createDeleteForm(selection);
                        }
                    },'|',{
                        xtype:'button',
                        text: '다운로드',
                        handler: function() {
                            if(me.down('#aasxGridView').getSelectionModel().getSelection().length < 1){
                                Ext.Msg.alert('AASX 다운로드', '파일을 선택헤주세요');
                            }else{

                        	    let data = me.down('#aasxGridView').getSelectionModel().getSelection()[0].data;
                                location.href = '/aasx/download?aasxNm='+data.aasxNm;
                            }
                        }
                    },{
                        xtype:'button',
                        text: 'EXPORT',
                        handler: function() {

                            let selection = me.down('#aasxGridView').getSelectionModel().getSelection();
                            if(selection.length == 0){
                                Ext.Msg.alert('AASX 파일 관리', '파일을 선택헤주세요');
                            }else{
                                Ext.Ajax.request({
                                    url: '/aasx/opcua?aasxNm='+selection[0].data.aasxNm,
                                    method:'GET',
                                    //headers: { 'Content-Type': 'application/json' },
                                    timeout: 10000,
                                    success:function( response, request ){
                                            alert('작업을 완료하였습니다.');
                                    },
                                    failure: function( result, request ){
                                            alert('처리중 오류가 발생하였습니다.');
                                    }
                                });
                            }
                        }
                    },{
                        xtype:'box',
                        flex:1
                    },{
                        xtype: 'pagingtoolbar',
                        border: false,
                        componentCls:'log_pagebar_child',
                        store: aasxListStore,
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