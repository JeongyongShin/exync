Ext.define('app.view.roweditor.EventRowEditing', {
    extend: 'Ext.grid.plugin.RowEditing',
    alias: 'plugin.rowEditing',
    clicksToMoveEditor: 2,
    initEditor: function () {
        var me = this,
            grid = me.grid,
            view = me.view,
            headerCt = grid.headerCt,
            btns = ['saveBtnText', 'cancelBtnText', 'errorsText', 'dirtyText'],
            b,
            bLen = btns.length,
            edcfg = {
                autoCancel: me.autoCancel,
                errorSummary: me.errorSummary,
                fields: headerCt.getGridColumns(),
                hidden: true,
                view: view,
                // keep a reference...
                editingPlugin: me,
            },
            item;

        //Turn button text into items
        for (b = 0; b < bLen; b++) {
            item = btns[b];

            if (Ext.isDefined(me[item])) { //sometimes errorsText or dirtyText are not defined
                edcfg[item] = me[item];
            }
        }
        return Ext.create('app.view.roweditor.EventRowEditor', edcfg); ////This is really the only line you have to change
    },
    listeners: {
        //override your listeners here...
    }
});