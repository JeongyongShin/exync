Ext.define('app.controller.AlarmController', {
    extend: 'Ext.app.Controller',
    stores: [],	
    views: ['app.view.viewport.alarm',
            'app.view.frame.DefaultPanel',
            'app.view.frame.TopPanel',
            'app.view.panel.MainPanel',
    		'app.view.panel.ConfigPanel',
    		'app.view.panel.AlarmPanel',
    		'app.view.panel.config.AASXConfigPanel',
    		'app.view.panel.config.UserConfigPanel',
    		'app.view.panel.config.DashboardConfigPanel'],
	init: function() {
        Ext.Ajax.disableCaching = false;
        Ext.Ajax.setDefaultHeaders({
     			'Accept':'application/json,application/xml',
     			'X-CSRFToken':getCookie('csrftoken')
        });

        Ext.Ajax.on('beforerequest', (function(klass, request) {
        }), this);
	},
	onSubListSelect: function(dataview, record) {

    },
	onLaunch: function() {
	}
});