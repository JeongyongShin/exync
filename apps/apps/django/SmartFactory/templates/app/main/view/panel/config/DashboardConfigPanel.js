Ext.define('app.view.panel.config.DashboardConfigPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.DashboardConfigPanel',
    style:{'background-color':'#252529'},
    initComponent: function() {
        var me = this;

        /*var refStore = new Ext.data.SimpleStore({fields: ['num'],data : [[1,1],[3,3],[5,5],[10,10],[30,30]]});
        var refStore = Ext.create('Ext.data.Store', {
            fields: ['num'],
            data : [
                {"num":"1s"},
                {"num":"3s"},
                {"num":"5s"},
                {"num":"10s"},
                {"num":"30s"}
            ]
        });*/

        var commListStore = Ext.create('app.store.Comm',{
            listeners: {
       			beforeload:function(store, operation, eOpts){
    				operation.setParams({
    				        baseCd:'01'
    				});
    			},
    			load :function( ts , records , successful , operation , eOpts ){
    			    console.log(records);
    			    for(var i=0; i<records.length; i++){
    			        let record = records[i];
    			        if(record.data.commCd == '00001')me.down('#sysUrl').setValue(record.data.item1);
    			        else if(record.data.commCd == '00002')me.down('#devUrl').setValue(record.data.item1);
    			        else if(record.data.commCd == '00003')me.down('#hisUrl').setValue(record.data.item1);
    			    }
        		}
    		}
        });

        Ext.apply(this, {
        	reloadData:function(){
        	    commListStore.loadPage(1);
            },
            dockedItems: [],
            items:[{
            	flex:1,
            	layout:{type: 'vbox',align: 'stretch'},
                border:false,
                padding:'10 10 10 10',
                listeners:{
                    render:function ( ts , eOpts ) {
                        me.reloadData();
                    }
                },
                items:[{
                    xtype:'fieldset',
                    //columnWidth: 0.5,
                    title: '클라우드 상태 모니터링',
                    defaultType: 'textfield',
                    height:'auto',
                    //defaults: {anchor: '100%'},
                    //layout: 'anchor',
                    items :[{
                            itemId:'sysUrl',
                            fieldLabel: 'URL',
                            width:'50%',
                            name: 'sysUrl',
                            inputType:'url',
                            value: 'http://192.168.0.4:3000/login' // 이 부분을 적절한 URL로 수정
                    }/*,{
                        xtype:'combobox',
                        store:refStore,
                        //width:100,
                        queryMode: 'local',
                        editable: false,
                        displayField: 'num',
                        valueField: 'num',
                        itemId:'deviceUrl',
                        fieldLabel: '갱신주기',
                        name: 'deviceUrl',
                        value:'3'
                    }*/,{
                        xtype:'button',
                        text: '변경',
                        handler: function() {
                            let urls = me.down('#sysUrl').getValue();
                            Ext.Ajax.request({
                                url: '/comm/edit',
                                method:'POST',
                                params:{
                                    baseCd:'01',
                                    commCd:'00001',
                                    item1:urls
                                },
                                timeout: 10000,
                                success:function( response, request ){
                                    Ext.Msg.alert('대쉬보드 설정','클라우드 상태 모니터링 설정이 변경되었습니다.');
                                },
                                failure: function( result, request ){
                                    Ext.Msg.alert('대쉬보드 설정','오류가 발생하였습니다 다시시도해주세요.');
                                }
                            });
                        }
                    }]
                },{
                    xtype:'fieldset',
                    //columnWidth: 0.5,
                    title: '기기 모니터링',
                    defaultType: 'textfield',
                    height:'auto',
                    //defaults: {anchor: '100%'},
                    //layout: 'anchor',
                    items :[{
                        itemId:'devUrl',
                        fieldLabel: 'URL',
                        width:'50%',
                        name: 'sysUrl',
                        inputType:'url',
                        value:'http://133.186.215.57/grafana/playlists/play/1?autofitpanels'
                    },/*{
                        xtype:'combobox',
                        store:refStore,
                        //width:100,
                        queryMode: 'local',
                        editable: false,
                        displayField: 'num',
                        valueField: 'num',
                        itemId:'deviceUrl',
                        fieldLabel: '갱신주기',
                        name: 'deviceUrl',
                        value:'1'
                    },*/{
                        xtype:'button',
                        text: '변경',
                        handler: function() {
                            let urls = me.down('#devUrl').getValue();
                            Ext.Ajax.request({
                                url: '/comm/edit',
                                method:'POST',
                                params:{
                                    baseCd:'01',
                                    commCd:'00002',
                                    item1:urls
                                },
                                timeout: 10000,
                                success:function( response, request ){
                                    Ext.Msg.alert('대쉬보드 설정','기기 모니터링 설정이 변경되었습니다.');
                                },
                                failure: function( result, request ){
                                    Ext.Msg.alert('대쉬보드 설정','오류가 발생하였습니다 다시시도해주세요.');
                                }
                            });
                        }
                    }]
                },{
                    xtype:'fieldset',
                    //columnWidth: 0.5,
                    title: '히스토리',
                    defaultType: 'textfield',
                    height:'auto',
                    //defaults: {anchor: '100%'},
                    //layout: 'anchor',
                    items :[{
                        itemId:'hisUrl',
                        fieldLabel: 'URL',
                        width:'50%',
                        name: 'sysUrl',
                        inputType:'url',
                        value:'http://133.186.215.57/grafana/d/Jj_H_OIPDMH/iml3dmachine-history'
                    },{
                        xtype:'button',
                        text: '변경',
                        handler: function() {
                            let urls = me.down('#hisUrl').getValue();
                            Ext.Ajax.request({
                                url: '/comm/edit',
                                method:'POST',
                                params:{
                                    baseCd:'01',
                                    commCd:'00003',
                                    item1:urls
                                },
                                timeout: 10000,
                                success:function( response, request ){
                                    Ext.Msg.alert('대쉬보드 설정','히스토리 설정이 변경되었습니다.');
                                },
                                failure: function( result, request ){
                                    Ext.Msg.alert('대쉬보드 설정','오류가 발생하였습니다 다시시도해주세요.');
                                }
                            });
                        }
                    }]
                }]
            }]
        });

        me.callParent(arguments);
    }
});