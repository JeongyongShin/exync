Ext.define('app.controller.CloudMonitorController', {
    extend: 'Ext.app.Controller',
    stores: [],	
    views: ['app.view.viewport.cloudmonitor',
    		'app.view.frame.MainTreePanel',
    		'app.view.frame.MainTreeDataViewPanel',
            'app.view.frame.DefaultPanel',
            'app.view.frame.TopPanel',
            'app.view.frame.CenterPanel',
    		/*'app.view.frame.AlarmPanel',*/
    		'app.view.panel.CloudMonitorPanel',
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