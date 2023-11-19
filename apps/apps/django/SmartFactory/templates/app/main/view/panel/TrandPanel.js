Ext.define('app.view.panel.TrandPanel',{
    extend : 'Ext.panel.Panel',
    alias : 'widget.TrandPanel',
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
                                //$('#boardFrame').contents().find('.navbar-page-btn').remove();
                                $('#boardFrame').contents().find('.navbar-buttons.navbar-buttons--actions').remove();
                                let pList = $('#boardFrame').contents().find('.navbar-buttons--playlist');
                                if(pList.length == 0){
                                        let tvBtn = $('#boardFrame').contents().find('.gf-form-label');
                                        if(tvBtn.length == 0){
                                                $('#boardFrame').contents().find('.navbar-button--tv').before('<a class="gf-form-label" href="'+dUrl+'" target="_self"><div class="css-1cvxpvr"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="css-sr6nr" style="margin-right: 4px;"><path d="M18,10.82a1,1,0,0,0-1,1V19a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V8A1,1,0,0,1,5,7h7.18a1,1,0,0,0,0-2H5A3,3,0,0,0,2,8V19a3,3,0,0,0,3,3H16a3,3,0,0,0,3-3V11.82A1,1,0,0,0,18,10.82Zm3.92-8.2a1,1,0,0,0-.54-.54A1,1,0,0,0,21,2H15a1,1,0,0,0,0,2h3.59L8.29,14.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L20,5.41V9a1,1,0,0,0,2,0V3A1,1,0,0,0,21.92,2.62Z"></path></svg></div><span>Start Play List</span></a>');
                                        }
                                }

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
