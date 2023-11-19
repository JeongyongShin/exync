Ext.define('app.store.AlarmLogList', {
    extend: 'Ext.data.Store',
    model: 'app.model.AlarmLogList',
    proxy: {
        type: 'ajax',
        url: '/alarm/log/list',
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        startParam: undefined,
        reader: {
            type: 'json',
            messageProperty: 'code',
            rootProperty: 'items',
            totalProperty: 'totalCount',
        },
        listeners: {
            exception: function(proxy, response, operation){
            }
        }
    }
});

