Ext.define('app.model.AASX', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'contentType', type: 'auto', useNull:true},
        {name:'thumbnail', type: 'string', useNull:true},
        {name:'origin', type: 'string', useNull:true},
        {name:'aasSpec', type: 'string', useNull:true},
        {name:'fileList', type: 'auto', useNull:true}
    ]
});