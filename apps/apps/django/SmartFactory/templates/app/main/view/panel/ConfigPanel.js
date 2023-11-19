Ext.define('app.view.panel.ConfigPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.ConfigPanel',
	padding:'0 50',
    initComponent: function() {
        var me = this;
        
        Ext.apply(this, {
        	reloadData:function(){
            },
            dockedItems: [],
            items:[]
        });

        me.callParent(arguments);
    }
});