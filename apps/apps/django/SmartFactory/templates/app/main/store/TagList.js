Ext.define('app.store.TagList', {
    extend: 'Ext.data.Store',
    model: 'app.model.TagList',
    proxy: {
        type: 'ajax',
        url: '/tag/list',
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

