'use strict';
// Local read-only bridge. Credentials never leave this process.
const http=require('node:http');
const {fetchCheckmk,fetchScom}=require('./live-adapters');
const port=8766,allowedOrigin='http://127.0.0.1:8765';
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin'});res.end(JSON.stringify(data))}
function createServer(adapters={fetchCheckmk,fetchScom},env=process.env){return http.createServer(async(req,res)=>{
 if(req.headers.host!==`127.0.0.1:${port}`||req.headers.origin!==allowedOrigin){send(res,403,{error:'Zugriff verweigert.'});return}
 if(req.method!=='GET'){send(res,405,{error:'Nur lesender Zugriff ist erlaubt.'});return}
 const handler=req.url==='/api/live/checkmk'?adapters.fetchCheckmk:req.url==='/api/live/scom'?adapters.fetchScom:null;
 if(!handler){send(res,404,{error:'Nicht gefunden.'});return}
 try{const records=await handler(env);send(res,200,{source:req.url.endsWith('scom')?'SCOM':'Checkmk',observedAt:new Date().toISOString(),records})}catch(e){const allowed=/^(Checkmk ist nicht konfiguriert\.|SCOM ist nicht konfiguriert\.|Checkmk benötigt eine HTTPS-Site-URL ohne Zugangsdaten\.|Ungültiger SCOM-Servername\.|Checkmk-Abfrage fehlgeschlagen \(HTTP \d+\)\.|Unerwartetes (Checkmk|SCOM)-Antwortformat\.|Checkmk-Antwort enthält .+\.|Ungültige oder doppelte SCOM-Objektkennung\.)$/;send(res,503,{error:allowed.test(e.message)?e.message:'Abfrage fehlgeschlagen. Verbindung, Berechtigungen und Installation prüfen.'})}
 });}
if(require.main===module)createServer().listen(port,'127.0.0.1',()=>console.log(`Service Atlas Live Bridge: http://127.0.0.1:${port} (nur lokal)`));
module.exports={createServer};
