Ext.define('app.store.Bus', {
    extend: 'Ext.data.Store',
    model: 'app.model.Bus',
    proxy: {
        type: 'ajax',
        url: '/bus/list',
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

