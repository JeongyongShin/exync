Ext.define('app.store.Point', {
    extend: 'Ext.data.Store',
    model: 'app.model.Point',
    proxy: {
        type: 'ajax',
        url: '/point/list',
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

