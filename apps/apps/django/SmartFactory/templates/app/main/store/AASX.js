Ext.define('app.store.AASX', {
    extend: 'Ext.data.Store',
    model: 'app.model.AASX',
    proxy: {
        type: 'ajax',
        url: '/aasx',
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        startParam: undefined,
        reader: {
            type: 'json',
            messageProperty: 'code'
        },
        listeners: {
            exception: function(proxy, response, operation){
            }
        }
    }
});

