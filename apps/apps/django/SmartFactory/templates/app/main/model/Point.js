Ext.define('app.model.Point', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'pId', type: 'string', useNull:true,defaultValue:null},
        {name:'xId', type: 'string', useNull:true,defaultValue:null},
        {name:'canType', type: 'string', useNull:true,defaultValue:null},
        {name:'len', type: 'string', useNull:true,defaultValue:null},
        {name:'pNm', type: 'string', useNull:true,defaultValue:null},
        {name:'cNm', type: 'string', useNull:true,defaultValue:null},
        {name:'desc', type: 'string', useNull:true,defaultValue:null},
        {name:'dataType', type: 'string', useNull:true,defaultValue:null},
        {name:'sign', type: 'string', useNull:true,defaultValue:null},
        {name:'min', type: 'string', useNull:true,defaultValue:null},
        {name:'max', type: 'string', useNull:true,defaultValue:null},
        {name:'resol', type: 'string', useNull:true,defaultValue:null},
        {name:'offset', type: 'string', useNull:true,defaultValue:null},
        {name:'unit', type: 'string', useNull:true,defaultValue:null},
        {name:'busId', type: 'string', useNull:true,defaultValue:null},
        {name:'value', type: 'string', useNull:true,defaultValue:null},
        {name:'updateDte', type: 'string', useNull:true,defaultValue:null},
        {name:'bType',
            calculate: function (data) {
            	return data.pId.substring(data.pId.length-2,data.pId.length);
            }
        }
    ]
});