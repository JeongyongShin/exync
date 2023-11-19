Ext.define('aasx.view.Viewport', {
    extend: 'Ext.container.Viewport',
	layout:'border',
    autoScroll: true,
    style:  'background-color:#0B0C0E',
	minWidth: 1600,
    items: [{
            region: 'center',
            xtype : 'TrandPanel'
        },{
            region: 'north',
            xtype : 'TopPanel'
        }]
});