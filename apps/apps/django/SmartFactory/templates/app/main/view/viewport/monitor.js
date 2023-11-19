Ext.define('app.view.viewport.monitor', {
    extend: 'Ext.container.Viewport',
	layout:'border',
    autoScroll: true,
    style:  'background-color:#0B0C0E',
	minWidth: 1600,
	minHeight: 900,
    items: [{
            //minWidth:700,
            region: 'center',
            xtype : 'TrandPanel'
        },{
            region: 'north',
            xtype : 'TopPanel'
        }]
});