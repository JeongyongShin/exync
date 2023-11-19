Ext.define('app.view.viewport.aasx', {
    extend: 'Ext.container.Viewport',
	layout:'border',
    autoScroll: true,
    style:  'background-color:#0B0C0E',
	minWidth: 1600,
	minHeight: 900,
    items: [{
            width:400,
            minWidth:400,
            maxWidth:700,

            region: 'west',
            layout:'fit',
            xtype: 'MainTreePanel',
            style:  'background: #212124',
            collapsible: true,
            header:false,
            collapseMode:'mini',
            split: true
        },{
            //minWidth:700,
            region: 'center',
            xtype : 'CenterPanel'
        },{
            region: 'north',
            xtype : 'TopPanel'
        }]
});