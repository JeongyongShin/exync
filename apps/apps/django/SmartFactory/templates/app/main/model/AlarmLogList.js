Ext.define('app.model.AlarmLogList', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'fields', type: 'auto', useNull:false},
        {name:'no', type: 'int', useNull:false,mapping:function(data){return data.pk}},
        {name:'createDte', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.createDte}},
        {name:'alarmDte', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.alarmDte}},
        {name:'userId', type: 'string', useNull:false,defaultValue:null, mapping:function(data){return data.fields.userId}},
        {name:'phoneNo', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.phoneNo}},
        {name:'location', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.location}},
        {name:'tagId', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.tagId}},
        {name:'code', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.code}},
        {name:'imp', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.imp}},
        {name:'desc', type: 'string', useNull:true,defaultValue:null, mapping:function(data){return data.fields.desc}}
    ]
});