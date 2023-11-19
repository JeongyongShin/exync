Ext.define('app.view.window.UserConfigWindow', {
    alias : 'widget.UserConfigWindow',
    extend: 'Ext.window.Window',   // extend
    style:  'background-color:#0B0C0E',
    title: '설정',
    modal: true,
    shadow:false,
    width: '80%',
    height:'80%',
    layout: 'fit',
    initComponent: function() {
        var me = this;

        Ext.apply(this, {
            selectTab: function(comp){
                let tabs = me.down('#userConfigWindowTab').items;
                for(var i=0; i<tabs.items.length; i++){
                    tabs.items[i].setStyle({'padding-left':'5px', 'background-color':'transparent','border-bottom':'1px solid #303030'});
                    if(tabs.items[i] == comp){
                        let tab = me.down('#tab_'+(i+1));
                        me.down('#userConfigTab').setActiveTab(tab);
                    }
                }
                //console.log(tabs.items);
                comp.setStyle({'padding-left':'10px', 'background-color':'#252529', 'font-weight':'bold'});
        	},
            dockedItems:[],
            items: [{
        		layout:{type: 'vbox',align: 'stretch'},
            	xtype:'panel',
                width:'100%',
                style:  'background: transparent',
            	autoScroll:true,
            	items:[{
            	    xtype:'panel',
                    layout:{type: 'hbox',align: 'stretch'},
            	    itemId:'userConfigWindowTab',
                    height:50,
                    style:{'cursor':'pointer'},
                    defaults:{
                        width:150,
                        listeners:{
                            render: function(c){
                                c.getEl().on({
                                    click: function() {
                                        me.selectTab(this.component);
                                    }
                                });
                            }
                        }
                    },
                    items:configTab
                },{
                    flex:1,
                    xtype:'tabpanel',
                    itemId:'userConfigTab',
                    layout:'fit',
                    items:configMenu,
                    listeners : {
                        render : function(ts) {
                            ts.getTabBar().hide();
                        }
                    }
                }],
            	listeners : {
            		render: function(panel) {
            			me.reloadData();
            		}
            	}
        	}],
        	reloadData: function(){
        	    me.selectTab(me.down('#userConfigWindowTab_1'));

            }
        });
        me.callParent(arguments);

    }
});