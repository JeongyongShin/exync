Ext.define('app.model.EClassList', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'fields', type: 'auto', useNull:false},
        {name:'irid', type: 'string', useNull:false,defaultValue:0, mapping:function(data){return data.pk}},
        {name:'type', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.type}},
        {name:'pName', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.pName}},
        {name:'deft', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.deft}},
        {name:'dType', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.dType}},
        {name:'unit', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.unit}},
        {name:'resol', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.resol}}
    ]
});