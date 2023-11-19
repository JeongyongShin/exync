Ext.define('app.model.Company', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'compId', type: 'string', useNull:true,defaultValue:null},
        {name:'compNm', type: 'string', useNull:true,defaultValue:null},
        {name:'regNo', type: 'string', useNull:true,defaultValue:null},
        {name:'dispNm', type: 'string', useNull:true,defaultValue:null},
        {name:'addr', type: 'string', useNull:true,defaultValue:null},
        {name:'telNo1', type: 'string', useNull:true,defaultValue:null},
        {name:'telNo2', type: 'string', useNull:true,defaultValue:null},
        {name:'dispYn', type: 'string', useNull:true,defaultValue:null}
    ]
});