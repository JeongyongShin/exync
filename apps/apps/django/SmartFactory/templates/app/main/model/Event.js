Ext.define('app.model.Event', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'eNo', type: 'int', useNull:true,defaultValue:null},
        {name:'time', type: 'string', useNull:true,defaultValue:null},
        {name:'busId', type: 'string', useNull:true,defaultValue:null},
        {name:'busNo', type: 'string', useNull:true,defaultValue:null},
        {name:'regNo', type: 'string', useNull:true,defaultValue:null},
        {name:'data', type: 'string', useNull:true,defaultValue:null},
        {name:'point', type: 'string', useNull:true,defaultValue:null},
        {name:'type', type: 'string', useNull:true,defaultValue:null},
        {name:'desc', type: 'string', useNull:true,defaultValue:null}
    ]
});

