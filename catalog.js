(function(root){
 const fields=['name','host','source','type','state','liveRef','observedAt'];
 function bootstrap(catalog,trees,makeId){const known=new Map(catalog.map(x=>[x.id,x]));for(const tree of trees)for(const c of tree.components){if(c.catalogId&&known.has(c.catalogId)){Object.assign(c,pick(known.get(c.catalogId)));continue}const entry={id:makeId(),...pick(c)};catalog.push(entry);known.set(entry.id,entry);c.catalogId=entry.id}}
 function pick(c){return Object.fromEntries(fields.map(k=>[k,c[k]]))}
 function update(catalog,trees,id,changes){const entry=catalog.find(x=>x.id===id);if(!entry)throw Error('Katalogkomponente nicht gefunden');for(const k of fields)if(Object.hasOwn(changes,k))entry[k]=changes[k];for(const tree of trees)for(const c of tree.components)if(c.catalogId===id)Object.assign(c,pick(entry));return entry}
 const api={bootstrap,update};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ServiceCatalog=api;
})(globalThis);
