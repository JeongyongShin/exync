Ext.define('app.model.TagList', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'fields', type: 'auto', useNull:false},
        {name:'tagId', type: 'string', useNull:false,mapping:function(data){return data.pk}},
        {name:'tagName', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.tagName}},
        {name:'tagDesc', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.tagDesc}},
        {name:'value', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.value}},
        {name:'updateDte', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.updateDte}}
    ]
});