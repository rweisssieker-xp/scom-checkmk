'use strict';
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const path=require('node:path');
const execFileAsync=promisify(execFile);

function checkmkConfig(env){
 const {CHECKMK_SITE_URL:url,CHECKMK_USERNAME:username,CHECKMK_SECRET:secret}=env;
 if(!url||!username||!secret)throw new Error('Checkmk ist nicht konfiguriert.');
 const site=new URL(url);if(site.protocol!=='https:'||site.username||site.password||site.search||site.hash)throw new Error('Checkmk benötigt eine HTTPS-Site-URL ohne Zugangsdaten.');
 site.pathname=site.pathname.replace(/\/+$/,'')+'/check_mk/api/1.0/';return {base:site,username,secret};
}
async function fetchCheckmk(env,fetchFn=fetch){
 const {base,username,secret}=checkmkConfig(env);
 const response=await fetchFn(new URL('domain-types/service/collections/all',base),{method:'POST',headers:{Authorization:`Bearer ${username} ${secret}`,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({columns:['host_name','description','state','last_check'] }),redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error(`Checkmk-Abfrage fehlgeschlagen (HTTP ${response.status}).`);
 const json=await response.json();if(!Array.isArray(json.value))throw new Error('Unerwartetes Checkmk-Antwortformat.');
 const records=json.value.map(row=>{const x=row.extensions||row;return {source:'Checkmk',id:JSON.stringify([x.site||'',x.host_name,x.description]),name:x.description,host:x.host_name,site:x.site||'',rawState:x.state,lastCheck:x.last_check}});
 if(records.some(r=>typeof r.host!=='string'||!r.host||typeof r.name!=='string'||!r.name||![0,1,2,3].includes(r.rawState)))throw new Error('Checkmk-Antwort enthält ungültige Monitoring-Daten.');
 const seen=new Set();for(const r of records){if(seen.has(r.id))throw new Error('Checkmk-Antwort enthält mehrdeutige Servicekennungen.');seen.add(r.id)}return records;
}
async function fetchScom(env,run=execFileAsync){
 let args;
 if(env.SCOM_WEB_URL){let url;try{url=new URL(env.SCOM_WEB_URL)}catch{throw new Error('Ungültige SCOM-Webkonsolen-URL.')}if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname.replace(/\/+$/,'').toLowerCase()!=='/operationsmanager')throw new Error('SCOM benötigt eine HTTPS-Webkonsolen-URL ohne Zugangsdaten.');if(!env.SCOM_USERNAME||!env.SCOM_PASSWORD)throw new Error('SCOM REST-Zugang ist nicht konfiguriert.');args=['-File',path.join(__dirname,'scom-rest-read.ps1'),'-WebUrl',url.href.replace(/\/+$/,'')];}
 else{if(!env.SCOM_MANAGEMENT_SERVER)throw new Error('SCOM ist nicht konfiguriert.');if(!/^[a-zA-Z0-9.-]+$/.test(env.SCOM_MANAGEMENT_SERVER))throw new Error('Ungültiger SCOM-Servername.');args=['-File',path.join(__dirname,'scom-read.ps1'),'-ManagementServer',env.SCOM_MANAGEMENT_SERVER]}
 const executable=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
 const {stdout}=await run(executable,['-NoLogo','-NoProfile','-NonInteractive',...args],{timeout:120000,maxBuffer:25*1024*1024,windowsHide:true,env});
 const parsed=JSON.parse(stdout);if(!Array.isArray(parsed))throw new Error('Unerwartetes SCOM-Antwortformat.');
 const seen=new Set();return parsed.map(r=>{if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id)||seen.has(r.id))throw new Error('Ungültige oder doppelte SCOM-Objektkennung.');seen.add(r.id);return {source:'SCOM',id:r.id,name:String(r.name||r.id),host:String(r.path||r.name||r.id),rawState:String(r.state||'Unknown')}});
}
module.exports={checkmkConfig,fetchCheckmk,fetchScom};
