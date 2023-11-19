Ext.define('aasx.view.frame.DefaultPanel',{
    extend : 'Ext.panel.Panel',
    alias : 'widget.DefaultPanel',
    style:  'background-color: transparent',
    layout:'fit',
    border:false,
    tools: [{
        type: 'refresh',
        listeners: {
            click: function(){
            	this.up('DefaultPanel').reloadData();
            }
        }
    },{
        type: 'restore',
        listeners: {
            click: function(){
            	//Ext.getCmp('centerPanel').setFrameMode(1,this.up('DefaultPanel').sTab);
            },
            afterrender:function(ts,eOpts){
            }
        }
    },{
        type: 'maximize',
        hidden:true,
        listeners: {
            click: function(){
            	//Ext.getCmp('centerPanel').setFrameMode(0,this.up('DefaultPanel').sTab);
            },
            afterrender:function(ts,eOpts){
            }
        }
    }],
    listeners:{
    },
    reloadData:function(){
    	//default
    },
	setRefresh:function(isRefresh, interval){
		if(this.task == null){
	    	var runner = new Ext.util.TaskRunner();
	    	this.task = runner.newTask({
	    	    run: this.reloadData(),
	    	    interval: interval
	    	});
		}
		if(isRefresh){
			this.task.start();
		}else{
			this.task.stop();
		}
    },
});