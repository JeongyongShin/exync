Ext.define('app.model.AASXList', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'fields', type: 'auto', useNull:false},
        {name:'aasxNo', type: 'int', useNull:false,defaultValue:0, mapping:function(data){return data.pk}},
        {name:'aasxNm', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.aasxNm}},
        {name:'dispYn', type: 'int', useNull:false,defaultValue:0},
        {name:'imgUrl', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.imgUrl}},
        {name:'ver', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.version}},
        {name:'desc', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.desc}},
        {name:'data', type: 'string', useNull:true,defaultValue:null},
        {name:'createDte', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.createDte}}
    ]
});