Ext.define('app.model.Bus', {
    extend: 'Ext.data.Model',   // extend
    fields: [
        {name:'busId', type: 'string', useNull:true,defaultValue:null},
        {name:'busNo', type: 'string', useNull:true,defaultValue:null},
        {name:'regNo', type: 'string', useNull:true,defaultValue:null},
        {name:'busState', type: 'string', useNull:true,defaultValue:null},
        {name:'btrPct', type: 'string', useNull:true,defaultValue:null},
        {name:'btrState', type: 'string', useNull:true,defaultValue:null},
        {name:'compId', type: 'string', useNull:true,defaultValue:null},
        {name:'fvYn', type: 'string', useNull:false,defaultValue:'0'}
    ]
});