var x2js = new X2JS({aasFormat:true});
function AASX(){
    aasxSupportLanguages = ['DE','EN','FR','ES','DE','IT','CN','KR'];
    aasxIdType = ['IdShort','Custom','IRDI','URI'];
    aasxCategory = ['CONSTANT', 'PARAMETER', 'VARIABLE'];
    aasxKind = ['Type', 'Instant'];
    aasxKeyElements = ["GlobalReference",
            "ConceptDictionary",
            "AccessPermissionRule",
            "DataElement",
            "View",
            "Property",
            "SubmodelElement",
            "File",
            "Blob",
            "ReferenceElement",
            "SubmodelElementCollection",
            "RelationshipElement",
            "Event",
            "Operation",
            "OperationParameter",
            "AssetAdministrationShell",
            "Submodel",
            "ConceptDescription",
            "Asset"];
    aasxDataType = ["STRING",
                "STRING_TRANSLATABLE",
                "REAL_MEASURE",
                "REAL_COUNT",
                "REAL_CURRENCY",
                "INTEGER_MEASURE",
                "INTEGER_COUNT",
                "INTEGER_CURRENCY",
                "BOOLEAN",
                "URL",
                "RATIONAL",
                "RATIONAL_MEASURE",
                "TIME",
                "TIMESTAMP",
                "DATE"];
    aasxFileType = ["text/plain",
                "text/xml",
                "text/html",
                "application/json",
                "application/rdf+xml",
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/gif",
                "application/iges",
                "application/step"];

    top = null;
    root = null;
    assetAdministrationShells = [];
    assets = [];
    conceptDescriptions = [];
    submodels = [];
    files = [];

    aasTree = [];
    assTree = [];
    ccdTree = [];
    subTree = [];
    fileTree = [];

    isEdit = false;
    title = null;
    subtitle = null;
    aasxNm = null;

    extTree = [];

    this.getTitle = function(){
        return title==null?'':title;
    }

    this.getSubTitle = function(){
        return subtitle==null?'':subtitle;
    }

    this.getXmlAssetAdministrationShell = function(id){
        return assetAdministrationShells.find(assetAdministrationShell => assetAdministrationShell.identification.__text === id);
    };

    this.getXmlAsset = function(id){
        return assets.find(asset => asset.identification.__text === id);
    };

    this.getXmlSubModel = function(id){
        return submodels.find(submodel => submodel.identification.__text === id);
    };

    this.getXmlConceptDescription = function(id){
        if(id == undefined || id == null || id.length == 0)return undefined;
        try{
            let res = conceptDescriptions.find(conceptDescription => conceptDescription.identification.__text === id);
            return res;
        }
        catch {
            return undefined
        }
    };

    this.getItemType = function(id){
        if(id != undefined && id != null){
            if(id=='http://admin-shell.io/aasx-package-explorer/plugins/ImageMap/Submodel/1/0')return 'imagemap';
            if(id=='http://admin-shell.io/aasx-package-explorer/plugins/ImageMap/ImageFile/1/0')return 'imagefile';
            if(id=='http://admin-shell.io/aasx-package-explorer/plugins/ImageMap/EntityOfImageMap/1/0')return 'imagemapentity';
            if(id=='http://admin-shell.io/vdi/2770/1/0/Document')return 'document';
        }
        return null;
    }

    this.addSubmodelItem = function(sm, type, item){
        if(sm.items[type] == undefined){
            sm.items[type] = [];
        }
        sm.items[type].push(item);
    }

     this.getXmlTreeText = function(type, data){
        if(data == null)return '';
        try{
            if(type == 'aas' || type == 'sub' || type == 'desc'){
                return data.idShort.__text+'&nbsp;&nbsp;&nbsp;['+data.identification._idType+', '+data.identification.__text+']';
            }else if(type == 'prop'){
                let desc = this.getXmlConceptDescription(getXmlText(data.semanticId.keys.key));
                var val = '';
                if(data.value.hasOwnProperty('__text')){
                    val = '&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;'+data.value.__text;
                }else if(data.value.hasOwnProperty('keys') && data.value.keys.hasOwnProperty('key')){
                    if(Array.isArray(data.value.keys.key)){
                        for(var i=0; i<data.value.keys.key.length; i++){
                            var key = data.value.keys.key[i];
                            val+='&nbsp;&nbsp;&nbsp;['+key._type+', '
                                +(key._local == true?'Local':'Not Local')+', '
                                +key._idType+', '
                                +key.__text+']';
                            if(i < data.value.keys.key.length-1)val+=',';
                        }
                    }else{
                        var key = data.value.keys.key;
                        val ='&nbsp;&nbsp;&nbsp;['+key._type+', '
                            +(key._local == true?'Local':'Not Local')+', '
                            +key._idType+', '
                            +key.__text+']';
                    }
                }
                var unit = '';
                if(desc != undefined && desc.hasOwnProperty('embeddedDataSpecification')){
                    unit = desc.embeddedDataSpecification.dataSpecificationContent.dataSpecificationIEC61360.unit.hasOwnProperty('__text')?
                    '&nbsp;&nbsp;&nbsp;['+desc.embeddedDataSpecification.dataSpecificationContent.dataSpecificationIEC61360.unit.__text+']':'';
                }
                return data.idShort.__text+val+unit;
            }else if(type == 'mlp'){
                var val = '';
                if(data.value.hasOwnProperty('langString') && data.value.langString.length > 0){
                    val = getXmlText(data.value.langString[0])
                }
                return data.idShort.__text+'&nbsp;&nbsp;~> &nbsp;&nbsp;'+val;
            }else if(type == 'ent' || type == 'rel' || type == 'rela'){
                return data.idShort.__text;
            }else if(type == 'ref'){
                let val = Array.isArray(data.value)?data.value[0].keys.key:data.value.keys.key;
                var unit = '['+val+']';
                if(desc != undefined && desc.hasOwnProperty('embeddedDataSpecification')){
                    unit = desc.embeddedDataSpecification.dataSpecificationContent.dataSpecificationIEC61360.unit.hasOwnProperty('__text')?
                    '&nbsp;&nbsp;&nbsp;['+data.semanticId.keys.key+']':'';
                }
                return data.idShort.__text+'&nbsp;&nbsp;~> &nbsp;&nbsp;'+val+unit;
            }else if(type == 'col'){
                let len = data.value.hasOwnProperty('submodelElement')?data.value.submodelElement:null;
                if(len !=null){
                    if(Array.isArray(len)) return data.idShort.__text+'&nbsp;&nbsp;&nbsp;( '+data.value.submodelElement.length+' elements)';
                    else return data.idShort.__text+'&nbsp;&nbsp;&nbsp;( 1 elements)';

                }
            }
        }catch(e){
            console.log(e);
            return data.idShort.__text;
        }
        return '';
    };

    this.appendSubModelItems = function(list, type, key, items){
        if(type == 'imagemap'){
            if(items.imagefile != undefined && items.imagemapentity != undefined){
                var c = this.getTreeModel('Image Map','item',key,'icon_img', items, null, true);
                c.itemType = type;
                list.splice(0, 0, c);
            }
        }

        if(items.document != undefined){

        }
    };

    this.getAASLinkName = function(name){
        if(name == 'AssetAdministrationShell' || name == 'Asset')return 'aas';
        if(name == 'Submodel')return 'sub';
        if(name == 'SubmodelElementCollection')return 'col';
        if(name == 'FragmentReference')return 'plugin';
        if(name == 'File')return 'pfile';
        return '';
    }

    this.getAASLink = function(imageMaps){
        if(imageMaps != null){
            try {
                var path = '/ROOT_PACKAGE';
                var lastList = aasTree;
                var sCount = 0;
                var isAAS = false;

                if(!Array.isArray(imageMaps)){
                    imageMaps = [imageMaps];
                }
                let fType = this.getAASLinkName(imageMaps[0]._type);
                if(fType == 'aas'){
                    sCount++;
                    for(var y=0; y<lastList.length; y++){
                        if(lastList[y].type ==  fType){
                            if((imageMaps[0]._idType == 'IdShort' && getXmlText(lastList[y].data.idShort) == imageMaps[0].__text) ||
                                (lastList[y].data.id == imageMaps[0].__text)) {
                                path += '/' + lastList[y].id;
                                lastList = lastList[y].children;
                                isFind = true;
                                break;
                            }
                        }
                    }
                }
                for(var i=sCount; i<imageMaps.length; i++){
                    let imageMap = imageMaps[i];
                    var isFind = false;
                    let type = this.getAASLinkName(imageMap._type);

                    if(type == 'plugin'){
                        if(lastList.length > 0 && lastList[0].type == 'item'){
                            path+='/'+lastList[0].id;
                            isFind = true;
                        }else {
                            break;
                        }
                    }else{
                        if(!isAAS && i == 0){
                            for(var z=0; z<aasTree.length; z++){
                                let aLastList = aasTree[z];
                                for(var y=0; y<aLastList.children.length; y++){
                                    sLastList = aLastList.children[y];
                                    if(sLastList.type ==  type) {
                                        if((imageMap._idType == 'IdShort' && getXmlText(sLastList.data.idShort) == imageMap.__text) ||
                                            (sLastList.data.id == imageMap.__text)){
                                            path+='/'+aLastList.id+'/'+sLastList.id;
                                            lastList = sLastList.children;
                                            isFind = true;
                                            break;
                                        }
                                    }
                                    if(isFind)break;
                                }
                                if(isFind)break;
                            }
                        }else{
                            for(var y=0; y<lastList.length; y++){
                                if(lastList[y].type ==  type) {
                                    if((imageMap._idType == 'IdShort' && getXmlText(lastList[y].data.idShort) == imageMap.__text) ||
                                        (lastList[y].data.id == imageMap.__text)) {
                                        path += '/' + lastList[y].id;
                                        lastList = lastList[y].children;
                                        isFind = true;
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }

                return path;
            }catch (e){
                console.log(e);
            }
        }
        return null;
    }

    this.appendSubModels = function (list, obj, sm, pId){
        if(obj.hasOwnProperty('submodelRef')){
            if(Array.isArray(obj.submodelRef)){
                for(var y=0; y<obj.submodelRef.length;y++){
                    let s = this.getXmlSubModel(obj.submodelRef[y].keys.key.__text);
                    if(s != null){
                        var c = this.getTreeModel(this.getXmlTreeText('sub',s),'sub',s.identification.__text,'icon_sub', obj.submodelRef[y].keys.key, []);
                        c.idPath = pId+'.'+getXmlText(s.idShort);
                        this.appendSubModels(c.children, s.submodelElements, c, c.idPath);
                        this.appendSubModelItems(c.children, this.getItemType(getKeys(s.semanticId)) , 'item_'+s.identification.__text, c.items);
                        list.push(c);
                    }
                }
            }else {
                let s = this.getXmlSubModel(obj.submodelRef.keys.key.__text);
                if(s != null){
                    var c = this.getTreeModel(this.getXmlTreeText('sub',s),'sub',s.identification.__text,'icon_sub', obj.submodelRef.keys.key, []);
                    c.idPath = pId+'.'+getXmlText(s.idShort);
                    this.appendSubModels(c.children, s.submodelElements, c, c.idPath);
                    this.appendSubModelItems(c.children, this.getItemType(getKeys(s.semanticId)) , 'item_'+s.identification.__text, c.items);
                    list.push(c);
                }
            }
        }else if(obj.hasOwnProperty('submodelElement')){
            if(Array.isArray(obj.submodelElement)){
                for(var i=0;i<obj.submodelElement.length;i++){
                    let o = obj.submodelElement[i];
                    if(o.hasOwnProperty('property')){
                        o = o.property;
                        var c;
                        if(o.hasOwnProperty('submodelElement')){
                            o = o.submodelElement.referenceElement;
                            c = this.getTreeModel(this.getXmlTreeText('prop',o),'ref',null,'icon_ref', o, null, true);
                        }else{
                            c = this.getTreeModel(this.getXmlTreeText('prop',o),'prop',null,'icon_prop', o, null, true);
                        }
                        c.idPath = pId+'.'+getXmlText(o.idShort);
                        this.appendSubModels(c.children,o.value, sm, c.idPath);
                        list.push(c);
                    }else if(o.hasOwnProperty('multiLanguageProperty')){
                        o = o.multiLanguageProperty;
                        list.push(this.getTreeModel(this.getXmlTreeText('mlp',o),'mlp',null,'icon_mlp', o,null,true));
                    }else if(o.hasOwnProperty('entity')){
                        o = o.entity;
                        c = this.getTreeModel(this.getXmlTreeText('ent',o),'ent',null,'icon_ent', o,[]);
                        let type = this.getItemType(getXmlText(getKeys(o.semanticId)));
                        if(type != undefined)this.addSubmodelItem(sm, type, o);
                        c.idPath = pId+'.'+getXmlText(o.idShort);
                        this.appendSubModels(c.children,o.statements, sm, c.idPath);
                        list.push(c);
                    }else if(o.hasOwnProperty('relationshipElement')){
                        o = o.relationshipElement;
                        list.push(this.getTreeModel(this.getXmlTreeText('rel',o),'rel',null,'icon_rel', o,null,true));
                    }else if(o.hasOwnProperty('annotatedRelationshipElement')){
                        o = o.annotatedRelationshipElement;
                        list.push(this.getTreeModel(this.getXmlTreeText('rela',o),'rela',null,'icon_rela', o,null,true));
                    }else if(o.hasOwnProperty('referenceElement')){
                        o = o.referenceElement;
                        list.push(this.getTreeModel(this.getXmlTreeText('prop',o),'ref',null,'icon_ref', o,null,true));
                    }else if(o.hasOwnProperty('submodelElementCollection')){
                        var c = this.getTreeModel(this.getXmlTreeText('col',o.submodelElementCollection),'col',null,'icon_coll', o.submodelElementCollection, []);
                        c.idPath = pId+'.'+getXmlText(o.submodelElementCollection.idShort);
                        this.appendSubModels(c.children,o.submodelElementCollection.value, sm, c.idPath);
                        list.push(c);
                    }else if(o.hasOwnProperty('file')) {
                        let type = this.getItemType(getXmlText(getKeys(o.file.semanticId)));
                        if(type != undefined)this.addSubmodelItem(sm, type, o.file);
                        list.push(this.getTreeModel(this.getXmlTreeText('prop',o.file),'pfile',null,'icon_file', o.file, null, true));
                    }
                }
            }else{
                let o = null;
                var c = null;
                if(obj.submodelElement.hasOwnProperty('property')){
                    o = obj.submodelElement.property;
                    if(o.hasOwnProperty('submodelElement')){
                        o = o.submodelElement.referenceElement;
                        c = this.getTreeModel(this.getXmlTreeText('prop',o),'ref',null,'icon_ref', o, null, true);
                    }else{
                        c = this.getTreeModel(this.getXmlTreeText('prop',o),'prop',null,'icon_prop', o, null, true);
                    }
                    c.idPath = pId+'.'+getXmlText(o.idShort);
                    this.appendSubModels(c.children,o.value, sm, c.idPath);
                    list.push(c);
                    //{text:this.getXmlTreeText('prop',o), type:'prop', id:o.idShort.__text, leaf:false, iconCls:'icon_prop', children:[]};
                }else if(obj.submodelElement.hasOwnProperty('multiLanguageProperty')){
                    o = obj.submodelElement.multiLanguageProperty;
                    list.push(this.getTreeModel(this.getXmlTreeText('mlp',o),'mlp',null,'icon_mlp', o,null,true));
                }else if(obj.submodelElement.hasOwnProperty('entity')){
                    o = obj.submodelElement.entity;
                    c = this.getTreeModel(this.getXmlTreeText('ent',o),'ent',null,'icon_ent', o,[]);
                    let type = this.getItemType(getXmlText(getKeys(o.semanticId)));
                    if(type != undefined)this.addSubmodelItem(sm, type, o);
                    c.idPath = pId+'.'+getXmlText(o.idShort);
                    this.appendSubModels(c.children,o.statements, sm, c.idPath);
                    list.push(c);
                }else if(obj.submodelElement.hasOwnProperty('relationshipElement')){
                    o = obj.submodelElement.relationshipElement;
                    list.push(this.getTreeModel(this.getXmlTreeText('rel',o),'rel',null,'icon_rel', o,null,true));
                }else if(obj.submodelElement.hasOwnProperty('annotatedRelationshipElement')){
                    o = oobj.submodelElement.annotatedRelationshipElement;
                    list.push(this.getTreeModel(this.getXmlTreeText('rela',o),'rela',null,'icon_rela', o,null,true));
                }else if(obj.submodelElement.hasOwnProperty('submodelElementCollection')){
                    o = obj.submodelElement.submodelElementCollection;
                    while(true){
                        if(o.hasOwnProperty('submodelElementCollection')){
                            o = o.submodelElementCollection
                        }else break;
                    }
                    c = this.getTreeModel(this.getXmlTreeText('col',o),'col',null,'icon_coll', o,[]);
                    c.idPath = pId+'.'+getXmlText(o.idShort);
                    this.appendSubModels(c.children,o.value, sm, c.idPath);
                    list.push(c);
                    //{text:this.getXmlTreeText('col',o), type:'col', id:o.idShort.__text, leaf:false, iconCls:'icon_coll', children:[]};
                }else if(obj.submodelElement.hasOwnProperty('file')) {
                    o = obj.submodelElement.file;
                    let type = this.getItemType(getXmlText(getKeys(o.semanticId)));
                    if(type != undefined)this.addSubmodelItem(sm, type, o);
                    c = this.getTreeModel(this.getXmlTreeText('prop',o),'pfile',null,'icon_file', o, null, true);
                    list.push(c);
                }else {
                    o = obj;
                    if(o.hasOwnProperty('submodelElement')){
                        o = o.submodelElement.referenceElement;
                        c = this.getTreeModel(this.getXmlTreeText('prop',o),'ref',null,'icon_ref', o, null, true);
                    }else{
                        c = this.getTreeModel(this.getXmlTreeText('prop',o),'prop',null,'icon_prop', o, null, true);
                    }
                    list.push(c);
                }
            }
        }
    };

    this.getTreeModel = function(text, type, id, cls, data, chd, lf, exp){
        var obj = {text: text, type: type, iconCls:cls, data:data};
        if(id != null)obj.data.id = id;
        if(chd != undefined || chd != null)obj.children = chd;
        if(lf != undefined)obj.leaf = lf;
        if(exp != undefined)obj.expanded = exp;
        if(type == 'sub')obj.items = {};
        return obj;
    };

    this.resetData = function(){
        root = null;
        aasTree.length = 0;
        assTree.length = 0;
        ccdTree.length = 0;
        subTree.length = 0;
        extTree = [{
            text: 'Environment',
            id: 'ROOT_ENVIRONMENT',
            iconCls:'icon_env',
            expanded: false,
            leaf:false,
            children: [{
                text: 'AssetAdministrationShells',
                id: 'ROOT_AASETADMINSHELLS',
                iconCls:'icon_env',
                expanded: false,
                leaf:false,
                children: []
            },{
                text: 'Assets',
                id: 'ROOT_ASSET',
                iconCls:'icon_env',
                expanded: false,
                leaf:false,
                children: assTree
            },{
                text: 'ConceptDescriptions',
                id: 'ROOT_CONCEP',
                iconCls:'icon_env',
                type:'root_3',
                expanded: false,
                leaf:false,
                children: ccdTree
            },{
                text: 'All Submodels',
                id: 'ROOT_SUBMODEL',
                iconCls:'icon_env',
                type:'asub_new',
                expanded: false,
                leaf:false,
                children: subTree
            }]
        },{
            text: 'Supplementary Files',
            id: 'ROOT_SUPPLEMENTARY',
            iconCls:'icon_env',
            type:'file_new',
            expanded: false,
            leaf:false,
            children: fileTree
        }];
        title = null;
        subtitle = null;
    }
    /*this.saveToFile_Chrome = function(fileName, content) {
        console.log(content);
        var blob = new Blob([content], { type: 'text/plain' });
        objURL = window.URL.createObjectURL(blob);

        // 이전에 생성된 메모리 해제
        if (window.__Xr_objURL_forCreatingFile__) {
            window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
        }
        window.__Xr_objURL_forCreatingFile__ = objURL;
        var a = document.createElement('a');
        a.download = fileName;
        a.href = objURL;
        a.click();
    }*/

    this.parseAASXtoXml = function(data){
        var isSuccess = true;
        try{
            this.resetData();
            this.top = x2js.xml_str2json(data);
            this.root = this.top.aasenv;
            //this.root.assetAdministrationShells.assetAdministrationShell.submodelRefs.submodelRef.move(1,3);

            //console.log(this.root);
            //console.log(JSON.stringify(this.root));
            //this.saveToFile_Chrome('aa.xml',x2js.json2xml_str(this.top));

            for(var i=0; i<this.root.conceptDescriptions.conceptDescription.length;i++){
                let  d = this.root.conceptDescriptions.conceptDescription[i];
                conceptDescriptions.push(d);
                ccdTree.push({text:this.getXmlTreeText('desc',d), type:'desc', data:{id:d.identification.__text}, iconCls:'icon_cd', leaf:true});
            }

            for(var i=0; i<this.root.submodels.submodel.length;i++){
                let  d = this.root.submodels.submodel[i];
                submodels.push(d);
                subTree.push({text:this.getXmlTreeText('aas',d), type:'asub', data:{id:d.identification.__text}, iconCls:'icon_sub2', leaf:true});
            }

            if(this.root.assetAdministrationShells.assetAdministrationShell != null){
                if(Array.isArray(this.root.assetAdministrationShells.assetAdministrationShell)){
                    var isFirst = true;
                    for(var i=0; i<this.root.assetAdministrationShells.assetAdministrationShell.length;i++){
                        let  d = this.root.assetAdministrationShells.assetAdministrationShell[i];
                        if(title == null)title = d.identification.__text
                        assetAdministrationShells.push(d);
                        aasTree.push(this.getTreeModel(this.getXmlTreeText('aas',d), 'aas', d.identification.__text,  'icon_aas', d, [], false, isFirst));
                        this.appendSubModels(aasTree[i].children, d.submodelRefs, null, getXmlText(d.idShort));
                        extTree[0].children[0].children.push(this.getTreeModel(this.getXmlTreeText('aas',d), 'aas', d.identification.__text,  'icon_aas', d, [], false, isFirst));
                        this.appendSubModels(extTree[0].children[0].children[i].children, d.submodelRefs);
                        if(isFirst)isFirst = false;
                    }
                }else{
                    let  d = this.root.assetAdministrationShells.assetAdministrationShell;
                    if(title == null)title = d.identification.__text
                    assetAdministrationShells.push(d);
                    aasTree.push(this.getTreeModel(this.getXmlTreeText('aas',d), 'aas', d.identification.__text,  'icon_aas', d, []));
                    this.appendSubModels(aasTree[0].children, d.submodelRefs, null, getXmlText(d.idShort));
                    extTree[0].children[0].children.push(this.getTreeModel(this.getXmlTreeText('aas',d), 'aas', d.identification.__text,  'icon_aas', d, [], false, true));
                    this.appendSubModels(extTree[0].children[0].children[0].children, d.submodelRefs);
                }
            }

            if(this.root.assets.asset != null){
                if(Array.isArray(this.root.assets.asset)){
                    for(var i=0; i<this.root.assets.asset.length;i++){
                        let  d = this.root.assets.asset[i];
                        if(subtitle == null)subtitle = d.identification.__text
                        assets.push(d);
                        assTree.push({text:this.getXmlTreeText('aas',d), type:'asset', data:{id:d.identification.__text}, iconCls:'icon_asset', leaf:true});
                    }
                }else{
                    let  d = this.root.assets.asset;
                    if(subtitle == null)subtitle = d.identification.__text
                    assets.push(d);
                    assTree.push({text:this.getXmlTreeText('aas',d), type:'asset', data:{id:d.identification.__text}, iconCls:'icon_asset', leaf:true});
                }
            }

        }catch(e){
            console.log(e);
            isSuccess = false;
        }

        return isSuccess;
    };

    this.setFileList = function(data){
        if(!Array.isArray(data)) return;
        for(var i=0; i<data.length; i++){
            fileTree.push({text:data[i], type:'file', id:'file_'+i, iconCls:'icon_sub2', leaf:true});
        }

    }

    mainTree = null;


    this.setExtjsTree = function(tree, edit){
        tree.getStore().getRootNode().removeAll();
        for(var i=0; i<aasTree.length;i++){
            tree.getStore().getRootNode().appendChild(aasTree[i]);
        }
        if(aasTree.length>0){
            tree.expandNode(tree.getRootNode().childNodes[0]);
            //tree.getRootNode().appendChild( { text: '', leaf: true });
            //tree.getStore().getRootNode().removeChild(tree.getStore().getRootNode().childNodes[tree.getStore().getRootNode().childNodes.length-1]);
        }
        for(var i=0; i<extTree.length;i++){
            edit.getStore().getRootNode().appendChild(extTree[i]);
        }
        if(extTree.length>0){
            //edit.getRootNode().appendChild( { text: '', leaf: true });
            //edit.getStore().getRootNode().removeChild(edit.getStore().getRootNode().childNodes[edit.getStore().getRootNode().childNodes.length-1]);
        }
    }

    this.getSelectTag = function(name, type, selection){
        var tag = '<select name="'+name+'">';
        if(type == 'idType'){
            for(var i=0;i<aasxIdType.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxIdType[i].toUpperCase()?'selected':'')+'>'+aasxIdType[i]+'</option>';
            }
        }else if(type == 'category'){
            tag+='<option '+(selection==undefined?'selected':'')+'></option>';
            for(var i=0;i<aasxCategory.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxCategory[i].toUpperCase()?'selected':'')+'>'+aasxCategory[i]+'</option>';
            }
        }else if(type == 'lang'){
            for(var i=0;i<aasxSupportLanguages.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxSupportLanguages[i].toUpperCase()?'selected':'')+'>'+aasxSupportLanguages[i]+'</option>';
            }
        }else if(type == 'kind'){
            for(var i=0;i<aasxKind.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxKind[i].toUpperCase()?'selected':'')+'>'+aasxKind[i]+'</option>';
            }
        }else if(type == 'key'){
            tag+='<option '+(selection==undefined?'selected':'')+'></option>';
            for(var i=0;i<aasxKeyElements.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxKeyElements[i].toUpperCase()?'selected':'')+'>'+aasxKeyElements[i]+'</option>';
            }
        }else if(type == 'dataType'){
            tag+='<option '+(selection==undefined?'selected':'')+'></option>';
            for(var i=0;i<aasxDataType.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxDataType[i].toUpperCase()?'selected':'')+'>'+aasxDataType[i]+'</option>';
            }
        }else if(type == 'fileType'){
            tag+='<option '+(selection==undefined?'selected':'')+'></option>';
            for(var i=0;i<aasxFileType.length;i++){
                tag+='<option '+(selection!=undefined&&selection.toUpperCase()==aasxFileType[i].toUpperCase()?'selected':'')+'>'+aasxFileType[i]+'</option>';
            }
        }
        tag+='</select>'
        return tag;
    }

    this.getElementPropertyParamTag = function(obj, type, key){
        var tag = '';
        if(obj === undefined) return tag;
        if(key === undefined)key='';
        if(Array.isArray(obj)){
            let item0 = obj[0];
            if (type === 'txt'){
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs(getObjectValue(item0,'__text'))+'</div></div>';
            }else if(type === 'cls'){
                let semanticId = ('('+item0._type+') ')+(item0._local=='true'?'(Local) ':'(no-Local) ')+('['+item0._idType+'] ')+item0.__text;
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs(semanticId)+'</div></div>';
            }else if(type === 'def'){
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs('['+getObjectValue(item0,'_lang')+']'+getObjectValue(item0,'__text'))+'</div></div>';
            }else if(type === 'key'){
                    tag+=this.getElementPropertyParamTag(item0.keys.key,'cls',key+'[0]');
            }
            for(var i=1; i<obj.length;i++){
                let item = obj[i];
                if (type === 'txt'){
                    tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_value">'+cs(getObjectValue(item,'__text'))+'</div></div>';
                }else if(type === 'cls'){
                    let semanticId = ('('+item._type+') ')+(item._local=='true'?'(Local) ':'(no-Local) ')+('['+item._idType+'] ')+item.__text;
                    tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_value">'+cs(semanticId)+'</div></div>';
                }else if (type === 'def'){
                    tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_value">'+cs('['+getObjectValue(item,'_lang')+']'+getObjectValue(item,'__text'))+'</div></div>';
                }else if(type === 'key'){
                    tag+=this.getElementPropertyParamTag(item.keys.key,'cls',key+'['+i+']');
                }
            }
        }else{
            if (type === 'txt'){
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs(getObjectValue(obj,'__text'))+'</div></div>';
            }if (type === 'idt'){
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs(getObjectValue(obj,'_idType'))+'</div></div>';
            }else if(type === 'cls'){
                let semanticId = ('('+obj._type+') ')+(obj._local=='true'?'(Local) ':'(no-Local) ')+('['+obj._idType+'] ')+obj.__text;
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs(semanticId)+'</div></div>';
            }else if (type === 'def'){
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs(key+':')+'</div><div class="aasx_tag_content_value">'+cs('['+getObjectValue(obj,'_lang')+']'+getObjectValue(obj,'__text'))+'</div></div>';
            }else if(type === 'key'){
                    tag+=this.getElementPropertyParamTag(obj.keys.key,'cls',key);
            }
        }
        return tag;
    }

    this.getElementEditParamTag = function(obj, type){
        var tag = '';
        if(type == 'text'){
            tag+='<div class="aasx_tag_content edit" '+(obj.style!=undefined?'style="'+obj.style+'"':'')+'><div class="aasx_tag_content_title">'+cs(obj.title+':')+'</div><div class="aasx_tag_content_value"><input type="text" name="'+obj.key+'" '+(obj.value!=undefined?'value="'+obj.value+'"':'')+'/></div></div>';
        }else if(type == 'file'){
            tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title">'+cs(obj.title+':')+'</div><div class="aasx_tag_content_value"><input type="file" name="'+obj.key+'"/></div></div>';
        }else if(type == 'select'){
            tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title">'+cs(obj.title+':')+'</div><div class="aasx_tag_content_value"><select name="'+obj.key+'">';
            for(var i=0; i<obj.select.length; i++){
                if(obj.def!=undefined && obj.select[i] == obj.def)tag+='<option selected>'+obj.select[i]+'</option>';
                else tag+='<option>'+obj.select[i]+'</option>';
            }
            tag+='</select></div></div>';
        }else if(type == 'other'){
            tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title">'+cs(obj.title!=null?obj.title+':':'')+'</div><div class="aasx_tag_content_value">'+obj.tag+'</div></div>';
        }else if(type == 'array'){
            tag+='<div class="aasx_tag_subbox">';
            tag+=obj.tag;//
            if(obj.def!=undefined)tag+=obj.def;
            tag+='</div>';
        }else if(type == 'desc'){
            tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title"></div><div class="aasx_tag_content_value">'+this.getSelectTag(obj.name,'lang',getXmlLang(obj.data))+'<input type="text" value="'+getXmlText(obj.data,'')+'"/><input type="button" value=" - " onclick="getElementParentTag(this,3).removeChild(getElementParentTag(this,2))"/></div></div>';
        }else if(type == 'refs'){
            tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title">'+cs(obj.title!=null?obj.title+':':'')+'</div><div class="aasx_tag_content_value"><input type="button" value="Add Blank" onclick=""></div></div>';
        }else if(type == 'ref'){
            tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title">'+cs(obj.title!=null?obj.title+':':'')+'</div><div class="aasx_tag_content_value">'+this.getSelectTag('','key', getXmlType(obj.data))+'<input type="checkbox" '+(getXmlLocal(obj.data)=='true'?'checked="checked"':'')+'/>local '+this.getSelectTag('','idType', getXmlIdType(obj.data))+'<input type="text" value="'+getXmlText(obj.data,'')+'"/><input type="button" value=" - " onclick="getElementParentTag(this,3).removeChild(getElementParentTag(this,2))"/></div></div>';
        }
        return tag;
    }

    this.getElementQualifierTag = function(obj){
        var tag = '';
        if(obj.data.hasOwnProperty('qualifier') && obj.data.qualifier.hasOwnProperty('qualifier')){
            if(Array.isArray(obj.data.qualifier.qualifier)){
                for(var i=0;i<obj.data.qualifier.qualifier.length;i++){
                    let q = obj.data.qualifier.qualifier[i];
                    tag+='<div class="aasx_tag_sub_title">'+cs('Qualifier '+(i+1))+'</div>';
                    tag+=this.getElementPropertyParamTag(q.semanticId.keys.key,'cls','semanticId');
                    tag+=this.getElementPropertyParamTag(q.qualifierType,'txt','type');
                    tag+=this.getElementPropertyParamTag(q.qualifierValue,'txt','value');
                    tag+=this.getElementPropertyParamTag(q.qualifierValueId.keys.key,'cls','valueId');
                }
            }else{
                let q = obj.data.qualifier.qualifier;
                tag+='<div class="aasx_tag_sub_title">'+cs('Qualifier 1')+'</div>';
                tag+=this.getElementPropertyParamTag(q.semanticId.keys.key,'cls','semanticId');
                tag+=this.getElementPropertyParamTag(q.qualifierType,'txt','type');
                tag+=this.getElementPropertyParamTag(q.qualifierValue,'txt','value');
                tag+=this.getElementPropertyParamTag(q.qualifierValueId.keys.key,'cls','valueId');
            }
        }
        return tag;
    }


    this.getElementTag = function(type, id, obj){
        var tag = '<div class="aasx_tag_box">';

        if(type === 'aas'){
            let data = this.getXmlAssetAdministrationShell(obj.data.id);
            tag+='<div class="aasx_tag_title">'+cs('Asset Administration Shell')+'</div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('idShort:')+'</div><div class="aasx_tag_content_value">'+cs(data.idShort.__text)+'</div></div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('HasDataSpecification')+'</div>';
            if(data.hasOwnProperty('hasDataSpecification')){
                tag+=this.getElementPropertyParamTag(data.hasDataSpecification.reference,'key','reference');
            }
            tag+='<div class="aasx_tag_sub_title">'+cs('Identifiable')+'</div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('idType:')+'</div><div class="aasx_tag_content_value">'+cs(data.identification._idType)+'</div></div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('id:')+'</div><div class="aasx_tag_content_value">'+cs(data.identification.__text)+'</div></div>';
            if(data.hasOwnProperty('administration')){
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('version:')+'</div><div class="aasx_tag_content_value">'+cs(getXmlText(data.administration.version))+'</div></div>';
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('revision:')+'</div><div class="aasx_tag_content_value">'+cs(getXmlText(data.administration.revision))+'</div></div>';
            }

            if(data.hasOwnProperty('derivedFrom')){
                tag+='<div class="aasx_tag_sub_title">'+cs('Derived From')+'</div>';
                if(Array.isArray(data.derivedFrom.keys.key)){
                    for(var i=0; i<data.derivedFrom.keys.key.length; i++){
                        let data = data.derivedFrom.keys.key[i];
                        if(i==0)tag+=this.getElementPropertyParamTag(data,'cls','derivedFrom');
                        else tag+=this.getElementPropertyParamTag(data,'cls','');
                    }
                }else{
                    tag+=this.getElementPropertyParamTag(data.derivedFrom.keys.key,'cls','derivedFrom');
                }
            }

            tag+='<div class="aasx_tag_sub_title">'+cs('Asset Reference')+'</div>';
            let assetRef = ('('+data.assetRef.keys.key._type+') ')+(data.assetRef.keys.key._local=='true'?'(Local) ':'')+('['+data.assetRef.keys.key._idType+'] ')+data.assetRef.keys.key.__text;
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('assetRef:')+'</div><div class="aasx_tag_content_value">'+cs(assetRef)+'</div></div>';
            let asset =this.getXmlAsset(data.assetRef.keys.key.__text);
            tag+='<div class="aasx_tag_title">'+cs('Asset')+'</div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('idShort:')+'</div><div class="aasx_tag_content_value">'+cs(asset.idShort.__text)+'</div></div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('identifiable members')+'</div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('idType:')+'</div><div class="aasx_tag_content_value">'+cs(asset.identification._idType)+'</div></div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('id:')+'</div><div class="aasx_tag_content_value">'+cs(asset.identification.__text)+'</div></div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('Kind')+'</div>';
            tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('Kind:')+'</div><div class="aasx_tag_content_value">'+cs(asset.kind.__text)+'</div></div>';
        }else if(type == 'sub'){

            let data = this.getXmlSubModel(obj.data.id);

            tag+='<div class="aasx_tag_title">'+cs('SubmodelReference')+'</div>';
            tag+=this.getElementPropertyParamTag(obj.data,'cls','submodelRef');
            tag+='<div class="aasx_tag_title">'+cs('Submodel')+'</div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+=this.getElementPropertyParamTag(data.idShort,'txt','idShort');
            tag+='<div class="aasx_tag_sub_title">'+cs('identifiable members')+'</div>';
            tag+=this.getElementPropertyParamTag(data.identification,'idt','idType');
            tag+=this.getElementPropertyParamTag(data.identification,'txt','id');
            tag+='<div class="aasx_tag_sub_title">'+cs('Semantic ID')+'</div>';
            tag+=this.getElementPropertyParamTag(data.semanticId.keys.key,'cls','semanticId');
            tag+='<div class="aasx_tag_sub_title">'+cs('Kind')+'</div>';
            tag+=this.getElementPropertyParamTag(data.kind,'txt','Kind');
            tag+='<div class="aasx_tag_sub_title">'+cs('Qualifier')+'</div>';
            tag+=this.getElementQualifierTag(obj);
            tag+='<div class="aasx_tag_sub_title">'+cs('HasDataSpecification')+'</div>';
            if(data.hasOwnProperty('hasDataSpecification')){
                tag+=this.getElementPropertyParamTag(data.hasDataSpecification.reference,'key','reference');
            }

        }else if(type == 'col' || type == 'prop' || type == 'ref' || type == 'pfile' || type == 'ent' || type == 'mlp' || type == 'rel' || type == 'rela'){
            tag+='<div class="aasx_tag_title">'+cs('Submodel Element')+'</div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+=this.getElementPropertyParamTag(obj.data.idShort,'txt','idShort');
            if(obj.data.hasOwnProperty('category'))tag+=this.getElementPropertyParamTag(obj.data.category,'txt','category');
            if(obj.data.hasOwnProperty('description'))tag+=this.getElementPropertyParamTag(obj.data.description.langString,'def','description');
            if(obj.data.hasOwnProperty('hasDataSpecification')){
                tag+='<div class="aasx_tag_sub_title">'+cs('HasDataSpecification')+'</div>';
                tag+=this.getElementPropertyParamTag(obj.data.hasDataSpecification.reference,'key','reference');
            }
            tag+='<div class="aasx_tag_sub_title">'+cs('Kind')+'</div>';
            tag+=this.getElementPropertyParamTag(obj.data.kind,'txt','kind');
            tag+='<div class="aasx_tag_sub_title">'+cs('Semantic ID')+'</div>';
            //if(!Array.isArray(obj.data.semanticId.keys.key))tag+=this.getElementPropertyParamTag(obj.data.semanticId.keys.key,'cls','semanticId');
            //else
            tag+=this.getElementPropertyParamTag(obj.data.semanticId.keys.key,'cls','semanticId');

            tag+='<div class="aasx_tag_sub_title">'+cs('Qualifier')+'</div>';
            tag+=this.getElementQualifierTag(obj);

            if(!Array.isArray(obj.data.semanticId.keys.key)){
                let data = this.getXmlConceptDescription(getXmlText(obj.data.semanticId.keys.key));
                if(data != undefined){
                    tag+='<div class="aasx_tag_title">'+cs('ConceptDescription')+'</div>';

                    tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
                    tag+=this.getElementPropertyParamTag(data.idShort,'txt','idShort');

                    tag+='<div class="aasx_tag_sub_title">'+cs('Identifiable members')+'</div>';
                    tag+=this.getElementPropertyParamTag(data.identification,'idt','idType');
                    tag+=this.getElementPropertyParamTag(data.identification,'txt','id');

                    tag+='<div class="aasx_tag_sub_title">'+cs('IsCaseOf')+'</div>';
                    tag+=this.getElementPropertyParamTag(data.isCaseOf,'key','reference');

                    tag+='<div class="aasx_tag_sub_title">'+cs('HasDataSpecification')+'</div>';
                    if(data.hasOwnProperty('embeddedDataSpecification')){
                        if(data.embeddedDataSpecification.hasOwnProperty('hasDataSpecification')){
                            tag+=this.getElementPropertyParamTag(data.embeddedDataSpecification.hasDataSpecification.keys.key,'cls','hasDataSpecification');
                        }

                        tag+='<div class="aasx_tag_sub_title">'+cs('Data Specification Content IEC61360')+'</div>';
                        let iec61360 = data.embeddedDataSpecification.dataSpecificationContent.dataSpecificationIEC61360;
                        tag+=this.getElementPropertyParamTag(iec61360.preferredName.langString,'def','preferredName');
                        tag+=this.getElementPropertyParamTag(iec61360.shortName,'txt','shortName');
                        tag+=this.getElementPropertyParamTag(iec61360.unit,'txt','unit');
                        tag+=this.getElementPropertyParamTag(iec61360.dataType,'txt','dataType');
                        tag+=this.getElementPropertyParamTag(iec61360.definition.langString,'def','preferredName');
                    }
                }
            }
            if(type == 'col'){
                tag+='<div class="aasx_tag_title">'+cs('SubmodelElementCollection')+'</div>';
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('# of values:')+'</div><div class="aasx_tag_content_value">'+cs(obj.children.length)+'</div></div>';
            }
            if(type == 'prop'){
                tag+='<div class="aasx_tag_title">'+cs('Property')+'</div>';
                tag+=this.getElementPropertyParamTag(obj.data.valueType,'txt','valueType');
                tag+=this.getElementPropertyParamTag(obj.data.value,'txt','value');

                let vType = getXmlText(obj.data.valueType);
                if(vType != undefined && (
                    vType.toLowerCase() == 'boolean' ||
                    vType.toLowerCase() == 'double'||
                    vType.toLowerCase() == 'float'||
                    vType.toLowerCase() == 'integer'
                )){
                    tag+='<input type="button" value="show Graph" style="left: 35px; top: 20px; position: relative;" onclick="Ext.getCmp(\'mainPanel\').setIframeView()">';
                    tag+='<div id="mainPanelIframe" style="position: relative; margin-top: 30px; left: 1%; width: 98%; height: 400px;background-color: transparent"></div>';
                }

            }
            if(type == 'ent'){
                tag+='<div class="aasx_tag_title">'+cs('Entity')+'</div>';
                tag+='<div class="aasx_tag_content"><div class="aasx_tag_content_title">'+cs('# of statements:')+'</div><div class="aasx_tag_content_value">'+cs(obj.children.length)+'</div></div>';
            }
            if(type == 'mlp'){
                tag+='<div class="aasx_tag_title">'+cs('MultiLanguageProperty')+'</div>';
                tag+=this.getElementPropertyParamTag(obj.data.value.langString,'def','value');
            }
            if(type == 'rel'){
                tag+='<div class="aasx_tag_title">'+cs('RelationshipElement')+'</div>';
                tag+=this.getElementPropertyParamTag(obj.data.first,'key','first');
                tag+=this.getElementPropertyParamTag(obj.data.second,'key','second');
            }
            if(type == 'rela'){
                tag+='<div class="aasx_tag_title">'+cs('AnnotatedRelationshipElement')+'</div>';
                tag+=this.getElementPropertyParamTag(obj.data.first,'key','first');
                tag+=this.getElementPropertyParamTag(obj.data.second,'key','second');
            }
            if(type == 'pfile'){
                tag+='<div class="aasx_tag_title">'+cs('File')+'</div>';
                tag+=this.getElementPropertyParamTag(obj.data.mimeType,'txt','mimeType');
                tag+=this.getElementPropertyParamTag(obj.data.value,'txt','value');
            }
            if(type == 'ref'){
                tag+='<div class="aasx_tag_title">'+cs('ReferenceElement')+'</div>';
                if(Array.isArray(obj.data.value.keys.key)){
                    for(var i=0; i<obj.data.value.keys.key.length; i++){
                        let data = obj.data.value.keys.key[i];
                        if(i==0)tag+=this.getElementPropertyParamTag(data,'cls','value');
                        else tag+=this.getElementPropertyParamTag(data,'cls','');
                    }
                }else{
                    tag+=this.getElementPropertyParamTag(obj.data.value.keys.key,'cls','value');
                }
            }
        }

        tag+='</div>';
        return tag;
    }

    this.appendEditDesciptionTag = function(tag, key, obj){
        tag.insertAdjacentHTML('beforeend',this.getElementEditParamTag({}, 'desc'));
    }


    this.appendEditReferenceTag = function(tag, key, number){
        let tttt=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'reference['+(tag.childNodes.length-1)+']', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')">'},'other')},'array');

        tag.insertAdjacentHTML('beforeend',tttt);
    }

    this.removeEditReferenceTag = function(tag){
        if(tag.childNodes.length>1)tag.removeChild(tag.childNodes[tag.childNodes.length-1]);
    }

    this.appendEditReferenceChildTag = function(tag, key, number){
        tag.insertAdjacentHTML('beforeend',this.getElementEditParamTag({}, 'ref'));
    }

    this.appendQualifierTag = function(tag, key, number){
        var def = '';
        def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'semanticId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:''},'array');
        def+=this.getElementEditParamTag({title:'type', key:'type'},'text');
        def+=this.getElementEditParamTag({title:'value', key:'value'},'text');
        def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'valueId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:''},'array');

        tag.insertAdjacentHTML('beforeend',this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'Qualifier '+(tag.childNodes.length-1), tag:'<input type="button" value="Delete" onclick="getElementParentTag(this,4).removeChild(getElementParentTag(this,3))"/>'},'other'), def:def},'array'));
    }

    this.createDesciptionTag = function(data){
        var def = '';
        if(Array.isArray(data.langString)){
            for(var i=0; i<data.langString.length; i++){
                def+=this.getElementEditParamTag({name:'', data:data.langString[i]}, 'desc');
            }
        }else{
            def+=this.getElementEditParamTag({name:'', data:data.langString}, 'desc');
        }
        return def;
    }

    this.createReferenceKeyTag = function(data){
        var def = '';
        if(Array.isArray(data.keys.key)){
            for(var i=0; i<data.keys.key.length; i++){
                def+=this.getElementEditParamTag({name:'', data:data.keys.key[i]}, 'ref');
            }
        }else{
            def+=this.getElementEditParamTag({name:'', data:data.keys.key}, 'ref');
        }
        return name
    }

    this.createDataSpecificationTag = function(data){
        var def = '';
        if(Array.isArray(data.reference)){
            for(var i=0; i<data.reference.length; i++){
                var sdef = '';
                if(Array.isArray(data.reference[i].keys.key)){
                    for(var y=0;y<data.reference[i].keys.key.length; y++){
                        sdef+=this.getElementEditParamTag({name:'', data:data.reference[i].keys.key[y]}, 'ref');
                    }
                }else{
                    sdef+=this.getElementEditParamTag({name:'', data:data.reference[i].keys.key}, 'ref');
                }
                def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'reference['+i+']', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')">'},'other'), def:sdef},'array');
            }
        }else{
            if(Array.isArray(data.reference.keys.key)){
                for(var i=0;i<data.reference.keys.key.length; i++){
                    sdef+=this.getElementEditParamTag({name:'', data:data.reference.keys.key[i]}, 'ref');
                }
            }else{
                sdef+=this.getElementEditParamTag({name:'', data:data.reference.keys.key}, 'ref');
            }
            def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'reference[0]', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')">'},'other'), def:rdef},'array');
        }
        return def;
    }

    this.getElementEditTag = function(type, id, obj){
        var tag = '<div class="aasx_tag_box">';

        let oId = null;
        if(type == 'desc' || type == 'prop' || type == 'col'){
            oId = type=='desc'?obj.id:getXmlText(obj.semanticId.keys.key);
            let data = this.getXmlConceptDescription(oId);
            tag+='<form  name="descForm" id="descForm">';

            tag+='<div class="aasx_tag_title">'+cs('ConceptDescription')+'</div>';
            if(data != undefined){

                tag+=this.getElementEditParamTag({title:'Action', tag:'<input type="button" value="Delete" onclick=""/>'},'other');

                tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
                tag+=this.getElementEditParamTag({title:'idShort', key:'idShort', value:getXmlText(data.idShort)},'text');
                tag+=this.getElementEditParamTag({title:'category', key:'category', select:['CONSTANT', 'PARAMETER', 'VARIABLE']},'select');
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'description', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other')},'array');

                tag+='<div class="aasx_tag_sub_title">'+cs('Identifiable members')+'</div>';
                tag+=this.getElementEditParamTag({title:'idType', key:'idType', select:['idShort', 'Custom', 'IRDI', 'URI'], def:getXmlIdType(obj.semanticId.keys.key)},'select');
                tag+=this.getElementEditParamTag({title:'id', key:'id', value:oId},'text');

                tag+=this.getElementEditParamTag({title:'administration', tag:'<input type="button" value="Create data element!" onclick="getElementParentTag(this,2).style.display=\'none\';getElementParentTag(document.descForm.version,2).style.display=\'\';getElementParentTag(document.descForm.revision,2).style.display=\'\'"/>'},'other');
                tag+=this.getElementEditParamTag({title:'version', key:'version', style:'display:none;'},'text');
                tag+=this.getElementEditParamTag({title:'revision', key:'revision', style:'display:none;'},'text');

                tag+='<div class="aasx_tag_sub_title">'+cs('IsCaseOf')+'</div>';
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'IsCaseOf', tag:'<input type="button" value="Add Reference" onclick="aasx.appendEditReferenceTag(getElementParentTag(this,3), \'ref\')"/><input type="button" value="Delete last reference" onclick=""/>'},'other')},'array');

                tag+='<div class="aasx_tag_sub_title">'+cs('hasDataSpecification')+'</div>';
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'hasDataSpecification', tag:'<input type="button" value="Add blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"><input type="button" value="IEC61360" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'desc\')">'},'other')},'array');

                tag+='<div class="aasx_tag_sub_title">'+cs('Data Specification Content IEC61360')+'</div>';
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'preferredName', tag:'<input type="button" value="Add blank" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other')},'array');
                tag+=this.getElementEditParamTag({title:'shortName', key:'shortName'},'text');
                tag+=this.getElementEditParamTag({title:'unit', key:'unit'},'text');
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'unitId', tag:'<input type="button" value="Add blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"><input type="button" value="IEC61360" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'desc\')">'},'other')},'array');
                tag+=this.getElementEditParamTag({title:'valueFormat', key:'valueFormat'},'text');
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'sourceOfDefinition', tag:'<input type="button" value="Add blank" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other')},'array');

                tag+=this.getElementEditParamTag({title:'symbol', key:'valueFormat'},'text');
                tag+=this.getElementEditParamTag({title:'dataType', tag:this.getSelectTag('dataType','dataType')},'other');
                tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'definition', tag:'<input type="button" value="Add blank" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other')},'array');
            }
            tag+='</form>'
        }
        else if(type == 'aas'){
            oId = obj.id;
            let data = this.getXmlAssetAdministrationShell(oId);

            var def = '';
            tag+='<form  name="descForm" id="AASForm">';

            tag+='<div class="aasx_tag_title">'+cs('Asset Administration Shell')+'</div>';

            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+=this.getElementEditParamTag({title:'idShort', key:'idShort', value:getXmlText(data.idShort)},'text');
            tag+=this.getElementEditParamTag({title:'category', tag:this.getSelectTag('category','category',getXmlText(data.category))},'other');

            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'description', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other'),
             def:data.hasOwnProperty('description')?this.createDesciptionTag(data.description):''},'array');

            tag+='<div class="aasx_tag_sub_title">'+cs('HasDataSpecification')+'</div>';
            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'Specifications', tag:'<input type="button" value="Add Reference" onclick="aasx.appendEditReferenceTag(getElementParentTag(this,3), \'ref\')"/><input type="button" value="Delete last reference" onclick="aasx.removeEditReferenceTag(getElementParentTag(this,3))"/>'},'other'),
             def:data.hasOwnProperty('hasDataSpecification')?this.createDataSpecificationTag(data.hasDataSpecification):''},'array');

            tag+='<div class="aasx_tag_sub_title">'+cs('Identifiable Members')+'</div>';
            tag+=this.getElementEditParamTag({title:'idType', tag:this.getSelectTag('idType','idType',getXmlIdType(data.identification))},'other');
            tag+=this.getElementEditParamTag({title:'id', key:'id', value:getXmlText(data.identification)},'text');
            tag+=this.getElementEditParamTag({title:'administration', tag:'<input type="button" value="Create data element!" onclick="getElementParentTag(this,2).style.display=\'none\';getElementParentTag(document.descForm.version,2).style.display=\'\';getElementParentTag(document.descForm.revision,2).style.display=\'\'"/>'},'other');
            tag+=this.getElementEditParamTag({title:'version', key:'version', style:'display:none;'},'text');
            tag+=this.getElementEditParamTag({title:'revision', key:'revision', style:'display:none;'},'text');

            tag+='<div class="aasx_tag_sub_title">'+cs('Derived From')+'</div>';

            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'derivedFrom', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'),
             def:data.hasOwnProperty('derivedFrom')?this.createReferenceKeyTag(data.derivedFrom):''},'array');

            tag+='<div class="aasx_tag_sub_title">'+cs('Asset Reference')+'</div>';

            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'assetRef', tag:'<input type="button" value="Add Reference" onclick="aasx.appendEditReferenceTag(getElementParentTag(this,3), \'ref\')"/><input type="button" value="Delete last reference" onclick="aasx.removeEditReferenceTag(getElementParentTag(this,3))"/>'},'other'),
             def:data.hasOwnProperty('assetRef')?this.createReferenceKeyTag(data.assetRef):''},'array');

            tag+='</form>'

            if(data.hasOwnProperty('assetRef')) oId = Array.isArray(data.assetRef.keys.key)?getXmlText(data.assetRef.keys.key[0]):getXmlText(data.assetRef.keys.key);

        }

        if(type == 'aas' || type == 'asset'){
            if(type == 'asset')oId = obj.id;
            let data = this.getXmlAsset(oId);
            //if(data == undefined) continue;

            var def = '';
            tag+='<form  name="descForm" id="AssetForm">';

            tag+='<div class="aasx_tag_title">'+cs('Asset')+'</div>';

            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+=this.getElementEditParamTag({title:'idShort', key:'idShort', value:data.idShort.__text},'text');
            tag+=this.getElementEditParamTag({title:'category', tag:this.getSelectTag('category','category')},'other');

            if(data.hasOwnProperty('description')){
                if(Array.isArray(data.description.langString)){
                    for(var i=0; i<data.description.langString.length; i++){
                        def+=this.getElementEditParamTag({name:'', data:data.description.langString[i]}, 'desc');
                    }
                }else{
                    def+=this.getElementEditParamTag({name:'', data:data.description.langString}, 'desc');
                }
            }
            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'description', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other'), def:def},'array');

            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'Specifications', tag:'<input type="button" value="Add Reference" onclick="aasx.appendEditReferenceTag(getElementParentTag(this,3), \'ref\')"/><input type="button" value="Delete last reference" onclick=""/>'},'other')},'array');

            tag+='<div class="aasx_tag_sub_title">'+cs('Identifiable Members')+'</div>';
            tag+=this.getElementEditParamTag({title:'idType', key:'idType', select:['idShort', 'Custom', 'IRDI', 'URI']},'select');
            tag+=this.getElementEditParamTag({title:'administration', tag:'<input type="button" value="Create data element!" onclick="getElementParentTag(this,2).style.display=\'none\';getElementParentTag(document.descForm.version,2).style.display=\'\';getElementParentTag(document.descForm.revision,2).style.display=\'\'"/>'},'other');
            tag+=this.getElementEditParamTag({title:'version', key:'version', style:'display:none;'},'text');
            tag+=this.getElementEditParamTag({title:'revision', key:'revision', style:'display:none;'},'text');

            tag+='<div class="aasx_tag_sub_title">'+cs('Kind')+'</div>';
            tag+=this.getElementEditParamTag({title:'kind', tag:this.getSelectTag('kind','kind')},'other');

            tag+='</form>'
        }

        if(type == 'sub' || type == 'asub'){
            let data = this.getXmlSubModel(obj.id);
            tag+='<form  name="descForm" id="ASubForm">';

            tag+='<div class="aasx_tag_title">'+cs('SubModel')+'</div>';

            tag+='<div class="aasx_tag_sub_title">'+cs('Referable members')+'</div>';
            tag+=this.getElementEditParamTag({title:'idShort', key:'idShort', value:getXmlText(data.idShort)},'text');
            tag+=this.getElementEditParamTag({title:'category', tag:this.getSelectTag('category','category',getXmlText(obj.category))},'other');
            let def = '';
            if(data.hasOwnProperty('description')){
                if(Array.isArray(data.description.langString)){
                    for(var i=0; i<data.description.langString.length; i++){
                        def+=this.getElementEditParamTag({name:'', data:data.description.langString[i]}, 'desc');
                    }
                }else{
                    def+=this.getElementEditParamTag({name:'', data:data.description.langString}, 'desc');
                }
            }
            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'description', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditDesciptionTag(getElementParentTag(this,3), \'desc\')">'},'other'), def:def},'array');

            def = '';
            if(data.hasOwnProperty('hasDataSpecification')){
                var rdef = '';
                if(Array.isArray(data.hasDataSpecification.reference)){
                    for(var i=0; i<data.hasDataSpecification.reference.length; i++){
                        var sdef = '';
                        if(Array.isArray(data.hasDataSpecification.reference[i].keys.key)){
                            for(var y=0;y<data.hasDataSpecification.reference[i].keys.key.length; y++){
                                sdef+=this.getElementEditParamTag({name:'', data:data.hasDataSpecification.reference[i].keys.key[y]}, 'ref');
                            }
                        }else{
                            sdef+=this.getElementEditParamTag({name:'', data:data.hasDataSpecification.reference[i].keys.key}, 'ref');
                        }
                        def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'reference['+i+']', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')">'},'other'), def:sdef},'array');
                    }
                }else{
                    if(Array.isArray(data.hasDataSpecification.reference.keys.key)){
                        var sdef = '';
                        for(var i=0;i<data.hasDataSpecification.reference.keys.key.length; i++){
                            sdef+=this.getElementEditParamTag({name:'', data:data.hasDataSpecification.reference.keys.key[i]}, 'ref');
                        }
                        rdef+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'reference['+(tag.childNodes.length-1)+']', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')">'},'other'), def:sdef},'array');
                    }else{
                        rdef+=this.getElementEditParamTag({name:'', data:data.hasDataSpecification.reference.keys.key}, 'ref');
                    }
                    def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'reference[0]', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')">'},'other'), def:rdef},'array');
                }
            }

            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'hasDataSpecification', tag:'<input type="button" value="Add Reference" onclick="aasx.appendEditReferenceTag(getElementParentTag(this,3), \'ref\')"/><input type="button" value="Delete last reference" onclick=""/>'},'other'), def:def},'array');

            tag+='<div class="aasx_tag_sub_title">'+cs('Identifiable Members')+'</div>';
            tag+=this.getElementEditParamTag({title:'idType', tag:this.getSelectTag('idType','idType',getXmlIdType(data.identification))},'other');
            tag+=this.getElementEditParamTag({title:'id', key:'id', value:getXmlText(data.identification)},'text');
            if(data.hasOwnProperty('administration')){
                tag+=this.getElementEditParamTag({title:'version', key:'version', value:getXmlText(data.administration.version)},'text');
                tag+=this.getElementEditParamTag({title:'revision', key:'revision', value:getXmlText(data.administration.revision)},'text');
            }else{
                tag+=this.getElementEditParamTag({title:'administration', tag:'<input type="button" value="Create data element!" onclick="getElementParentTag(this,2).style.display=\'none\';getElementParentTag(document.descForm.version,2).style.display=\'\';getElementParentTag(document.descForm.revision,2).style.display=\'\'"/>'},'other');
                tag+=this.getElementEditParamTag({title:'version', key:'version', style:'display:none;'},'text');
                tag+=this.getElementEditParamTag({title:'revision', key:'revision', style:'display:none;'},'text');
            }

            tag+='<div class="aasx_tag_sub_title">'+cs('Semantic ID')+'</div>';
            def = '';
            if(data.hasOwnProperty('semanticId')){
                if(Array.isArray(data.semanticId.keys.key)){
                    for(var i=0; i<data.semanticId.keys.key.length; i++){
                        def+=this.getElementEditParamTag({name:'', data:data.semanticId.keys.key[i]}, 'ref');
                    }
                }else{
                    def+=this.getElementEditParamTag({name:'', data:data.semanticId.keys.key}, 'ref');
                }
            }
            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'semanticId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:def},'array');

            tag+='<div class="aasx_tag_sub_title">'+cs('Kind')+'</div>';
            tag+=this.getElementEditParamTag({title:'kind', tag:this.getSelectTag('kind','kind', getXmlText(data.kind))},'other');

            //tag+='<div class="aasx_tag_content edit"><div class="aasx_tag_content_title">'+cs(obj.title!=null?obj.title+':':'')+'</div><div class="aasx_tag_content_value"><input type="button" value="Add Blank" onclick=""></div></div>';


            tag+='<div class="aasx_tag_sub_title">'+cs('Qualifier')+'</div>';

            def = '';
            if(data.hasOwnProperty('qualifier')){
                let qua = data.qualifier.qualifier;
                if(qua!=undefined){
                    if(Array.isArray(qua)){
                        for(var y=0; y<qua.length; y++){
                            var qdef = '';
                            var rdef = '';
                            if(qua[y].hasOwnProperty('semanticId')){
                                if(Array.isArray(qua[y].semanticId.keys.key)){
                                for(var i=0;i<qua[y].semanticId.keys.key.length; i++){
                                    rdef+=this.getElementEditParamTag({name:'', data:qua[y].semanticId.keys.key[i]}, 'ref');
                                }
                                }else{
                                    rdef+=this.getElementEditParamTag({name:'', data:qua[y].semanticId.keys.key}, 'ref');
                                }
                            }

                            qdef+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'semanticId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:rdef},'array');

                            qdef+=this.getElementEditParamTag({title:'type', key:'type', value:getXmlText(qua[y].qualifierType)},'text');
                            qdef+=this.getElementEditParamTag({title:'value', key:'value', value:getXmlText(qua[y].qualifierValue)},'text');

                            if(qua[y].hasOwnProperty('qualifierValueId')){
                                rdef = '';
                                if(Array.isArray(qua[y].qualifierValueId.keys.key)){
                                for(var i=0;i<qua[y].qualifierValueId.keys.key.length; i++){
                                    rdef+=this.getElementEditParamTag({name:'', data:qua[y].qualifierValueId.keys.key[i]}, 'ref');
                                }
                                }else{
                                    rdef+=this.getElementEditParamTag({name:'', data:qua[y].qualifierValueId.keys.key}, 'ref');
                                }
                            }
                            qdef+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'valueId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:rdef},'array');

                            def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'Qualifier 1', tag:'<input type="button" value="Delete" onclick="getElementParentTag(this,4).removeChild(getElementParentTag(this,3))"/>'},'other'), def:qdef},'array')
                        }
                    }else{
                        var qdef = '';
                        var rdef = '';
                        if(qua.hasOwnProperty('semanticId')){
                            if(Array.isArray(qua.semanticId.keys.key)){
                            for(var i=0;i<qua.semanticId.keys.key.length; i++){
                                rdef+=this.getElementEditParamTag({name:'', data:qua.semanticId.keys.key[i]}, 'ref');
                            }
                            }else{
                                rdef+=this.getElementEditParamTag({name:'', data:qua.semanticId.keys.key}, 'ref');
                            }
                        }

                        qdef+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'semanticId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:rdef},'array');

                        qdef+=this.getElementEditParamTag({title:'type', key:'type', value:getXmlText(qua.qualifierType)},'text');
                        qdef+=this.getElementEditParamTag({title:'value', key:'value', value:getXmlText(qua.qualifierValue)},'text');

                        if(qua.hasOwnProperty('qualifierValueId')){
                            rdef = '';
                            if(Array.isArray(qua.qualifierValueId.keys.key)){
                            for(var i=0;i<qua.qualifierValueId.keys.key.length; i++){
                                rdef+=this.getElementEditParamTag({name:'', data:qua.qualifierValueId.keys.key[i]}, 'ref');
                            }
                            }else{
                                rdef+=this.getElementEditParamTag({name:'', data:qua.qualifierValueId.keys.key}, 'ref');
                            }
                        }
                        qdef+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'valueId', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:rdef},'array');

                        def+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'Qualifier '+(y+1), tag:'<input type="button" value="Delete" onclick="getElementParentTag(this,4).removeChild(getElementParentTag(this,3))"/>'},'other'), def:qdef},'array')
                    }
                }

            }
            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'Qualifier entities', tag:'<input type="button" value="Add Blank" onclick="aasx.appendQualifierTag(getElementParentTag(this,3), \'ref\')"/><input type="button" value="Delete last reference" onclick=""/>'},'other'), def:def},'array');

            tag+='</form>'
        }
        else if(type == 'prop' || type == 'pfile'){
            //let data = this.getXmlSubModel(obj.id);
            //console.log(data);
            tag+='<form  name="descForm" id="propForm">';

            tag+='<div class="aasx_tag_title">'+cs('Property')+'</div>';
            if(type == 'prop')tag+=this.getElementEditParamTag({title:'valueType', tag:this.getSelectTag('valueType','dataType',getXmlText(obj.valueType))},'other');
            else if(type == 'pfile')tag+=this.getElementEditParamTag({title:'mimeType', tag:this.getSelectTag('mimeType','fileType', getXmlText(obj.mimeType))},'other');
            tag+=this.getElementEditParamTag({title:'value', key:'value', value:getXmlText(obj.value)},'text');

            tag+='<div class="aasx_tag_sub_title">'+cs('Semantic ID')+'</div>';
            tag+=this.getElementEditParamTag({title:'semanticId', tag:'<input type="button" value="Create data element!" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other');


            tag+='</form>'
        }
        else if(type == 'ref'){
            tag+='<div class="aasx_tag_title">'+cs('ReferenceElement')+'</div>';

            var rdef = '';
            if(obj.hasOwnProperty('value')){
                if(Array.isArray(obj.value.keys.key)){
                for(var i=0;i<obj.value.keys.key.length; i++){
                    rdef+=this.getElementEditParamTag({name:'', data:obj.value.keys.key[i]}, 'ref');
                }
                }else{
                    rdef+=this.getElementEditParamTag({name:'', data:obj.value.keys.key}, 'ref');
                }
            }

            tag+=this.getElementEditParamTag({title:'', tag:this.getElementEditParamTag({title:'value', tag:'<input type="button" value="Add Blank" onclick="aasx.appendEditReferenceChildTag(getElementParentTag(this,3), \'ref\')"/>'},'other'), def:rdef},'array');
        }
        else if(type == 'file'){
            tag+='<div class="aasx_tag_title">'+cs('Supplementary file for package of AASX')+'</div>';
            tag+=this.getElementEditParamTag({title:'Action', tag:'<input type="button" value="Delete" onclick=""/>'},'other');

            tag+='';
        }
        else if(type == 'file_new'){
            tag+='<div class="aasx_tag_title">'+cs('Environment of Asset Administration Shells')+'</div>';
            tag+='<div class="aasx_tag_sub_title">'+cs('Supplementary file to add')+'</div>';
            tag+='<form  name="uploadForm" id="uploadForm">';
            tag+=this.getElementEditParamTag({title:'Source Path', key:'file'},'file');
            tag+=this.getElementEditParamTag({title:'Target FileName', key:'fileNm'},'text');
            tag+=this.getElementEditParamTag({title:'Target Path', key:'filePath'},'text');
            tag+='<input type="hidden" name="aasxNm"/>';
            tag+=this.getElementEditParamTag({title:null, tag:'<input type="checkbox" value="thumbnail" onclick="Ext.getCmp(\'MainTreePanel\').test(document.uploadForm)"/>Embed as Thumbnail (only one file per package!)'},'other');
            tag+=this.getElementEditParamTag({title:null, tag:'<input type="button" value="Add file" onclick="Ext.getCmp(\'MainTreePanel\').test(document.uploadForm)"/>'},'other');

            tag+='';
            tag+='</form>'
        }

        tag+='</div>';
        return tag;
    }

    this.updateData = function(data){
        console.log(data);
    }

    this.createPropertyData = function(data){
        var obj = {};
        obj.category = {};

    }


};

function getElementParentTag(tag, deps){
    let pe = tag;
    for(var i=0; i<deps; i++){
        pe = pe.parentElement;
    }
    return pe;
}

function getKeys(x){
    return x!=undefined&&x.keys!=undefined&&x.keys.key!=undefined?(Array.isArray(x.keys.key)&&x.keys.key.length>0?x.keys.key[0]:x.keys.key):undefined;
}

function getXmlText(x, def){
    return x!=undefined&&x.__text!=undefined?x.__text:(def!=undefined?def:undefined);
}

function getXmlIdType(x){
    return x!=undefined&&x._idType!=undefined?x._idType:undefined;
}

function getXmlType(x){
    return x!=undefined&&x._type!=undefined?x._type:undefined;
}

function getXmlLocal(x){
    return x!=undefined&&x._local!=undefined?x._local:undefined;
}

function getXmlLang(x){
    return x!=undefined&&x._lang!=undefined?x._lang:undefined;
}