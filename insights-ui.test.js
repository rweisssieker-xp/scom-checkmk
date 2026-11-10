const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Zeitreise berücksichtigt eine fehlende Serviceaufnahme bei der Verfügbarkeit',()=>{
 const tree={id:'a',name:'Service',components:[{id:'x',name:'X',host:'x',source:'Checkmk',group:'A',mode:'required',state:'ok',catalogId:'known'}]};
 const store={'service-atlas-v2':JSON.stringify({trees:[tree],sharedCatalog:[{id:'known'}]}),'service-atlas-history-v1':JSON.stringify([{kind:'observed',at:0,states:{a:'ok'}},{kind:'observed',at:60000,states:{}},{kind:'observed',at:120000,states:{a:'crit'}},{kind:'observed',at:180000,states:{a:'ok'}}])};
 const els={};const el=id=>els[id]??={innerHTML:'',value:id==='historyKind'?'observed':'',textContent:'',checked:false,elements:Object.fromEntries(['purpose','team','contact','hours','criticality','target','runbook'].map(x=>[x,{value:''}]))};
 const context=vm.createContext({document:{getElementById:el},window:{addEventListener(){},setInterval(){}},localStorage:{getItem:k=>store[k]||null,setItem(k,v){store[k]=v}},ServiceModel:require('./model'),ServiceInsights:require('./insights-model'),owlExamples:[],structuredClone});
 vm.runInContext(fs.readFileSync('insights-ui.js','utf8'),context);assert.match(el('slaResult').innerHTML,/50\.00 %/);assert.match(el('slaResult').innerHTML,/Abdeckung 66\.7 %/);assert.match(el('slaResult').innerHTML,/4 Aufnahmen/);assert.match(el('slaResult').innerHTML,/Datenlücke/);assert.match(el('historyPoint').innerHTML,/UNKNOWN/);assert.match(el('patternResult').innerHTML,/höchstens fünf Minuten/);
});
