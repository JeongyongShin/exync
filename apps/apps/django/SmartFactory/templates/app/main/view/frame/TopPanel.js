Ext.define('app.view.frame.TopPanel',{
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
            setTopTitle:function(t){
                me.down('#topTitle').update('<div class="ccb"><div class="ccl" style="padding-left:10px; font-size:15px; font-weight:bold;">'+t+'</div></div>');
                                var menuTag = '<div class="custom-select" style="width:200px;"><select id="top_menu">';
            },
        	items:[{
        		layout:{type: 'hbox',align: 'stretch',overflow:'visible'},
                items:[{
                    width:5,
                    html:''
                },{
                    id:'topMenu',
                    xtype:'combobox',
                    width:0,
                    cls: 'textTransparent',
                    editable: false,
                    emptyText:'MENU',
                    store: topMenu,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'abbr',
                    hideTrigger:true,
                    overflow:'hidden',
                    cls: 'TOPPANEL_TOPMENU',
                    listConfig: {
                        maxHeight: 1000
                    },
                    tpl: '<tpl for=".">'+
                        '<div class="x-boundlist-item">' +
                        '<div style="height:50px;">'+
                        '<img src="{img}" width=30 style="position:absolute; top:8px"/> ' +
                        cs('{name}', 'style', 'padding-left:40px;') +
                        '</div>'+
                        '</div>'  +
                        '</tpl>',
                    listeners: {
                        render: function(combo) {
                        },
                        change: function ( ts, newValue, oldValue, eOpts ){
                            if(newValue == 'ax')location.href = '/';
                            else if(newValue == 'ct')location.href = '/server';
                            else if(newValue == 'mt')location.href = '/monitor';
                            else if(newValue == 'ht')location.href = '/history';
                            else if(newValue == 'uc')location.href = '/admin/';
                        },
                        expand:function(combo){
//                            document.getElementById("topMenu-picker").style.width = '200px';
//                            document.getElementById("topMenu-picker").style.backgroundColor = '#212124';
//                            document.getElementById("topMenu-picker").style.color = '#d0d0d0';
//                            document.getElementById("topMenu-picker").style.fontWeight = 'bold';
                            combo.picker.width = 200;
                        }
                    }
                },{
                    xtype:'button',
                    width:20,
                    baseCls:'icon_mainmenu',
                    //html:'<img src="/resources/images/icons/icon_menu.png" width=20 style="position:absolute; top:5px"/>',
                    handler : function() {
                            let topMenu = Ext.getCmp('topMenu');
                            if(!topMenu.isExpanded) topMenu.expand();
                    }
                },{
                    itemId:'topTitle',
                    width:250,
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
                    items:[{
                        itemId:'topTime',
                        xtype: 'component',
                        html:'',
                        listeners: {
                            render: function(panel) {
                                var runner = new Ext.util.TaskRunner();
                                runner.start(task);
                            }
                        }
                    },'->',{
                        xtype: 'component',
                        style:{'color':'white','background-color':'transparent'},
                        html:'<div class="ccb"><div class="ccl" style="color:white; font-weight:bold; font-size:15px;">'+uName+' 님</div></div>'
                    },{
                    	xtype: 'button',
                        style:  'background: transparent; color:white; margin-top:2px;',
                        border: 0,
                    	iconCls:'fas fa-cog',
                        handler : function() {
                            Ext.create('app.view.window.UserConfigWindow',{
                                listeners : {
                                    close: function(panel) {
                                    }
                                }
                            }).show();
                        }
                    },{
                    	xtype: 'button',
                        style:  'background: transparent; color:white; margin-top:2px;',
                        border: 0, 
                    	iconCls:'fas fa-sign-out-alt',
                        handler : function() {
						    location.href = '/logout';
                        }
                    }]
                }]
        	}]
        });
        me.callParent(arguments);
    }
});
