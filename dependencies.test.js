const test=require('node:test'),assert=require('node:assert/strict'),m=require('./model.js');
const tree=()=>({components:[{id:'db',name:'Datenbank',dependsOn:['vm']},{id:'vm',name:'VM',dependsOn:['hv']},{id:'hv',name:'Hypervisor',dependsOn:['st']},{id:'st',name:'Storage'}]});
test('Abhängigkeiten bilden einen gerichteten Pfad',()=>{assert.deepEqual(m.dependencyPaths(tree()).map(p=>p.map(x=>x.id)),[['db','vm','hv','st']])});
test('Zyklen, Selbstbezüge und unbekannte Ziele werden abgelehnt',()=>{let t=tree();assert.ok(m.validateDependencies(t,'st',['db']));assert.ok(m.validateDependencies(t,'db',['db']));assert.ok(m.validateDependencies(t,'db',['missing']));assert.equal(m.validateDependencies(t,'db',['vm']),null)});
test('Löschen entfernt eingehende Abhängigkeiten',()=>{let t=tree();m.removeComponent(t,'vm');assert.equal(t.components.find(c=>c.id==='db').dependsOn.length,0);assert.equal(t.components.some(c=>c.id==='vm'),false)});
