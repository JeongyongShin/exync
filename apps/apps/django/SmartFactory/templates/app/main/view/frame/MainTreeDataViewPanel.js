Ext.define('app.view.frame.MainTreeDataViewPanel',{
    extend: 'Ext.panel.Panel',
    alias: 'widget.MainTreeDataViewPanel',
    width:'100%',
    height:'auto',
	layout:{type: 'vbox',align: 'stretch',pack:'center'},
	style:{
		'background-color':'transparent',
		'border':'0'
	},
	listeners: {
		render: function(panel) {
		}
	},
	
    initComponent: function() {
        var me = this;

        if(me.deps == -1){
            let check = '<div class="ccb"><div class="ccl"><i class="fas fa-check-square" style="font-size:25px; color:white;"></i></div></div>';
            let uncheck = '<div class="ccb"><div class="ccl"><i class="far fa-square" style="font-size:25px; color:white;"></i></div></div>';
        	
            Ext.apply(this, {
                items: [{
        			xtype:'panel',
                	layout:{type: 'hbox',align: 'stretch'},
                    height:50,
            		style:{'border-bottom':'1px solid #444','cursor':'pointer'},
            		items:[{
            			xtype:'panel',
            			itemId:'mainTreeDataViewCheck',
        				width:50,
                		style:{'text-align':'center',},
                		hidden:true,
            			html:me.aasx.dispYn==1?check:uncheck
            		},{
            			flex:1,
            			xtype:'panel',
                		style:{'padding-left':'10px'},
                		html:'<div class="ccb"><div class="ccl" style="color:#d2d2d2; font-size:20px; font-weight:bold;">'+me.aasx.aasxNm+'</div></div>',
                	}]/*,
                	listeners : {
                		render: function(panel) {
                			panel.body.on('click', function(ts) {
                	        	if(me.aasx.dispYn == 0) me.aasx.dispYn = 1;
                	        	else me.aasx.dispYn = 0;
                    			me.updateCheck(me.aasx.dispYn);
                			});
                		}
                	}*/
                }],
                updateCheck : function(checkYn){
    	        	if(checkYn == 0)me.down('#mainTreeDataViewCheck').update(uncheck);
    	        	else me.down('#mainTreeDataViewCheck').update(check);
    	        },
    	        setItemSelected: function(is){
    	            if(is){
    	                me.setStyle('background-color','#4370B3');
    	            }else{
    	                me.setStyle('background-color','transparent');
    	            }

    	        }
            });
        }
        
  
        this.callParent(arguments);

    }
});