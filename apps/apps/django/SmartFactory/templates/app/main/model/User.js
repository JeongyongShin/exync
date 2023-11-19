Ext.define('app.model.User', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'userId', type: 'string', useNull:true,defaultValue:null},
        {name:'userNm', type: 'string', useNull:true,defaultValue:null},
        {name:'pwd', type: 'string', useNull:true,defaultValue:null},
        {name:'auth', type: 'string', useNull:true,defaultValue:null, vtype:'email'},
        {name:'email', type: 'string', useNull:true,defaultValue:null}
    ]
});