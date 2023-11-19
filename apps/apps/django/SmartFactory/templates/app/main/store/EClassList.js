Ext.define('app.store.EClassList', {
    extend: 'Ext.data.Store',
    model: 'app.model.EClassList',
    proxy: {
        type: 'ajax',
        url: '/aasx/eclass/list',
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

