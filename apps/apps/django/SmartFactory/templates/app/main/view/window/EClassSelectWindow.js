Ext.define('app.view.window.EClassSelectWindow', {
    alias : 'widget.EClassSelectWindow',
    extend: 'Ext.window.Window',   // extend
    title: 'EClass 검색',
    modal: true,
    shadow:false,
    width: 1000,
    height:600,
    layout: 'fit',
    initComponent: function() {
        var me = this;
        var cType = null;
        var pName = '';
        var pageNum = 1;

        var evt = Ext.create('Ext.data.Store', {
  	      fields:['abbr','name'],
  	      data : [{"abbr":'0', "name":"ALL"},
  	    	      {"abbr":'02', "name":"Property"},
  	    	      {"abbr":'05', "name":"Unit"},
  	    	      {"abbr":'07', "name":"Value"}]
		});

        var aasxListStore = Ext.create('app.store.EClassList',{
            listeners: {
       			beforeload:function(store, operation, eOpts){
    				operation.setParams({
    				        type:cType,
    						pName: pName.length>0?pName:null,
	                		page: pageNum
    				});
    			},
    			load :function( ts , records , successful , operation , eOpts ){
                    if(me.isFirst && records.length > 0){
                        me.isFirst = false;
                        me.selectionAASX = records[me.selectionTree].data;
                        aasxStore.load();
                    }
        		}
    		}
        });

        Ext.apply(this, {
            dockedItems:[{
                xtype: 'toolbar',
                border:false,
            	padding :'0 0 0 0',
                height: 60,
                style:'background-color:transparent',
                items: [{
                	itemId:'EClassSelectWindow.SearchCombo',
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
                                me.down('#EClassSelectWindowEClassGrid').getStore().loadPage(pageNum);
                            }
                        }

                    }
                },{
					xtype: 'button',
		        	iconCls: 'fa fa-search',
		        	cls:'log_button',
                	listeners : {
			        	click : function() {
                                me.down('#EClassSelectWindowEClassGrid').getStore().loadPage(pageNum);
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
            },{
                xtype: 'toolbar',
                dock: 'bottom',
                style:  'background: transparent',
                height :'auto',
                items:['->',{
                	xtype:'button',
                    text: '선택',
                    handler: function() {
                    }
                }, {
                	xtype:'button',
                    text: '취소',
                    handler : function() {
                    	me.close();
                    }
                }]
            }],
            items: [{
                itemId:'EClassSelectWindowEClassGrid',
                xtype:'grid',
                layout:'fit',
                //forceFit: true,
                store: aasxListStore,
                emptyText: cs('목록이 없습니다.'),
                cls:'grid_custom',
                multiSelect: false,
                columns: [
                    { text: 'IRID',  dataIndex: 'irid' ,width:150},
                    { text: 'PreferredName',  dataIndex: 'pName' ,width:250},
                    { text: 'Definition',  dataIndex: 'deft' ,flex:1},
                    { text: 'resol',  dataIndex: 'resol' ,width:50}
                ],
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    cls:'log_pagebar',
                    items: [{xtype:'box',flex:1},{
                        xtype: 'pagingtoolbar',
                        border: false,
                        componentCls:'log_pagebar_child',
                        store: aasxListStore,
                        displayInfo: true,
                        flex: 2,
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
                }],
                listeners: {
                    render: function(panel) {
                    },
                    itemdblclick: function( ts, record, item, index, e, eOpts ) {
    	        		//Ext.getCmp('MainTreePanel').getAASX(record.data);
    	        		me.close();
                    }
                }
            }/*{
        		layout:{type: 'vbox',align: 'stretch'},
            	xtype:'panel',
                width:'100%',
                style:  'background: transparent',
            	itemId:'AASXSelectWindowList',
            	autoScroll:true,
            	listeners : {
            		render: function(panel) {
            			me.reloadData();
            		}
            	}
        	}*/],
        	reloadData: function(){ 
        		me.setDataViewPanel();

            },
            setDataViewPanel: function(){

            	me.store.each(function(record){
    				var menu = Ext.create('app.view.frame.MainTreeDataViewPanel',{
    					deps:-1,
    					aasx:record.data,
                    	listeners : {
                    		render: function(panel) {
                    			panel.body.on('click', function(ts) {
                    			    me.down('#AASXSelectWindowList').items.each(function(panel){
                                        panel.setItemSelected(false);
            	                    });
                                    panel.setItemSelected(true);
                    			});
                    		}
                    	}
                    });
	        		me.down('#AASXSelectWindowList').add(menu);
                });
            },
        	
        });
        me.callParent(arguments);

    }
});