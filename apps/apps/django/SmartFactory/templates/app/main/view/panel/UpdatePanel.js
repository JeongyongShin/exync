Ext.define('app.view.panel.UpdatePanel',{
    extend : 'app.view.frame.DefaultPanel',
    id: 'updatePanel',
    alias : 'widget.UpdatePanel',
    initComponent: function() {
        var me = this;

        Ext.apply(this, {
        	reloadData:function(){
            },
            dockedItems: [],
            items:[{
            	flex:1,
            	layout:{type: 'hbox',align: 'stretch'},
                border:false,
                items:[]
            }]
        });

        me.callParent(arguments);
    }
});