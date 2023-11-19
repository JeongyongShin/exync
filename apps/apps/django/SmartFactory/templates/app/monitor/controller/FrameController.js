Ext.define('aasx.controller.FrameController', {
    extend: 'Ext.app.Controller',
    stores: [],	
    views: ['aasx.view.Viewport',
            'aasx.view.panel.TrandPanel',
            'aasx.view.frame.TopPanel'],
	init: function() {
	},
	onSubListSelect: function(dataview, record) {

    },
	onLaunch: function() {
	}
});