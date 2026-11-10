(function(root){
 const rank=['crit','unknown','warn','ok'];
 function worst(states){return states.length ? rank.find(s=>states.includes(s)) || 'unknown' : 'unknown'}
 function rollup(tree){const byId=new Map(tree.components.map(c=>[c.id,c])), result=new Map();
  function visit(id,active){if(result.has(id))return result.get(id);const c=byId.get(id);if(!c||active.has(id))return {effective:'unknown',raw:'unknown'};const next=new Set(active);next.add(id);const observed=Date.parse(c.observedAt),fresh=!c.liveRef||(Number.isFinite(observed)&&Date.now()-observed>=0&&Date.now()-observed<180000);const raw=fresh&&rank.includes(c.state)?c.state:'unknown';const dependencies=Array.isArray(c.dependsOn)?c.dependsOn:[];const states=dependencies.filter(dep=>c.dependencyPolicy?.[dep]!=='optional').map(dep=>visit(dep,next).effective);const value={raw,effective:worst([raw,...states])};result.set(id,value);return value}
  for(const c of tree.components)visit(c.id,new Set());return result;
 }
 function groupState(components,results){if(!components.length)return 'unknown';const states=components.map(c=>(c.id!=null?results?.get(c.id)?.effective:null)||c.state||'unknown');if(components[0].mode!=='redundant')return worst(states);const min=Number(components[0].minHealthy||1);if(!Number.isInteger(min)||min<1||min>states.length)return 'unknown';const known=states.filter(s=>s==='ok'||s==='warn').length,unknown=states.filter(s=>s==='unknown').length;if(known+unknown<min)return 'crit';if(unknown>0)return 'unknown';return states.every(s=>s==='ok')?'ok':'warn'}
 function treeState(tree){const groups=new Map(),results=rollup(tree);for(const c of tree.components){if(!groups.has(c.group))groups.set(c.group,[]);groups.get(c.group).push(c)}return worst([...groups.values()].filter(g=>g[0].mode!=='informational').map(g=>groupState(g,results)))}
 function validateDependencies(tree,componentId,dependencies){
  const byId=new Map(tree.components.map(c=>[c.id,c]));if(dependencies.some(id=>id===componentId))return 'Eine Komponente kann nicht von sich selbst abhängen.';if(dependencies.some(id=>!byId.has(id)))return 'Eine ausgewählte Abhängigkeit existiert nicht mehr.';
  function reaches(id,seen){if(id===componentId)return true;if(seen.has(id))return false;seen.add(id);return (byId.get(id)?.dependsOn||[]).some(next=>reaches(next,seen))}
  return dependencies.some(id=>reaches(id,new Set()))?'Diese Abhängigkeit würde einen Kreis erzeugen.':null;
 }
 function dependencyPaths(tree){const byId=new Map(tree.components.map(c=>[c.id,c]));const sources=tree.components.filter(c=>(c.dependsOn||[]).some(id=>byId.has(id)));const targets=new Set(sources.flatMap(c=>c.dependsOn||[]));const roots=sources.filter(c=>!targets.has(c.id));const result=[];function walk(c,path){if(result.length>=200||path.includes(c))return;const next=(c.dependsOn||[]).map(id=>byId.get(id)).filter(Boolean);const current=[...path,c];if(!next.length){if(current.length>1)result.push(current);return}for(const n of next)walk(n,current)}for(const c of roots)walk(c,[]);return result}
 function removeComponent(tree,id){tree.components=tree.components.filter(c=>c.id!==id);for(const c of tree.components)if(Array.isArray(c.dependsOn)){c.dependsOn=c.dependsOn.filter(x=>x!==id);if(c.dependencyPolicy)delete c.dependencyPolicy[id]}}
 const api={worst,rollup,groupState,treeState,validateDependencies,dependencyPaths,removeComponent};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ServiceModel=api;
})(globalThis);
