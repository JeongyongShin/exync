#! /usr/bin/env python

import sys
sys.path.insert(0, ".")
sys.path.insert(1, "..")

import os
import argparse
import xmlschema
import asyncio
import xmltodict
import json

import xml.etree.ElementTree as ET

from asyncua import ua, Server
from asyncua.common.instantiate_util import instantiate
from asyncua.common.xmlexporter import XmlExporter


class AAS2OPCUA:
    def __init__(self, aas_file):
        print('>>> init()')

        self.aas_file = aas_file
        self.opcua_file = 'generated/nodeset.xml'
        self.aas_schema = 'AAS.xsd'

        self.end_point = 'opc.tcp://0.0.0.0:4840/freeopcua/server/'

        self.doc = None
        self.root = None
        self.shells = None
        self.assets = None
        self.submodels = None
        self.descriptions = None

        self.server = None

        self.shell_info_list = []
        self.sm_info_list = []
        self.node_list = []
        self.aas_ref_list = []
        
        self.aasvar_list = []

    def create_opcua_server(self):
        print('>>> create_opcua_server()')

        self.server = Server()
        self.server.init()
        self.server.set_endpoint(self.end_point)

        return True


    def export_opcua_model(self):
        print('>>> export_opcua_model()')

        exporter = XmlExporter(self.server)
        exporter.build_etree(self.node_list, ['http://myua.org/test/'])
        exporter.write_xml(self.opcua_file)

        return True

    def write_engineering_csv(self):
        print('>>> write_engineering.csv()')

        with open('./generated/engineering.csv', mode='wt', encoding='utf-8') as f:
            for aasvar in self.aasvar_list:
                f.write(aasvar + ', , , , 50, -1\n')


		
		
    def add_namespaces(self):
        print('>>> add_namespaces()')

        for shell_info in self.shell_info_list:
            shell_info['ns_index'] = self.server.register_namespace(shell_info['ns_uri'])
            print('namespace[%d] = \'ns:%s\'' % (shell_info['ns_index'], shell_info['ns_uri']))

        return True


    def add_variables(self):
        print('>>> add_variables()')

        shell_ns = self.shell_info_list[0]
        myobj = self.server.nodes.objects.add_object(shell_ns['ns_index'], "MyObject")
        self.node_list.append(myobj)

        shell_ns = self.shell_info_list[1]
        myvar = myobj.add_variable(shell_ns['ns_index'], "MyVariable", 6.7)
        myvar.set_writable()    # Set MyVariable to be writable by clients
        self.node_list.append(myvar)

        dev = self.server.nodes.base_object_type.add_object_type(0, "MyDevice")
        dev.add_variable(0, "sensor1", 1.0)
        mydevice = instantiate(self.server.nodes.objects, dev, bname="2:Device0001")
        self.node_list.append(dev)

        return True


    def load_aas(self):
        print('>>> load_aas(): %s' % (self.aas_file))

        if not os.path.exists(self.aas_file):
            print('%s does not exist!' % (self.aas_file))
            return False
 
        '''
        aas_xsd = xmlschema.XMLSchema(self.aas_schema)
        if aas_xsd.is_valid(self.aas_file) == False:
            print('aas[%s] has invalide schema format' % (self.aas_file))
            return False
        '''

        self.doc = ET.parse(self.aas_file)
        self.root = self.doc.getroot()
        for child in self.root:
            if child.tag.endswith('assetAdministrationShells'):
                self.shells = child
                print('shell')
            elif child.tag.endswith('assets'):
                self.assets = child
                print('asset')
            elif child.tag.endswith('submodels'):
                self.submodels = child
                print('submodes')
            elif child.tag.endswith('conceptDescriptions'):
                self.descriptions = None
                print('descriptions')

        return True

  
 

    def add_opcua_object(self, parent_object, ns_index, tag_name, browse_name, ref_only):
        if ref_only == 1:
            return None

        opcua_object = None

        if parent_object == None:
            opcua_object = self.server.nodes.objects.add_object("ns=%d;s=%s"%(ns_index, tag_name), browse_name)
        else:
            opcua_object = parent_object.add_object("ns=%d;s=%s"%(ns_index, tag_name), browse_name)

        self.node_list.append(opcua_object)
        return opcua_object

    def add_opcua_variable(self, parent_object, ns_index, tag_name, browse_name, value_type, value, ref_only):
        if ref_only == 1:
            return None

        opcua_variable = None

        if parent_object == None:
            return None

        variant_type = None
        data_type = None

        if value_type.lower() == 'string':
            data_type = ua.NodeId(ua.ObjectIds.String)
            variant_type = ua.VariantType.String
        elif value_type.lower() == 'langstring':
            data_type = ua.NodeId(ua.ObjectIds.QualifiedName)
            variant_type = ua.VariantType.QualifiedName
        elif value_type.lower() == 'datetime':
            data_type = ua.NodeId(ua.ObjectIds.DateTime)
            variant_type = ua.VariantType.DateTime
        elif value_type.lower() == 'float':
            data_type = ua.NodeId(ua.ObjectIds.Float)
            variant_type = ua.VariantType.Float
        elif value_type.lower() == 'double':
            data_type = ua.NodeId(ua.ObjectIds.Double)
            variant_type = ua.VariantType.Double
        elif value_type.lower() == 'boolean':
            data_type = ua.NodeId(ua.ObjectIds.Boolean)
            variant_type = ua.VariantType.Boolean
        elif value_type.lower() == 'decimal':
            print('warning: data type decimal is mapped to uint64 for ' + tag_name)
            data_type = ua.NodeId(ua.ObjectIds.UInt64)
            variant_type = ua.VariantType.UInt64
        elif value_type.lower() == 'integer' or value_type.lower() == 'int' or value_type.lower() == 'negativeinteger' or value_type.lower() == 'nonpositiveinteger':
            data_type = ua.NodeId(ua.ObjectIds.Int32)
            variant_type = ua.VariantType.Int32
        elif value_type.lower() == 'long':
            data_type = ua.NodeId(ua.ObjectIds.Int64)
            variant_type = ua.VariantType.Int64
        elif value_type.lower() == 'unsignedlong':
            data_type = ua.NodeId(ua.ObjectIds.UInt64)
            variant_type = ua.VariantType.Uint64
        elif value_type.lower() == 'short':
            data_type = ua.NodeId(ua.ObjectIds.Int16)
            variant_type = ua.VariantType.Int16
        elif value_type.lower() == 'byte' or value_type.lower() == 'unsignedbyte':
            data_type = ua.NodeId(ua.ObjectIds.Byte)
            variant_type = ua.VariantType.Byte
        elif value_type.lower() == 'nonnegativeinteger' or value_type.lower() == 'positiveinteger':
            data_type = ua.NodeId(ua.ObjectIds.UInt32)
            variant_type = ua.VariantType.UInt32
        elif value_type.lower() == 'unsignedshort':
            data_type = ua.NodeId(ua.ObjectIds.UInt16)
            variant_type = ua.VariantType.Uint16
        else:
            print('error: unsupported data-type for property: ' + tag_name)

        opcua_variable = parent_object.add_variable("ns=%d;s=%s"%(ns_index, tag_name), browse_name, value, variant_type, data_type)
        self.node_list.append(opcua_variable)
        return opcua_variable



    def parse_reference(self, shell_info, element, parent_tag, parent_object, ref_only):
        item_ref = {}
        for ref_elem in element:
            if ref_elem.tag.endswith('idShort'):
                item_ref['idShort'] = ref_elem.text
            elif ref_elem.tag.endswith('value'):
                for ref_value in ref_elem:
                    if ref_value.tag.endswith('keys'):
                        for ref_target in ref_value:
                            if ref_target.tag.endswith('key'):
                                if ref_target.attrib['type'] == 'AssetAdministrationShell':
                                    item_ref['target'] = ref_target.text
    

        if 'idShort' in item_ref and 'target' in item_ref:
            print('  reference: ' + parent_tag + '.' + item_ref['idShort'] + ' --> ' + item_ref['target'])

            if ref_only == 1:
                item_ref['aas_identification']  = shell_info['identification']
                item_ref['parent_tag']          = parent_tag
                self.aas_ref_list.append(item_ref)



    def parse_property(self, shell_info, element, parent_tag, parent_object, ref_only):
        item_property = {}
        for property_elem in element:
            if property_elem.tag.endswith('idShort'):
                item_property['idShort'] = property_elem.text
            elif property_elem.tag.endswith('valueType'):
                item_property['valueType'] = property_elem.text
            elif property_elem.tag.endswith('value'):
                item_property['value'] = property_elem.text

        if 'idShort' in item_property and 'valueType' in item_property:
            print('  property: ' + parent_tag + '.' + item_property['idShort'])
            ns_index = shell_info['ns_index']
            tag_name = parent_tag + '.' + item_property['idShort']
            browse_name = '%d:%s'%(ns_index, item_property['idShort'])
            self.add_opcua_variable(parent_object, ns_index, tag_name, browse_name, item_property['valueType'], item_property['value'], ref_only)
            if ref_only == 0:
                self.aasvar_list.append("ns=%d;s=%s"%(ns_index, tag_name))


    def parse_collection(self, shell_info, element, parent_tag, parent_object, ref_only):
        item_collection = {}
        for coll_elem in element:
            if coll_elem.tag.endswith('idShort'):
                item_collection['idShort'] = coll_elem.text

        if 'idShort' in item_collection:
            print('  collection: ' + item_collection['idShort'])

            ns_index = shell_info['ns_index']
            tag_name = parent_tag + '.' + item_collection['idShort']
            browse_name = '%d:%s'%(ns_index, item_collection['idShort'])
            new_object = self.add_opcua_object(parent_object, ns_index, tag_name, browse_name, ref_only)

            for coll_elem in element:
                if coll_elem.tag.endswith('value'):
                    
                    for sm_elem in coll_elem:
                        if sm_elem.tag.endswith('submodelElement'):
                            for sm_elem_item in sm_elem:
                                if sm_elem_item.tag.endswith('submodelElementCollection'):
                                    self.parse_collection(shell_info, sm_elem_item, tag_name, new_object, ref_only)
                                elif sm_elem_item.tag.endswith('property'):
                                    self.parse_property(shell_info, sm_elem_item, tag_name, new_object, ref_only)
                                elif sm_elem_item.tag.endswith('referenceElement'):
                                    self.parse_reference(shell_info, sm_elem_item, tag_name, new_object, ref_only)


    def parse_sm_elements(self, parent_object, shell_info, sm_elements, parent_tag, ref_only):
        for sm_elem in sm_elements:
            if sm_elem.tag.endswith('submodelElement'):
                #print('smElement: ' + sm_elem.tag)
                for sm_elem_item in sm_elem:
                    if sm_elem_item.tag.endswith('submodelElementCollection'):
                        self.parse_collection(shell_info, sm_elem_item, parent_tag, parent_object, ref_only)
                    elif sm_elem_item.tag.endswith('property'):
                        self.parse_property(shell_info, sm_elem_item, parent_tag, parent_object, ref_only)
                    elif sm_elem_item.tag.endswith('referenceElement'):
                        self.parse_reference(shell_info, sm_elem_item, parent_tag, parent_object, ref_only)


    def parse_sm(self, parent_object, shell_info, sm, parent_tag, ref_only):
        #print('>>> parse_sm()')

        #if self.submodels == None:
        #    return False

        #for sm in self.submodels:
        #    print(sm)


        sm_info = {} #submodel
        sm_info['aas'] = shell_info

        for sm_elem in sm:
            if sm_elem.tag.endswith('identification'):
                sm_info['identification'] = sm_elem.text
            
            elif sm_elem.tag.endswith('idShort'):
                sm_info['idShort'] = sm_elem.text
                sm_info['tagName'] = shell_info['idShort'] + '.' + sm_info['idShort']


        if 'identification' in sm_info and 'idShort' in sm_info:
            ns_index = shell_info['ns_index']
            tag_name = parent_tag + '.' + sm_info['idShort']
            browse_name = '%d:%s'%(ns_index, sm_info['idShort'])
            
            sm_info['object_sm'] = self.add_opcua_object(parent_object, ns_index, tag_name, browse_name, ref_only)

            #sm_info['object_sm'] = self.server.nodes.objects.add_object(shell_info['ns_index'], sm_info['tagName'])
            #self.node_list.append(sm_info['object_sm'])


            for sm_elements in sm:
                if sm_elements.tag.endswith('submodelElements'):
                    #print('parsing submodelElements: ' + sm_info['tagName'] + '(' + sm_info['identification'] + ')')
                    self.parse_sm_elements(sm_info['object_sm'], shell_info, sm_elements, tag_name, ref_only)

        return True


    def parse_sm_refs(self, shell_info, sm_refs, ref_only):

        shell_info['sm_id_list'] = []

        for sm_ref in sm_refs:
            shell_info['sm_list'] = []
            for sm_ref_elem in sm_ref:
                if sm_ref_elem.tag.endswith('keys'):
                    for key in sm_ref_elem:
                        shell_info['sm_id_list'].append(key.text)


    def parse_aas(self, ref_only):
        print('\r\n\r\nparse_aas()---------------------------------------------')

        if self.shells == None:
            return False

        del self.shell_info_list[:]
        del self.sm_info_list[:]
        del self.node_list[:]

        print(self.shells)
 
        #add open62541 default namespace

        #vnid = self.server.register_namespace('urn:open62541.server.application')
        #self.add_opcua_object(None, vnid, 'vNS', '%d:%s'%(vnid, 'vNS'), ref_only)

        for shell in self.shells:
            shell_info = {} # AAS

            for shell_elem in shell:
                if shell_elem.tag.endswith('idShort'):
                    shell_info['idShort'] = shell_elem.text
                elif shell_elem.tag.endswith('identification'):
                    shell_info['identification'] = shell_elem.text
                elif shell_elem.tag.endswith('submodelRefs'):
                    self.parse_sm_refs(shell_info, shell_elem, ref_only)


            if 'idShort' in shell_info and 'identification' in shell_info:

                #shell_info['ns_index'] = self.server.register_namespace(shell_info['identification'])
                #self.shell_info_list.append(shell_info)

                if ref_only == 0:
                    for aas_ref in self.aas_ref_list:
                        if aas_ref['target'] == shell_info['identification']:
                            #print(' AAS \'%s\' --> \'%s.%s\''%(shell_info['idShort'], aas_ref['idShort'], shell_info['idShort']))
                            #print('  linked-AAS: aas-ref-parent-tag: %s, aas-ref-id:%s, cur-shell-id:%s'%(aas_ref['parent_tag'], aas_ref['idShort'], shell_info['idShort']))
                            shell_info['idShort'] = '%s.%s.%s'%(aas_ref['parent_tag'], aas_ref['idShort'], shell_info['idShort'])
                            #print('  linked-AAS: finally: ' + shell_info['idShort'])
                            break

                #shell_info['browse_name'] =  '%d:%s'%(shell_info['ns_index'], shell_info['idShort'])

                #shell_info['object_aas'] = self.add_opcua_object(None, shell_info['ns_index'], shell_info['idShort'], shell_info['browse_name'], ref_only)

                #shell_info['object_aas'] = self.server.nodes.objects.add_object(shell_info['ns_index'], shell_info['idShort'])
                #self.node_list.append(shell_info['object_aas'])

                print('AAS : ' + shell_info['idShort'] + ' (' + shell_info['identification'] + ')')

                if 'sm_id_list' in shell_info:
                    for sm_id in shell_info['sm_id_list']:

                        try:

                            # search xml position for submodel
                            aas_sm_elem = None
                            for sm in self.submodels:
                                for sm_elem in sm:
                                    if sm_elem.tag.endswith('identification') and sm_elem.text == sm_id:
                                        aas_sm_elem = sm
                                        break

                            # parsing & add
                            if aas_sm_elem != None:
                                parent_tag = shell_info['idShort']
                                self.parse_sm(shell_info['object_aas'], shell_info, aas_sm_elem, parent_tag, ref_only)

                        except Exception as e:
                            print(e)

            self.shell_info_list.append(shell_info)

        if ref_only == 1:
            for aas_ref in self.aas_ref_list:

                searching_aas_ref = aas_ref
                linked_again = True

                while linked_again == True:
                    linked_again = False
                    for other_aas_ref in self.aas_ref_list:
                        if other_aas_ref['target'] == searching_aas_ref['aas_identification']:
                            linked_again = True
                            aas_ref['parent_tag'] = '%s.%s.%s'%(other_aas_ref['parent_tag'], other_aas_ref['idShort'], aas_ref['parent_tag'])
                            searching_aas_ref = other_aas_ref
                            break

                    if linked_again == False:
                        break


        return True


    def convert_model(self):
        print('convert_model()')

        #self.create_opcua_server()
        self.load_aas()
        #self.parse_sm()
        self.parse_aas(1)
        self.parse_aas(0)
        #self.add_namespaces()
        #self.add_variables()
        #self.export_opcua_model()
        #self.write_engineering_csv()

        return True

    def findTag(self):
        print('convert_model()')

        #self.create_opcua_server()
        self.load_aas()
        #self.parse_sm()
        self.parse_aas(1)
        self.parse_aas(0)
        #self.add_namespaces()
        #self.add_variables()
        #self.export_opcua_model()
        #self.write_engineering_csv()

        return True


# def main():
#     parser = argparse.ArgumentParser()
#     parser.add_argument('--aas')
#     #parser.add_argument('--opcua')
#     args = parser.parse_args()
#     print(args)
#
#     if args.aas == None:
#         print('usage: main.py [-h] [--aas AAS]')
#         exit()
#
#     modeler = AAS2OPCUA(args.aas)
#     modeler.convert_model()
#
# if __name__ == '__main__':
#     asyncio.run(main())

