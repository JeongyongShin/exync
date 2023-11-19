Ext.define('app.view.panel.config.UserConfigPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.UserConfigPanel',
    style:{'background-color':'#252529'},
    initComponent: function() {
        var me = this;
        
        Ext.apply(this, {
        	reloadData:function(){
            },
            dockedItems: [],
            items:[{
            	flex:1,
            	layout:{type: 'vbox',align: 'stretch'},
                border:false,
                padding:'10 10 10 10',
                items:[{
                    xtype:'fieldset',
                    //columnWidth: 0.5,
                    title: '비밀번호 설정',
                    defaultType: 'textfield',
                    height:'auto',
                    //defaults: {anchor: '100%'},
                    //layout: 'anchor',
                    items :[{
                        itemId:'password',
                        fieldLabel: '현재 비밀번호',
                        name: 'password',
                        inputType: 'password'
                    }, {
                        itemId:'npassword',
                        fieldLabel: '비밀번호',
                        name: 'npassword',
                        inputType: 'password'
                    },{
                        itemId:'cpassword',
                        fieldLabel: '비밀번호 확인',
                        name: 'cpassword',
                        inputType: 'password'
                    },{
                        xtype:'button',
                        text: '변경',
                        handler: function() {
                            let p = me.down('#password').getValue().trim();
                            let np = me.down('#npassword').getValue().trim();
                            let cp = me.down('#cpassword').getValue().trim();
                            if(p.length == 0){
                                me.down('#password').focus();
                                Ext.Msg.alert('비밀번호 설정','현재 비밀번호를 입력하세요.');
                            }
                            else if(np.length == 0){
                                me.down('#npassword').focus();
                                Ext.Msg.alert('비밀번호 설정','비밀번호를 입력하세요.');
                            }
                            else if(cp.length == 0){
                                me.down('#cpassword').focus();
                                Ext.Msg.alert('비밀번호 설정','비밀번호 확인을 입력하세요.');
                            }
                            else if(np != cp) Ext.Msg.alert('비밀번호 설정','비밀번호 확인이 일치하지 않습니다.');
                            else {
                                Ext.Ajax.request({
                                    url: '/user/edit',
                                    method:'POST',
                                    params:{
                                        password:p,
                                        npassword:np
                                    },
                                    timeout: 10000,
                                    success:function( response, request ){
                                        Ext.Msg.alert('비밀번호 설정','변경되었습니다.');
                                        me.down('#password').setValue('');
                                        me.down('#npassword').setValue('');
                                        me.down('#cpassword').setValue('');
                                        console.log(response,request);
                                    },
                                    failure: function( result, request ){
                                        Ext.Msg.alert('비밀번호 설정','현재 비밀번호를 확인하세요.');
                                    }
                                });
                            }
                        }
                    }]
                },{
                    xtype:'fieldset',
                    //columnWidth: 0.5,
                    title: 'API KEY 설정',
                    defaultType: 'textfield',
                    height:'auto',
                    //defaults: {anchor: '100%'},
                    //layout: 'anchor',
                    items :[{
			itemId: 'userconfig_apikey',
                        fieldLabel: 'API KEY',
                        name: 'field1',
                        width:'50%',
                        value:ak
                    },{
                        xtype:'button',
                        text: '변경',
                        handler: function() {
                            if (confirm("변경시 이전 API Key는 사용할 수 없습니다. 변경하시겠습니까?")){
                                Ext.Ajax.request({
                                    url: '/user/edit/api',
                                    method:'POST',
                                    timeout: 10000,
                                    success:function( response, request ){
                                        Ext.Msg.alert('API KEY 설정','변경되었습니다.');
					let res = JSON.parse(response.responseText)
                                        me.down('#userconfig_apikey').setValue(res.message);
                                    },
                                    failure: function( result, request ){
                                        Ext.Msg.alert('API KEY 설정','오류가 발생하였습니다. 잠시후 다시 시도해주세요.');
                                    }
                                });
                            }
                        }
                    }]
                }]
            }]
        });

        me.callParent(arguments);
    }
});
