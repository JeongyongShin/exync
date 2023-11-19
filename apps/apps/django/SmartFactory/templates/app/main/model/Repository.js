Ext.define('app.model.Repository', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'aasIds', type: 'auto', useNull:true},
        {name:'packageId', type: 'string', useNull:true}
    ]
});