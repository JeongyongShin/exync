Ext.define('app.view.viewport.alarm', {
    extend: 'Ext.container.Viewport',
	layout:'border',
    autoScroll: true,
    style:  'background-color:#0B0C0E',
	minWidth: 1600,
	minHeight: 900,
    items: [{
            region: 'center',
            xtype : 'AlarmPanel'
        },{
            region: 'north',
            xtype : 'TopPanel'
        }]
});