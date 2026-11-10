'use strict';
const http=require('node:http'),path=require('node:path'),fs=require('node:fs');
const {WorkspaceStore}=require('./workspace-store');
const origin='http://127.0.0.1:8765',port=8767,maxBytes=4*1024*1024;
function reply(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, PUT, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'});res.end(value===null?'':JSON.stringify(value))}
function createWorkspaceServer(store){return http.createServer((req,res)=>{
 if(req.headers.host!==`127.0.0.1:${port}`||req.headers.origin!==origin){reply(res,403,{error:'Zugriff verweigert.'});return}
 if(req.method==='OPTIONS'){reply(res,204,null);return}
 if(req.method==='GET'&&req.url==='/api/workspace'){reply(res,200,store.read());return}
 if(req.method==='GET'&&req.url==='/api/history'){reply(res,200,{entries:store.history()});return}
 if(req.method==='GET'&&req.url==='/api/monitoring'){reply(res,200,{samples:store.monitorSamples(),revision:store.read().revision});return}
 if(req.method!=='PUT'||req.url!=='/api/workspace'){reply(res,404,{error:'Nicht gefunden.'});return}
 if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')){reply(res,415,{error:'JSON erforderlich.'});req.resume();return}
 let parts=[],size=0,tooLarge=false;req.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){tooLarge=true;parts=[]}else if(!tooLarge)parts.push(chunk)});req.on('end',()=>{if(tooLarge){reply(res,413,{error:'Arbeitsbereich zu groß.'});return}let body;try{body=JSON.parse(Buffer.concat(parts).toString('utf8'))}catch{reply(res,400,{error:'Ungültiges JSON.'});return}try{reply(res,200,store.write(body.revision,body.data))}catch(e){reply(res,e.code==='REVISION_CONFLICT'?409:400,{error:e.code==='REVISION_CONFLICT'?'Versionskonflikt: Bitte zuerst den gemeinsamen Stand prüfen.':'Arbeitsbereich konnte nicht gespeichert werden.'})}});
 })}
if(require.main===module){const dir=path.join(process.env.LOCALAPPDATA||process.env.HOME||process.cwd(),'ServiceAtlas');fs.mkdirSync(dir,{recursive:true});const store=new WorkspaceStore(path.join(dir,'workspace.sqlite'));const {MonitorWorker}=require('./monitor-worker');const worker=new MonitorWorker(store);createWorkspaceServer(store).listen(port,'127.0.0.1',()=>{worker.start();console.log(`Gemeinsamer lokaler Arbeitsbereich: 127.0.0.1:${port}`)})}
module.exports={createWorkspaceServer};
