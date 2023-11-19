Ext.define('app.model.Comm', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'fields', type: 'auto', useNull:false},
        {name:'commCd', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.commCd}},
        {name:'commNm', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.commNm}},
        {name:'item1', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.item1}},
        {name:'item2', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.item2}},
        {name:'item3', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.item3}}
    ]
});