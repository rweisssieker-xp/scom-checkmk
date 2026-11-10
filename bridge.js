(function(root){
 function normalize(source,state){if(source==='SCOM')return ({healthy:'ok',warning:'warn',critical:'crit',notmonitored:'unknown',unknown:'unknown'}[String(state).replace(/\s/g,'').toLowerCase()]||'unknown');if(source==='Checkmk')return ({0:'ok',1:'warn',2:'crit',3:'unknown'}[String(state)]||'unknown');return 'unknown'}
 function synchronize(tree,records){let matched=0,missing=0,ambiguous=0;for(const c of tree.components){const matches=records.filter(r=>r.source===c.source&&r.objectId===c.host);if(matches.length===1){c.state=normalize(c.source,matches[0].rawState);matched++}else{c.state='unknown';if(matches.length)ambiguous++;else missing++}}return {matched,missing,ambiguous}}
 const api={normalize,synchronize};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ServiceBridge=api;
})(globalThis);
