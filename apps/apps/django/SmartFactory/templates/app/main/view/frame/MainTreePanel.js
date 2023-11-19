Ext.define('app.view.frame.MainTreePanel',{
	extend  : 'Ext.panel.Panel',
    alias   : 'widget.MainTreePanel',
    id:'MainTreePanel',
    style:  'background: transparent',
    //compList:[],
    //busList:[],
	//margin  : '5px 0 0 0',
    isFirst:true,
    isEdit:false,
    selectionTree:0,
    selectionAASX:null,
    initComponent: function() {
        var me = this;
        var time = 0;

        var menu1 = new Ext.menu.Menu({
            items: [{
                text: 'Open in new tab'

            }]
        });

        var aasxStore = Ext.create('app.store.AASX',{
            listeners: {
                beforeload:function(store, operation, eOpts){
    				operation.setParams({
    						aasxNm:me.selectionAASX.aasxNm
    				});
    			},
    			load:function(ts,records, successful, eOpts){
    			    me.selectionAASX.data = records[0].data;
    			    me.getAASXTree(me.selectionAASX);
    			}
    		}
        });

        var aasxListStore = Ext.create('app.store.AASXList',{
            listeners: {
    			load :function( ts , records , successful , operation , eOpts ){
                    if(me.isFirst && records.length > 0){
                        me.isFirst = false;
                        me.selectionAASX = records[me.selectionTree].data;
                        aasxStore.load();
                    }
        		}
    		}
        });

        var aasStore = Ext.create('Ext.data.TreeStore', {
            root: {
                text: '',
                id: 'ROOT_PACKAGE',
                iconCls:'icon_package',
                expanded: true,
                children: []
            }
        });

    	var editStore = Ext.create('Ext.data.TreeStore', {
            root: {
                text: 'Package',
                id: 'ROOT_PACKAGE',
                iconCls:'icon_package',
                expanded: true,
                children: []
            }
        });



        Ext.apply(this, {
        	listeners : {
        	    render: function(panel) {
        	        aasxListStore.load();
        		}
        	},
        	getAASX: function(data){
        	    me.selectionAASX = data;
                aasxStore.load();
        	},
        	getAASXTree: function(data){
        	    me.selectionTree = aasxStore.indexOf(data);
        	    Ext.Ajax.request({
                    url: '/aasx/tree?aasxNm='+data.aasxNm+'&aasSpec='+data.data.aasSpec,
                    method:'GET',
                    //headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                    success:function( response, request ){
                        aasx.aasxNm = data.aasxNm;
                        aasx.parseAASXtoXml(response.responseText);
                        aasx.setFileList(me.selectionAASX.data.fileList);
                        //console.log(aasx.root);
                        //var obj = Ext.decode(response.responseText);
                        aasx.setExtjsTree(me.down('#mainTreePanel'),me.down('#mainEditTreePanel'));
                        me.setObject(aasx.getTitle(), aasx.getSubTitle(), data.data.thumbnail!=null&&data.data.thumbnail.length!=0?'aasxNm='+data.aasxNm+'&path='+data.data.thumbnail:null);
                    },
                    failure: function( result, request ){
                    }
                });
        	},
        	setObject:function(t, st, img){
        	    var i='';
                i+='<div id="pnp_device_box_epson1" class="pnp_device_box"><div class="pnp_device_box_tag"><div class="pnp_device_box_title">';
                i+=cs(t);
                i+='</div><div class="pnp_device_box_subtitle">';
                i+='<div style="position:absolute; left:30px; right:30px; height:40px; ">'+cs('Submodel','style','padding-left: 20px; border:3px solid #3F6DB2; background-color:#CAD8EA; color:black;')+'</div>';
                i+='<div style="position:absolute; top:50px; left:50px; right:30px; height:40px; ">'+cs('Submodel element','style','padding-left: 20px; background-color:white; color:black;')+'</div>';
                i+='<div style="position:absolute; top:100px; left:50px; right:30px; height:40px; ">'+cs('Submodel element','style','padding-left: 20px; background-color:white; color:black;')+'</div>';
                i+='</div><div class="pnp_device_box_subcontent">';
                i+='</div><div class="pnp_device_box_content"><div id="pnp_device_box_epson1_content" class="pnp_device_box_textbox">';
                i+='<div>'+st+'</div>';
                if(img!=null&&img.length!=0)i+='<img onload="this.height = (180 - this.offsetTop)" src="/aasx/thumbnail?'+img+'">';
                i+='</div></div></div></div>';
        	    me.down('#mainObjectTreePanel').update(i);
        	},
        	test:function(form){
        	    console.log(form);

        	    var formData = new FormData(form);

        	    $.ajax({
        	        url : '/aasx/upload',
                    //params : this.base_params || this.baseParams || this.params,
                    type : 'POST',
                    data : formData,
                    processData: false,
                    contentType: false,
                    timeout: 10000,
                    success:function( response, request ){
                        console.log(response);
                    },
                    error: function( result, request ){
                    }
        	    });

                /*Ext.Ajax.request({
                    url : '/aasx/upload',
                    //params : this.base_params || this.baseParams || this.params,
                    method : 'POST',
                    form : form,
                    isUpload : true,
                    timeout: 10000,
                    success:function( response, request ){
                        console.log(response);
                    },
                    failure: function( result, request ){
                    }
                });*/
        	},
            selectImageMapLink:function(linkMap){
        	    let link = aasx.getAASLink(linkMap);
        	    let links = link.split('/');

        	    if(link != null){
        	        let treeView = me.down('#mainTreePanel');
        	        treeView.selectPath(link, 'id', '/',function (s, n) {
                        var nodeEl = Ext.get(treeView.view.getNode(n));
                        nodeEl.scrollIntoView(treeView.view.el, false, true);
                        //treeView.getSelectionModel().select(treeView.getStore().getNodeById(links[links.length-1]));
                    });
                }
            },
        	filterStore:function(value){
                var searchString = value.toLowerCase(),
                filterFn = function(node) {
                    var children = node.childNodes,
                        len = children && children.length,
                        visible = v.test(node.get('text')),
                        i;
                    if (!visible) {
                        for (i = 0; i < len; i++) {
                            if (children[i].isLeaf()) {
                                visible = children[i].get('visible');
                            } else {
                                visible = filterFn(children[i]);
                            }
                            if (visible) {
                                break;
                            }
                        }

                    } else {
                        for (i = 0; i < len; i++) {
                            children[i].set('visible', true);
                        }
                    }

                    return visible;
                },
                v;
        	    if (searchString.length < 1) {
                    aasStore.clearFilter();
                    editStore.clearFilter();
                } else {
                    v = new RegExp(searchString, 'i');
                    aasStore.getFilters().replaceAll({
                        filterFn: filterFn
                    });
                    editStore.getFilters().replaceAll({
                        filterFn: filterFn
                    });
                }
        	},
        	dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                style: {'background':'transparent','border-bottom':'1px solid gray !important'},
                height :50,
                padding:'0',
                items:[{
                    xtype:'textfield',
                    itemId:'mainTreeSearchText',
                    maxHeight:30,
                    style:{height:'30px'},
                    margin:'5px 10px 5px 5px', // (top, right, bottom, left).
                    enableKeyEvents:true,
                    listeners:{
                        change: function( ts, newValue, oldValue, eOpts ){
                            if (newValue.length == 0) {
                                me.filterStore(newValue);
                            }
                        },
                        keyup : function( ts, event, eOpts ){
                            console.log(event);
                            if(event.keyCode == 13){
                                me.filterStore(ts.getValue());
                                me.filterStore(ts.getValue());
                            }
                        }

                    }
                },{
                    xtype: 'button',
                    style:  'background: transparent; color:white;',
                    iconCls:'fas fa-search',
                    handler : function() {
                        let val = me.down('#mainTreeSearchText').getValue();
                        if (val.length > 0) {
                            me.filterStore(val);
                            me.filterStore(val);
                        }
                    }
                },'->',{
                    xtype: 'button',
                    style:  'background: transparent; color:white;',
                    iconCls:'fas fa-list-ul',
                    handler : function() {
                        //Ext.create('app.view.window.EClassSelectWindow').show();

                        Ext.create('app.view.window.AASXSelectWindow',{
                            store:aasxListStore,
                            selection:me.selectionTree
                        }).show();
                    }
                }]
            },{
                xtype: 'toolbar',
                dock: 'top',
                itemId:'mainEditTreeToolbar',
                style: {'background':'transparent','border-bottom':'1px solid gray !important'},
                hidden:true,
                height :30,
                padding:'0',
                defaults:{
                    style:  'background: transparent; color:white; border:0',
                },
                items:[{
                    xtype: 'button',
                    iconCls:'fas fa-floppy-o',
                    handler : function() {

                    }
                },'->',{
                    xtype: 'button',
                    iconCls:'fas fa-arrow-up',
                    handler : function() {
                        let selection = me.down('#mainEditTreePanel').getSelectionModel().getSelection()[0];
                        if(selection.raw.depth >= 3 && selection.raw.index > 0){
                            let pNode = selection.parentNode;
                            var idx = selection.raw.index;
                            pNode.removeChild(selection);
                            pNode.insertChild(idx-1, selection);
                            me.down('#mainEditTreePanel').getSelectionModel().select(selection);
                            //me.down('#mainEditTreePanel').remove(selection.id);
                            //
                            //selection.parentNode.
                            //me.down('#mainEditTreePanel').insert(idx+1, selection);
                        }
                    }
                },{
                    xtype: 'button',
                    iconCls:'fas fa-arrow-down',
                    handler : function() {

                        let selection = me.down('#mainEditTreePanel').getSelectionModel().getSelection()[0];
                        if(selection.raw.depth >= 3){
                            let pNode = selection.parentNode;
                            var idx = selection.raw.index;
                            pNode.removeChild(selection);
                            pNode.insertChild(idx+1, selection);
                            me.down('#mainEditTreePanel').getSelectionModel().select(selection);
                            //me.down('#mainEditTreePanel').remove(selection.id);
                            //
                            //selection.parentNode.
                            //me.down('#mainEditTreePanel').insert(idx+1, selection);
                        }
                    }
                },{
                    xtype: 'button',
                    iconCls:'fas fa-plus-square',
                    handler : function() {
                    }
                },{
                    xtype: 'button',
                    iconCls:'fas fa-trash-alt',
                    handler : function() {
                        let selection = me.down('#mainEditTreePanel').getSelectionModel().getSelection()[0];
                        selection.parentNode.removeChild(selection);
                    }
                }]
            }],
        	items: [{
                    layout:{type: 'vbox',align: 'stretch'},
                    items:[{
                        flex:1,
                        itemId:'mainTreePanel',
                        id:'mainTreePanel',
                        xtype:'treepanel',
                        cls:'maintree tree_custom',
                        store: aasStore,
                        scrollable: true,
                        hideHeaders: true,
                        rootVisible: false,
                        listeners : {
                            select:function( ts, record, index, eOpts ){
                                let date = new Date();
                                if(time + 300 < date) {
                                    me.down('#mainTreePanel').expandNode(record);
                                    Ext.getCmp('mainPanel').setTreeData(
                                        record.data.type,
                                        record.data.id,
                                        aasx.getElementTag(record.data.type,record.data.id, record.data),
                                        aasx.aasxNm,
                                        record.data);
                                }
                                time = date.getTime();
                            },
                            itemclick:function( ts, record, item, index, e, eOpts ) {
                                let date = new Date();
                                if(time + 300 < date) {
                                    Ext.getCmp('mainPanel').setTreeData(
                                        record.data.type,
                                        record.data.id,
                                        aasx.getElementTag(record.data.type,record.data.id, record.data),
                                        aasx.aasxNm,
                                        record.data);
                                }
                                time = date.getTime();
                            } /*,
                            cellclick:function( ts, td, cellIndex, record, tr, rowIndex, e, eOpts )  {
                                console.log('cellclick',record);
                            }*/
                        }
                    },{
                        flex:1,
                        itemId:'mainEditTreePanel',
                        id:'mainEditTreePanel',
                        xtype:'treepanel',
                        cls:'maintree tree_custom',
                        store: editStore,
                        scrollable: true,
                        hideHeaders: true,
                        rootVisible: true,
                        hidden:true,
                        listeners : {
                            itemclick:function( ts, record, item, index, e, eOpts ) {
                                let date = new Date();
                                if(time + 300 < date) {
                                    Ext.getCmp('mainPanel').setTreeData(record.data.type, record.data.data.id, aasx.getElementEditTag(record.data.type,record.data.id, record.data.data));
                                }
                                time = date.getTime();
                            },
                            render:function(ts){
                            ts.on('contextmenu', function(event, node) {
                                    alert(node)
                                    //treePanelCurrentNode = node;
                                    x = event.browserEvent.clientX;
                                    y = event.browserEvent.clientY;
                                    menu1.showAt([x, y]);
                                }, me);
                            }
                            /*,
                            cellclick:function( ts, td, cellIndex, record, tr, rowIndex, e, eOpts )  {
                                console.log('cellclick',record);
                            }*/
                        }
                    },{
                        itemId:'mainObjectTreePanel',
                        height:500,
                        html:''//'<div id="pnp_device_box_epson1" class="pnp_device_box" onClick="Ext.getCmp(\'PnPPanel\').onclickBtn(this)"><div class="pnp_device_box_tag"><div class="pnp_device_box_title"><div class="ccb"><div class="ccl">EPSON1</div></div></div><div class="pnp_device_box_subtitle"><div class="ccb"><div class="ccl">Robot Administration Shell</div></div></div><div class="pnp_device_box_subcontent"><div class="ccb"><div class="ccl">&#60;ID : http://www.csslab.hanyang.ac.kr/aas/EPSON1_robot&#62;</div></div></div><div class="pnp_device_box_content"><div id="pnp_device_box_epson1_content" class="pnp_device_box_textbox"></div></div></div></div>'
                }]
            }],
            reloadData: function(){
            }
        });
        this.callParent(arguments);        
    }
});
