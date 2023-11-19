Ext.define('app.view.frame.CenterPanel',{
	extend  : 'Ext.panel.Panel',
    alias   : 'widget.CenterPanel',
    id		: 'centerPanel',
	layout  : 'fit',
	//margin  : '5px 0 0 0',
	style	: {'background-color':'#0B0C0E'},
    initComponent: function() {
        var me = this;
        var tData = [];
        
        var runner = new Ext.util.TaskRunner();

        function startTaskRunner(time){
            var task = {
                	run: function(){
                		me.refreshFrameData();
                	},
            		interval: time*1000
            	};
            runner.start(task);
        }
        
        function stopTaskRunner(){
        	runner.stopAll(true);
        }
        
        Ext.apply(this, {
        	items:[{
        		width:'100%',
        		height:'100%',
            	layout:'absolute',
        		items:[{
        			x:0,
            		y:0,
            		anchor: '100% 100%',
                	xtype:'panel',
                	layout:{type: 'vbox',align: 'stretch'},
            		items:[{
                		flex:1,
            	    	itemId:'centerTab',
            	    	xtype:'tabpanel',
            	    	items:[{
            	    		itemId:'tab_0',
            	    		xtype:'MainPanel'
            	    	},{
            	    		itemId:'tab_1',
            	    		xtype:'TagPanel'
            	    	},{
            	    		itemId:'tab_2',
            	    		xtype:'ConfigPanel'
            	    	}],
                    	listeners : {
                    		render : function(ts) {
                    			ts.getTabBar().hide();
                    	    }
                    	}
            	    }]
            	}/*,{
        	    	xtype:'AlarmPanel',
        	    	renderTo: Ext.getBody(),
        	    	width:350,
        	        shadow:'frame',
        	        shadowOffset:50,
                	style:{'right':'0px', 'top':'0px', 'z-index':'9999!important'},
                	anchor: 'null 100%',
                	hidden:true,
        	    }*/]
        	}],
    	    refreshFrameData: function(){
    			me.down('#centerTab').getActiveTab().reloadData();
    			
    	    	/*var pView = Ext.ComponentQuery.query('DefaultPanel');
    	    	for(var i=0;i<pView.length;i++){
    	    		pView[i].reloadData();
    	    	}*/
        	},

        	selectTab: function(num){
        		for(var i=0; i<1;i++){
        			if(i==num)document.getElementById('maintab_'+i).setAttribute( 'selection', true );
        			else document.getElementById('maintab_'+i).setAttribute( 'selection', false );
        		}
				//centerpanel.setActiveTab(tab);
        		let centerTab = me.down('#centerTab');
        		let tab = centerTab.down('#tab_' + num);
        		centerTab.setActiveTab(tab);
    			tab.reloadData();
        	}
        });
        //Ext.getCmp('centerPanel').refreshFrameData();
        //createRefresh("Ext.getCmp('centerPanel').refreshFrameData()");
		startTaskRunner(1);

        me.callParent(arguments);
    }
});
