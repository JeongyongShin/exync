Ext.define('aasx.view.frame.TopPanel',{
	extend  : 'Ext.panel.Panel',
    alias   : 'widget.TopPanel',
    id		: 'topPanel',
	height	: 30,
    layout	: 'fit',
    initComponent: function() {
        var me = this;
        var tData = [];
    	
    	var task = {
		    run: function(){
		    	me.down('#topTime').update('<div class="ccb"><div class="ccl" style="color:white; font-weight:bold; font-size:13px;">'+Ext.Date.format(new Date(),'Y-m-d H:i:s')+'</div></div>'); 
		    },
		    interval: 1000 //1 second
    	};
    	
        
        Ext.apply(this, {
        	items:[{
        		layout:{type: 'hbox',align: 'stretch'},
                items:[{
                    width:200,
                    html:''
                },{
            		flex:1,
                    itemId:'topTime',
                    xtype: 'component',
                    style:{'text-align':'center'},
                    html:'',
                    listeners: {
                        render: function(panel) {
                            var runner = new Ext.util.TaskRunner();
                            runner.start(task);
                        }
                    }
                },{
                    width:200,
                    xtype: 'toolbar',
                    style: {'background':'transparent'},
                    padding:'0',
                    border:0,
                    items:['->',{
                        xtype: 'component',
                        style:{'color':'white','background-color':'transparent'},
                        html:'<div class="ccb"><div class="ccl" style="color:white; font-weight:bold; font-size:15px;">admin 님</div></div>'
                    }/*,{
                    	xtype: 'button',
                        style:  'background: transparent; color:white; margin-top:2px;',
                        border: 0,
                    	iconCls:'fas fa-cog',
                        handler : function() {
                            Ext.create('aasx.view.window.UserConfigWindow',{
                                listeners : {
                                    close: function(panel) {
                                    }
                                }
                            }).show();
                        }
                    }*/,{
                    	xtype: 'button',
                        style:  'background: transparent; color:white; margin-top:2px;',
                        border: 0, 
                    	iconCls:'fas fa-sign-out-alt',
                        handler : function() {
                        }
                    }]
                }]
        	}]
        });
        me.callParent(arguments);
    }
});
