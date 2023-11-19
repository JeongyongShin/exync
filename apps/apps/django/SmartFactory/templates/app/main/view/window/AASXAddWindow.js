Ext.define('app.view.window.AASXAddWindow', {
    alias : 'widget.AASXAddWindow',
    extend: 'Ext.window.Window',   // extend
    title: 'AASX 파일 관리',
    modal: true,
    shadow:false,
    width: 1000,
    height:600,
    layout: 'fit',
    initComponent: function() {
        var me = this;

        Ext.apply(this, {
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'bottom',
                style:  'background: transparent',
                height :'auto',
                items:[{
                	xtype:'button',
                    text: '추가',
                    handler: function() {
                    }
                },{
                	xtype:'button',
                    text: 'EXPORT',
                    handler : function() {
                        let selection = me.down('#aasxGridView').getSelectionModel().getSelection();
                        if(selection.length == 0){
                            Ext.Msg.alert('AASX 파일 관리', '파일을 선택헤주세요');
                        }else{
                            console.log(selection[0].data.aasxNm);
                            return;
                            Ext.Ajax.request({
                                url: '/aasx/opcua?aasxNm='+selection[0].data.aasxNm,
                                method:'GET',
                                //headers: { 'Content-Type': 'application/json' },
                                timeout: 10000,
                                success:function( response, request ){
                                    console.log(response);
                                },
                                failure: function( result, request ){
                                }
                            });
                        }
                    }
                },'->',{
                	xtype:'button',
                    text: '보기',
                    handler: function() {
                        Ext.getCmp('MainTreePanel').getAASX(me.down('#aasxGridView').getSelectionModel().getSelection()[0].data);
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
                itemId:'aasxGridView',
                xtype:'grid',
                //layout:'fit',
                //forceFit: true,
                store: me.store,
                emptyText: cs('목록이 없습니다.'),
                cls:'grid_custom',
                multiSelect: false,
                columns: [{
                        text: '',
                        dataIndex: 'imgUrl',
                        width:70,
                        renderer: function(value){
                            if(value != null)return '<img src="/resources/data/' + value + '" height="50" />';
                            else return '<div style="height:50px; text-align:center;">'+cs('No Image')+'</div>';
                        }
                    },
                    { text: 'AAS명',  dataIndex: 'aasxNm' ,width:300},
                    { text: '버전',  dataIndex: 'ver' ,width:70},
                    { text: '설명',  dataIndex: 'desc' ,flex:1},
                    { text: '생성일',  dataIndex: 'createDte' ,width:190}
                ],
                listeners: {
                    render: function(panel) {
                        this.getSelectionModel().select(me.selection);
                    },
                    itemdblclick: function( ts, record, item, index, e, eOpts ) {
    	        		Ext.getCmp('MainTreePanel').getAASX(record.data);
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