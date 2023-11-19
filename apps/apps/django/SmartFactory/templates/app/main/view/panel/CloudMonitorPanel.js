Ext.define('app.view.panel.CloudMonitorPanel',{
    extend : 'Ext.panel.Panel',
    alias : 'widget.CloudMonitorPanel',
    layout:'fit',
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
                                $('#boardFrame').contents().find('.navbar-buttons--actions').remove();
                                $('#boardFrame').contents().find('.navbar').css('position','absolute')
                                    .css('left','70%')
                                    .css('right','0px');
                                $('#boardFrame').contents().find('.navbar-page-btn').remove();

                                } catch (e) {
                                        console.log(e);
                                        // TODO: handle exception
                                }
            },
            items:[{
                xtype: 'panel',
                layout:'fit',
                //width:1000,
                //height:800,
                html:'<iframe id="boardFrame" name="boardFrame" style="width:100%; height:100%;" frameborder="0" src="'+dUrl+'" scrolling="no"></iframe>'
                }],
                onclickToggleBtn : function(tag){
            }
        });

        startTaskRunner(1);


        me.callParent(arguments);
    }
});