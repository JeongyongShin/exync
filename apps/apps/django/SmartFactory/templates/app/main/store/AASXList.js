Ext.define('app.store.AASXList', {
    extend: 'Ext.data.Store',
    model: 'app.model.AASXList',
    proxy: {
        type: 'ajax',
        url: '/aasx/list',
        noCache: false,
        limitParam: undefined,
        pageParam: 'page',
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

