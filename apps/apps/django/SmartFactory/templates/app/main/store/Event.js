Ext.define('app.store.Event', {
    extend: 'Ext.data.Store',
    model: 'app.model.Event',
    proxy: {
        type: 'ajax',
        url: '/event/page',
        reader: {
            type: 'json',
            rootProperty: 'items',
            totalProperty: 'totalCount',
            messageProperty: 'code'
        },
        listeners: {
            exception: function(proxy, response, operation){
            }
        }
    }
});
