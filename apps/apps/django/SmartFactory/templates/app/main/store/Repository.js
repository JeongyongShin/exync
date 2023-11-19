Ext.define('app.store.Repository', {
    extend: 'Ext.data.Store',
    model: 'app.model.Repository',
    proxy: {
        type: 'ajax',
        url: '/api/aas/packages',
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        startParam: undefined,
        reader: {
            type: 'json',
            rootProperty: 'items',
            messageProperty: 'code'
        },
        listeners: {
            exception: function(proxy, response, operation){
            }
        }
    }
});

