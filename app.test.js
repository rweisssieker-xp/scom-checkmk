const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Bäume und Komponenten anlegen, ändern und dauerhaft speichern',()=>{
 const elements={};const element=id=>elements[id]??={id,classList:{remove(){},toggle(){}},innerHTML:'',textContent:'',value:'',elements:{name:{focus(){}}},showModal(){},close(){},scrollIntoView(){}};
 const document={getElementById:element,querySelectorAll(){return []}};const store={};let values={};
 const context=vm.createContext({document,structuredClone,crypto:{randomUUID:(()=>{let n=0;return()=>`uuid-${++n}`})()},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v},FormData:class{constructor(){return Object.entries(values)}},confirm:()=>true,alert:()=>{},ServiceModel:require('./model.js'),ServiceBridge:require('./bridge.js'),ServiceViews:require('./views.js'),ServiceCatalog:require('./catalog.js')});
 vm.runInContext(fs.readFileSync('owl-examples.js','utf8'),context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
 element('newTree').onclick();values={name:'  Onlineshop  '};element('editorForm').onsubmit({preventDefault(){}});
 assert.equal(JSON.parse(store['service-atlas-v2']).trees.find(t=>t.name==='Onlineshop').name,'Onlineshop');
 element('newComponent').onclick();values={name:'api-01',group:'API',host:'api-01.example',type:'Service',source:'Checkmk',mode:'redundant'};element('editorForm').onsubmit({preventDefault(){}});
 let saved=JSON.parse(store['service-atlas-v2']);assert.equal(saved.trees.find(t=>t.name==='Onlineshop').components[0].state,'unknown');assert.match(element('tree').innerHTML,/api-01/);
 element('editComponent').onclick();values={...values,name:'api-02'};element('editorForm').onsubmit({preventDefault(){}});saved=JSON.parse(store['service-atlas-v2']);assert.equal(saved.trees.find(t=>t.name==='Onlineshop').components[0].name,'api-02');
 element('reset').onclick();assert.equal(JSON.parse(store['service-atlas-v2']).trees.find(t=>t.name==='Onlineshop').components.length,1);
});
test('simulierter SCOM-Quellzustand wird erst bei Synchronisation übernommen',()=>{
 const elements={};const el=id=>elements[id]??={classList:{remove(){},toggle(){}},innerHTML:'',textContent:'',value:'',elements:{name:{focus(){}}},showModal(){},close(){},scrollIntoView(){}};const store={};
 const ctx=vm.createContext({document:{getElementById:el,querySelectorAll(){return[]}},structuredClone,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v},alert(){},confirm:()=>true,ServiceModel:require('./model.js'),ServiceBridge:require('./bridge.js'),ServiceViews:require('./views.js'),ServiceCatalog:require('./catalog.js')});
 vm.runInContext(fs.readFileSync('owl-examples.js','utf8'),ctx);vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
 el('openBridge').onclick();el('bridgeObject').value='demo-meso-web';el('bridgeObject').onchange();el('bridgeState').value='Critical';el('bridgeState').onchange();
 let data=JSON.parse(store['service-atlas-v2']);let tree=data.trees.find(t=>t.id===data.activeId);assert.equal(tree.components.find(c=>c.host==='demo-meso-web').state,'ok');
 el('syncBridge').onclick();data=JSON.parse(store['service-atlas-v2']);tree=data.trees.find(t=>t.id===data.activeId);assert.equal(tree.components.find(c=>c.host==='demo-meso-web').state,'crit');assert.match(el('bridgeResult').textContent,/Synchronisiert: 17/);
});
