'use strict';
const model=require('./model'),bridge=require('./bridge'),live=require('./live-adapters');
class MonitorWorker {
 constructor(store,adapters={SCOM:()=>live.fetchScom(process.env),Checkmk:()=>live.fetchCheckmk(process.env)}){this.store=store;this.adapters=adapters;this.busy=false;this.timer=null}
 async tick(){if(this.busy)return;this.busy=true;try{
  const workspace=this.store.read();if(!workspace.data)return;
  const trees=structuredClone(workspace.data.trees),sources=[...new Set(trees.flatMap(t=>t.components.filter(c=>c.liveRef).map(c=>c.liveRef.source)))];
  const sourceStatus={},results={};await Promise.all(sources.map(async source=>{try{if(typeof this.adapters[source]!=='function')throw Error();const rows=await this.adapters[source]();if(!Array.isArray(rows))throw Error();results[source]=rows;sourceStatus[source]='ok'}catch{results[source]=[];sourceStatus[source]='error'}}));
  const at=Date.now(),states={},components={};for(const tree of trees){for(const c of tree.components){if(!c.liveRef)continue;const matches=(results[c.liveRef.source]||[]).filter(r=>r.id===c.liveRef.id);c.state=matches.length===1?bridge.normalize(c.liveRef.source,matches[0].rawState):'unknown';c.observedAt=matches.length===1?new Date(at).toISOString():null}states[tree.id]=model.treeState(tree);const rolls=model.rollup(tree);components[tree.id]=tree.components.map(c=>({id:c.id,name:c.name,group:c.group,host:c.host,source:c.source,mode:c.mode,minHealthy:c.minHealthy,liveRef:c.liveRef,observedAt:c.observedAt,raw:rolls.get(c.id)?.raw||'unknown',effective:rolls.get(c.id)?.effective||'unknown',dependsOn:[...(c.dependsOn||[])],dependencyPolicy:{...(c.dependencyPolicy||{})}}))}
  this.store.appendSample({kind:'server',at,workspaceRevision:workspace.revision,sourceStatus,states,components});
 }finally{this.busy=false}}
 start(interval=60000){if(this.timer)return;this.tick().catch(()=>{});this.timer=setInterval(()=>this.tick().catch(()=>{}),interval);this.timer.unref()}
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null}
}
module.exports={MonitorWorker};
