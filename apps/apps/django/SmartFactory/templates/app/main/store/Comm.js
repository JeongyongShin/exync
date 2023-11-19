Ext.define('app.store.Comm', {
    extend: 'Ext.data.Store',
    model: 'app.model.Comm',
    proxy: {
        type: 'ajax',
        url: '/comm/list',
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