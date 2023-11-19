Ext.define('aasx.view.panel.TrandPanel',{
    extend : 'Ext.panel.Panel',
    alias : 'widget.TrandPanel',
    layout:'center',
    id:'trandPanel',
    initComponent: function() {
        var me = this;
        var runner = new Ext.util.TaskRunner();

        function startTaskRunner(time){
                var task = {
                        run: function(){
                            me.reloadData();
                        },
                        interval: time*1000
                };
                runner.start(task);
        }

        Ext.apply(this, {
                reloadData:function(){
                        try {
                                $('#boardFrame').contents().find('.sidemenu').remove();
                                $('#boardFrame').contents().find('.navbar-page-btn').remove();

                                } catch (e) {
                                        // TODO: handle exception
                                }
            },
            items:[{
                xtype: 'panel',
                layout:'center',
                //width:1000,
                //height:800,
                anchor:'50% 50%',
                style:  'background-color: white',

                items:[]

                //html:'<iframe id="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="http://49.50.173.128/grafana/d/xLGmU0iGk/smartfactory?orgId=1&refresh=500ms" scrolling="no"></iframe>'
                }],*/
                onclickToggleBtn : function(tag){
            }
        });

        startTaskRunner(1);


        me.callParent(arguments);
    }
});