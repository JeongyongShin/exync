Ext.define('app.store.Company', {
    extend: 'Ext.data.Store',
    model: 'app.model.Company',
    proxy: {
        type: 'ajax',
        url: '/comp/list',
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
