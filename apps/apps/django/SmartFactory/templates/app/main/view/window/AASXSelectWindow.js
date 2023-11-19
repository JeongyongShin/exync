Ext.define('app.view.window.AASXSelectWindow', {
    alias : 'widget.AASXSelectWindow',
    extend: 'Ext.window.Window',   // extend
    title: 'AASX 파일 열기',
    modal: true,
    shadow:false,
    width: 1000,
    height:600,
    layout: 'fit',
    initComponent: function() {
        var me = this;

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

        Ext.apply(this, {
            items: [{
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
                        itemId:'AASXSelectWindowSearchText',
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

                            let val = me.down('#AASXSelectWindowSearchText').getValue();
                            if (val.length > 0) {
                                me.filterStore(val);
                                me.filterStore(val);
                            }
                        }
                    },{
                        xtype:'button',
                        text: '열기',
                        handler: function() {
                            Ext.getCmp('MainTreePanel').getAASX(me.down('#aasxGridView').getSelectionModel().getSelection()[0].data);
    	        		    me.close();
                        }
                    },{
                        xtype:'box',
                        flex:1
                    },{
                        xtype: 'pagingtoolbar',
                        border: false,
                        componentCls:'log_pagebar_child',
                        store: me.store,
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