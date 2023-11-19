Ext.define('app.view.frame.AlarmPanel',{
    extend : 'app.view.frame.DefaultPanel',
    alias : 'widget.AlarmPanel',
    id: 'alarmPanel',
    style:  {'background-color': '#0B0C0E'},
    header:false,
    padding:'3px 0 10px 0',// (top, right, bottom, left).
    initComponent: function() {
        var me = this;
        
        var alarmSubscribe;
        
		var onAlarmMessage = function(msg){
			var jsonResult = Ext.JSON.decode(msg.body);			
			me.addAlarm(jsonResult);
		}
		
		var jsonResult = Ext.JSON.decode('{"time": "2020-03-30, 21:04:06", "bus_id": "E30001", "message": "connect failed"}');

        Ext.apply(this, {
            items:[{
            	itemId:'alarmList',
            	layout:{type: 'vbox',align: 'stretch'},
                style:  {'background-color': '#0B0C0E'},
                autoScroll: true,
            	items:[]
            	
            }],
            showAlarm:function(){
            	if(me.isHidden()){
            		me.show();
            	}else me.hide();
            },
        	addAlarm:function(data){
        		
    			//{"time": "2020-03-30, 21:04:06", "bus_id": "E30001", "message": "connect failed"}

        		var aPanel = Ext.create('Ext.panel.Panel' ,{
        			items:[{
        				height:80,
        				margin:'5px 5px 0 5px',
                		style:{'background-color':'#313131'},
                    	layout:{type: 'hbox',align: 'stretch'},
                		items:[{
            				width:70,
                			xtype:'panel',
                    		style:{'text-align':'center',},
                			html:'<div class="ccb"><div class="ccl"><span class="fa-stack" style="vertical-align: top;"><i class="fa fa-circle fa-stack-1x" style="font-size:20px; color:white;" ></i><i class="fas fa-exclamation-circle fa-stack-1x fa-inverse" style="font-size:30px; color:#01A9DB;" ></i></span></div></div>',
	            		},{
	            			flex:1,
	                    	layout:{type: 'vbox',pack: "center",align: "stretch"},
	                    	items:[{
	                    		height:30,
		                    	layout:{type: 'hbox',align: "stretch"},
		                    	items:[{
			            			flex:1,
		                    		style:{'color':'white','font-size':'25px'},
		                    		html:'<div class="ccb"><div class="ccl" style="color:white; font-weight:bold; font-size:20px; text-align:left;">'+data.message+'</div></div>',
		                    	},{
		                    		width:30,
		                    		style:{'color':'white','font-size':'25px'},
		                    		html:'<div class="ccb"><div class="ccl" style="color:white; font-weight:bold; font-size:20px; text-align:left;"><i class="fas fa-times"></i></div></div>',
		                            listeners : {
		                    			render: function(panel) {
		                        			panel.body.on('click', function(ts) {
		                        				aPanel.close();

		                        			});
		                        		}
		                    		}
		                    	}]
	                    	},{
	                    		height:20,
	                    		style:{'color':'#848484','font-size':'20px'},
	                    		html:'<div class="ccb"><div class="ccl" style="color:#848484; font-weight:bold; font-size:16px; text-align:left;">'+data.bus_id+'</div></div>',
	                    	},{
	                    		height:20,
	                    		style:{'color':'#585858','font-size':'15px'},
	                    		html:'<div class="ccb"><div class="ccl" style="color:#585858; font-weight:bold; font-size:14px; text-align:left;">'+data.time+'</div></div>',
	                    	}]
	            		}]
        			}],
        			
        		});
        		me.down('#alarmList').insert(0,aPanel);
        	},
            listeners: {
            	render: function(panel) {
            		//connectAlarmMQTT();
            	}
            }
        });
        me.callParent(arguments);
    }
});