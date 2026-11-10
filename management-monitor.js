(function(root){
 function buildMonitorView(workspace,sample){
  const trees=structuredClone(workspace?.data?.trees||[]),matching=sample&&sample.workspaceRevision===workspace.revision;
  for(const tree of trees)for(const c of tree.components){if(!c.liveRef)continue;const records=matching?(sample.components?.[tree.id]||[]).filter(x=>x.id===c.id):[];const record=records.length===1?records[0]:null;c.state=record?.raw||'unknown';c.observedAt=record?.observedAt||null}
  return {trees,matching:!!matching};
 }
 const api={buildMonitorView};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ManagementMonitor=api;
})(globalThis);
