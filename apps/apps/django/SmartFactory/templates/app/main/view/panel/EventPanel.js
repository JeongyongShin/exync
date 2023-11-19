Ext.define('app.view.panel.EventPanel',{
    extend : 'app.view.frame.DefaultPanel',
    id: 'eventPanel',
    style:  'background: #212124',
    alias : 'widget.EventPanel',
    initComponent: function() {
        var me = this;
		var win = null;

		var logType = '0';
		
        var pageNum = 1;
        var pagerowCount = 50;
        var limit = pagerowCount;
        var isRefStart = true;

		var events = Ext.create('app.store.Event',{
        	autoLoad: true,
        	pageSize: 50,
    		listeners: {
    			beforeload:function(store, operation, eOpts){
    				operation.setParams({
    						type: logType,
    						to:Ext.getCmp('EP_DATE_TO').getSubmitValue(),
    						from:Ext.getCmp('EP_DATE_FROM').getSubmitValue(),
	                		start: limit - pagerowCount,
	                        limit: pagerowCount
    				});
    			},
    			load:function(ts,records, successful, eOpts){
    				isRefStart = false;
    			}
    		}
        });
		
		var evt = Ext.create('Ext.data.Store', {
  	      fields:['abbr','name'],
  	      data : [{"abbr":'0', "name":"미확인"},
  	    	      {"abbr":'1', "name":"확인"},
  	    	      {"abbr":'2', "name":"ALL"}]
		});
		
        Ext.apply(this, {
        	reloadData:function(){
	            //Ext.getCmp('EP_EVENTLIST').getStore().loadPage(pageNum);
            },
            searchEvent:function(start,end,type){
            	if(start != null) Ext.getCmp('EP_DATE_TO').setValue(start);
            	if(end != null) Ext.getCmp('EP_DATE_FROM').setValue(end);
            	if(type != null){Ext.getCmp('EP_COMBO').select(type+'');logType = type;}
            	if(isRefStart == false) searchEventList();
            },
            dockedItems: [{
                xtype: 'toolbar',
                border:false,
            	padding :'0 0 0 0',
                height: 60,
                style:'background-color:transparent',
                items: [{
					xtype: 'button', 
		        	text: '일괄 등록',
		        	cls:'log_button',
	            	listeners : {
			        	click : function() {
		        		}
			        }
	            },{
					xtype: 'button', 
		        	text: '일괄 다운로드',
		        	cls:'log_button',
	            	listeners : {
			        	click : function() {
		        		}
			        }
	            },'->',{
                	id:'EP_COMBO',
		        	xtype:'combo',
		            editable: false,
		            store: evt,
		            cls:'log_combo',
		            width:100,
		            queryMode: 'local',
		            displayField: 'name',
		            valueField: 'abbr',
		            value: '0',
			        listeners : {
			        	select : function(combo, record, eOpts) {
			        		if(record.data.abbr == '2')logType = '';
			        		else logType = record.data.abbr;
			        		searchEventList();
		        		}
			        }
		        },{
                	xtype: 'datetimefield',
                	id: 'EP_DATE_TO',
                    format: 'Y-m-d H:i:s',
                    name: 'from_date',
                    width: 180,
                    cls:'log_datefield',
                    value: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 00, 00, 00),
    		        allowBlank: false
                },'~',
           		{ 
                	xtype: 'datetimefield',
                	id: 'EP_DATE_FROM',
                    format: 'Y-m-d H:i:s',
                    name: 'to_date',
                    width: 180,
                    cls:'log_datefield',
                    value: new Date(),
                    allowBlank: false
                },
           		{
					xtype: 'button', 
		        	iconCls: 'fa fa-search',
		        	cls:'log_button',
                	listeners : {
			        	click : function() {
			        		searchEventList();
		        		}
			        }
                }/*,{
					xtype: 'button', 
		        	iconCls: 'icon-export',
		        	cls:'log_button',
		        	tooltip: {
		        		text: 'Export'
		        	},
			        listeners : {
		        		click : function(a){
		        			if(Ext.getCmp('EP_EVENTLIST').getStore().getRange().length > 0){
		        				var urls = '/log/exel/list';
				        		urls+='?logType='+logType;
				        		urls+='&to='+Ext.getCmp('EP_DATE_TO').getSubmitValue();
				        		urls+='&from='+Ext.getCmp('EP_DATE_FROM').getSubmitValue();
				        		document.location = urls;
		        			}else{
			    				Ext.Msg.alert('장애 / 이벤트 목록','데이터가 없습니다.');
		        			}
		        		}
		        	}
				}*/]
            }],
            
            items:[{
            	flex:1,
            	layout:{type: 'vbox',align: 'stretch'},
            	
                border:false,
                items:[{
                	height:2,
                	style:"background-color:#d0d0d0"
                },{
                	flex:1,
                	id:'EP_EVENTLIST',
                	xtype:'grid',
    		    	forceFit: true,
                    store: events,
                    emptyText: '데이터가 없습니다.',
                    cls:'log_grid',
                    selModel: {
                        type: 'checkboxmodel',
                        checkOnly: true
                    },
                    //plugins: [Ext.create('app.view.roweditor.EventRowEditing')],
                    plugins: {ptype: 'cellediting', clicksToEdit: 1,
                    	listeners: {

                    	}
                    },
                    listeners: {
                        scope: me
                       ,itemcontextmenu: function(tree, record, item, index, e, eOpts ) {
                          // Optimize : create menu once
                          var menu_grid = new Ext.menu.Menu({ items:
                            [
                            	{text : '확인'}, 
                            	{text : '다운로드'}, 
                            	{text : '확인/다운로드'}
                            ],
                            listeners: {
                                click: function(menu, item){
                                	if(item.text=='확인'){
                                		Ext.Ajax.request({
                	    	    		    url: '/event/edit/check',
                	    	    		    method:'POST',
                	    	    		    headers: { 'Content-Type': 'application/json' },
                	    	    		    jsonData:{eNo:e.record.data.eNo},
                	    	    		    timeout: 10000,
                	    	    			success:function( result, request ){
                	        	        		showLoading(false, me);
                	        	                Ext.getCmp('EP_EVENTLIST').getStore().loadPage(pageNum);
                	    	    			},
                	    	    			failure: function( result, request ){
                	        	        		showLoading(false, me);
                	    	    			}
                	            		});
                                		
                                	}
                                },
                            }
                            });
                          // HERE IS THE MAIN CHANGE
                          var position = [e.getX()-10, e.getY()-10];
                          e.stopEvent();
                          menu_grid.showAt(position);
                       },
                       cancelEdit: function(rowEditing, context) {
                       },
                       edit: function(editor, e) {
                    	   let data = e.record.data;
       	        		showLoading(true, me);

   	            		Ext.Ajax.request({
	    	    		    url: '/event/edit/tag',
	    	    		    method:'POST',
	    	    		    headers: { 'Content-Type': 'application/json' },
	    	    		    jsonData:{eNo:e.record.data.eNo,desc:e.record.data.desc},
	    	    		    timeout: 10000,
	    	    			success:function( result, request ){
	        	        		showLoading(false, me);
	    	    			},
	    	    			failure: function( result, request ){
	        	        		showLoading(false, me);
	    	    			}
	            		});
                       }
                   },
                    columns: [
                        
                        { text: '시간', dataIndex: 'time',width:250,
                        	renderer: function(value,metaData,record){
                        		if(value.length > 26) return value.substring(0,26);
                        		else return value;
                        }},
                        { text: 'ID', dataIndex: 'busId',width:130},
                        { text: '버스번호', dataIndex: 'busNo',width:150},
                        { text: '차랑번호', dataIndex: 'regNo',width:150},
                        { text: '위치', dataIndex: 'point',width:150,
                        	renderer: function(value,metaData,record){
		                    if (value == '0') return 'BMS';
		                    else if (value == '1') return 'Morter';
		                    else if (value == '2') return 'Battery';
		                    else if (value == '3') return 'etc';
		                    else return '';
                    	}},
                        { text: '내용', dataIndex: 'data',flex:1,
                        	renderer: function(value,metaData,record){
                        		return eventParser(value);

                        }},
                        { text: '코멘트', dataIndex: 'desc',flex:0.5,
                            editor: {
                                completeOnEnter: true,
                                allowBlank: true,
                                selectOnFocus: true
                            }
                        }/*,
                        {
                            text: '위치',
                            width:400,
                            columns: [{
                                text: '버스',
                                dataIndex: 'type',
                                flex:1,
                            	renderer: function(value,metaData,record){
        		                    if (value == '04') return 'State';  else return '';
                            	}
                            },{
                                text: '배터리',
                                dataIndex: 'type',
                                flex:1,
                            	renderer: function(value,metaData,record){
        		                    if (value == '01') return 'State';  else return '';
                            	}
                            },{
                                text: '모터',
                                dataIndex: 'type',
                                flex:1,
                            	renderer: function(value,metaData,record){
        		                    if (value == '02') return 'State';  else return '';
                            	}
                            },{
                                text: '기타',
                                dataIndex: 'type',
                                flex:1,
                            	renderer: function(value,metaData,record){
        		                    if (value == '03') return 'State';  else return '';
                            	}
                            }]
                        },

                        { text: 'Type', dataIndex: 'logType',flex:1,
                        	renderer: function(value,metaData,record){
    		                    if (value == '01') return 'State';
    		                    else if(value == '02') return 'Error';
                        	}
                        }
                        *
                        *
                        */
                    ],
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        cls:'log_pagebar',
                        items: [{xtype:'box',flex:1},{
                    		xtype: 'pagingtoolbar',
                            border: false,
                            componentCls:'log_pagebar_child',
        		            store: events,
        		            displayInfo: true,
        		            flex: 2,
                            displayMsg : '검색결과 {0} - {1} of {2}',
                            inputItemWidth: 40,
                            refreshText: {
                            	text: '새로고침'
                            },
                            firstText : {
                            	text: '처음페이지'
                            },
                            prevText : {
                            	text: '이전페이지'
                            },
                            nextText : {
                            	text: '다음페이지'
                            },
                            lastText : {
                            	text: '마지막페이지'
                            },
                            emptyMsg: "검색결과가 없습니다.",
        		            listeners:{
        		            	beforechange: function(ts, page, eOpts){
        		            		pageNum = page;
        		            		limit = page * pagerowCount;
        		            	},
        		            	render:function ( ts , eOpts ) {
        		            	}
        		            }
        		            
        			    }]
                    }]
                }]
            }]
        });
        
        
        function searchEventList(){
        	if(Ext.getCmp('EP_DATE_TO').getSubmitValue() > Ext.getCmp('EP_DATE_FROM').getSubmitValue()){
				Ext.Msg.alert('장애 / 이벤트 목록','날짜를 확인해주세요');
        	}
    		limit = pagerowCount;
    		pageNum = 1;
            Ext.getCmp('EP_EVENTLIST').getStore().loadPage(pageNum);
        }

        me.callParent(arguments);
    }
});


/*Ext.define('app.view.panel.EventPanel',{
    extend : 'app.view.frame.DefaultPanel',
    id: 'alarmPanel',
    alias : 'widget.EventPanel',
    initComponent: function() {
        var me = this;
        
        var data = Ext.create('Ext.data.Store', {
        	fields: ['no', 'name', 'value', 'alarm', 'packet', 'type', 'desc'],
            data : []
        });

        Ext.apply(this, {
        	reloadData:function(){
        		//Ext.getCmp('UP_USERLIST').getStore().load();
            },
            dockedItems: [],
            items:[{
            	flex:1,
            	layout:{type: 'hbox',align: 'stretch'},
            	
                border:false,
                items:[{
            		flex:1,
                	id:'AP_ALARMLIST',
                	xtype:'grid',
                	padding :'0 10px 0 10px',
			    	forceFit: true,
                    store: data,
                    emptyText: '데이터가 없습니다.',

                    cls:'log_grid',
                    columns: [
                        { text: '이벤트명',  dataIndex: 'no' ,width:70},
                        { text: '발생시간', dataIndex: 'name',width:250},
                        { text: '메세지', dataIndex: 'value',width:70},
                        { text: '중요도', dataIndex: 'alarm',width:70},
                        { text: 'Ack', dataIndex: 'packet',width:250}
                        
                    ]
                }]
            }]
        });

        me.callParent(arguments);
    }
});*/