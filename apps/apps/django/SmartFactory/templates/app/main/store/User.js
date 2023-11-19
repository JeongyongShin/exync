Ext.define('app.store.User', {
    extend: 'Ext.data.Store',
    model: 'app.model.User',
    proxy: {
        type: 'ajax',
        url: '/user',
        reader: {
            type: 'json',
            rootProperty: 'items',
            totalProperty: 'totalCount',
            messageProperty: 'message'
        },
        listeners: {
            exception: function(proxy, response, operation){
            }
        }
    }
});
