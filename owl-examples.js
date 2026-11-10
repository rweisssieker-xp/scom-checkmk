// Produktbezeichnungen nach öffentlichem OWL-IT-Portfolio; die technische Modellierung ist vollständig fiktiv.
(function(root){
 const products=[['einwohner','Einwohnerwesen – VOIS/MESO','meso'],['personal','Personalmanagement – P&I LogaHR','logahr'],['finanzen','Finanzservices – Infoma newsystem','infoma'],['dms','Dokumentenmanagement – d.velop documents','dms']];
 root.owlExamples=products.map(([key,name,slug])=>({id:`owl-demo-${key}`,name:`${name} (Beispiel)`,components:[
 {id:`${key}-web`,name:`${name.split(' – ')[1]} – Webzugriff`,host:`demo-${slug}-web`,source:'SCOM',type:'Webanwendung (fiktiv)',state:'ok',group:'Webzugriff',mode:'required'},
 {id:`${key}-windows`,name:'Windows-Anwendungsserver',host:`demo-${slug}-win-01`,source:'SCOM',type:'Windows Server (fiktiv)',state:'ok',group:'Webzugriff',mode:'required'},
 {id:`${key}-linux1`,name:'Linux-Service 01',host:`demo-${slug}-linux-01`,source:'Checkmk',type:'Linux-Service (fiktiv)',state:'ok',group:'Anwendungsdienste',mode:'redundant'},
 {id:`${key}-linux2`,name:'Linux-Service 02',host:`demo-${slug}-linux-02`,source:'Checkmk',type:'Linux-Service (fiktiv)',state:'ok',group:'Anwendungsdienste',mode:'redundant'},
 {id:`${key}-db`,name:'Datenbankdienst',host:`demo-${slug}-db`,source:'SCOM',type:'Datenbank (fiktiv)',state:'ok',group:'Datenbank',mode:'required'},
 {id:`${key}-net-dns`,name:'DNS-Auflösung',host:`demo-${slug}-dns`,source:'Checkmk',type:'DNS-Prüfung (fiktiv)',state:'ok',group:'Netzwerk',mode:'required'},
 {id:`${key}-net-firewall`,name:'Firewall',host:`demo-${slug}-firewall`,source:'Checkmk',type:'Firewall (fiktiv)',state:'ok',group:'Netzwerk',mode:'required'},
 {id:`${key}-net-switch`,name:'Netzwerk-Switch',host:`demo-${slug}-switch`,source:'Checkmk',type:'Switch (fiktiv)',state:'ok',group:'Netzwerk',mode:'required'},
 {id:`${key}-net-route`,name:'Netzwerkverbindung',host:`demo-${slug}-verbindung`,source:'Checkmk',type:'Verbindungsprüfung (fiktiv)',state:'ok',group:'Netzwerk',mode:'required'},
 {id:`${key}-infra-dbserver`,name:'Datenbankserver (VM)',host:`demo-${slug}-db-vm`,source:'SCOM',type:'Windows-VM für Datenbank (fiktiv)',state:'ok',group:'Datenbank',mode:'required'},
 {id:`${key}-infra-hypervisor`,name:'Virtualisierungshost Datenbank',host:`demo-${slug}-hypervisor`,source:'Checkmk',type:'Hypervisor (fiktiv)',state:'ok',group:'Plattform & Storage',mode:'required'},
 {id:`${key}-infra-storage`,name:'Storage für Datenbank',host:`demo-${slug}-storage`,source:'Checkmk',type:'Speicher (fiktiv)',state:'ok',group:'Plattform & Storage',mode:'required'},
 {id:`${key}-infra-backup`,name:'Datenbank-Backup',host:`demo-${slug}-backup`,source:'Checkmk',type:'Sicherungsprüfung (fiktiv)',state:'ok',group:'Betrieb & Sicherung',mode:'required'},
 {id:`${key}-infra-auth`,name:'Verzeichnisdienst / Anmeldung',host:`demo-${slug}-auth`,source:'SCOM',type:'Authentifizierung (fiktiv)',state:'ok',group:'Identität & Zugriff',mode:'required'},
 {id:`${key}-infra-proxy`,name:'Reverse-Proxy / Lastausgleich',host:`demo-${slug}-proxy`,source:'Checkmk',type:'Webzugang (fiktiv)',state:'ok',group:'Webzugriff',mode:'required'},
 {id:`${key}-infra-tls`,name:'TLS-Zertifikat',host:`demo-${slug}-tls`,source:'Checkmk',type:'Zertifikatsprüfung (fiktiv)',state:'ok',group:'Webzugriff',mode:'required'}]}));
})(globalThis);
