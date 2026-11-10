# Einrichtung und Betrieb der Live-Bridge

Die Live-Anbindung ist ein technischer Prototyp. Sie wurde bislang nicht gegen eine echte SCOM- oder Checkmk-Instanz verifiziert. Vor produktiver Nutzung müssen API-Verhalten, Berechtigungen, Datenqualität und Betriebsanforderungen in einer eigenen Umgebung geprüft werden.

## Voraussetzungen

- Windows-Rechner für SCOM mit Windows PowerShell 5.1, Node.js 22 oder neuer und Zugriff auf die Quellen.
- Website auf exakt `http://127.0.0.1:8765` und Bridge auf `127.0.0.1:8766`. Die Bridge ist nur lokal erreichbar; sie ist nicht für Internetzugriff oder Mehrbenutzerbetrieb ausgelegt.
- Vertrauenswürdige HTTPS-Zertifikate für die Webschnittstellen. Keine Zertifikatsprüfung deaktivieren.
- Leseberechtigte Konten für die genutzten Monitoringobjekte. Checkmk: Automation-Benutzer und Secret; SCOM: je nach Zugangsweg Webkonsole oder OperationsManager-Modul.

## Konfiguration

Die Bridge liest die folgenden Umgebungsvariablen beim Start. Geheimnisse müssen auf dem ausführenden Rechner geschützt bereitgestellt werden; sie gehören nicht in Quellcode, Issues oder den Browser. Umgebungsvariablen sind kein vollwertiger Secret-Manager und können für berechtigte Prozesse beziehungsweise Administratoren sichtbar sein.

| Variable | Bedeutung |
| --- | --- |
| `CHECKMK_SITE_URL` | HTTPS-Site-URL, z. B. `https://monitor.example.org/mysite`; ohne API-Pfad |
| `CHECKMK_USERNAME` | Checkmk-Automation-Benutzer mit lesenden Rechten |
| `CHECKMK_SECRET` | Dessen Automation Secret |
| `SCOM_WEB_URL` | HTTPS-URL der Webkonsole, z. B. `https://scom.example.org/OperationsManager` |
| `SCOM_USERNAME`, `SCOM_PASSWORD` | SCOM-REST-Zugang im Format `DOMÄNE\Benutzer` und Passwort |
| `SCOM_OBJECT_CRITERIA` | Optionales SCOM-Suchkriterium, etwa `DisplayName LIKE '%MESO%'` |
| `SCOM_MANAGEMENT_SERVER` | Hostname für den alternativen Zugriff über das lokale OperationsManager-Modul |

Ist `SCOM_WEB_URL` gesetzt, wird die REST-Variante verwendet; andernfalls der Modulzugriff. Die Bridge startet Windows PowerShell unter ihrem eigenen Windows-Konto. Beim REST-Zugriff müssen auch dessen Windows-Authentifizierungsrechte zur Webkonsole passen. Das Modul ist nur für den alternativen Modulzugriff erforderlich.

Beispiel für nicht geheime Einstellungen in PowerShell (Namen ersetzen):

```powershell
$env:CHECKMK_SITE_URL = 'https://monitor.example.org/mysite'
$env:CHECKMK_USERNAME = 'service_atlas_reader'
$env:SCOM_WEB_URL = 'https://scom.example.org/OperationsManager'
$env:SCOM_USERNAME = 'DOMAIN\service_atlas_reader'
$env:SCOM_OBJECT_CRITERIA = "DisplayName LIKE '%MESO%'"
node live-server.js
```

Vor dem Start müssen zusätzlich die benötigten Secrets im ausführenden Prozess sicher gesetzt werden. Das Beispiel enthält bewusst keine Geheimnisse. Nach Änderungen der Umgebung den Bridge-Prozess neu starten. Anschließend im Servicebaum **Live-Quellen** öffnen, aktualisieren und ein Objekt bewusst dem Baum hinzufügen. Abhängigkeiten und Bereichsregeln bleiben manuell zu konfigurieren.

## Aktualität und Fehler

- Bei geöffnetem Servicebaum erfolgt der Abruf für zugeordnete Live-Objekte ungefähr minütlich. Schlägt die Abfrage einer Quelle fehl, werden deren Live-Objekte UNKNOWN. Nach drei Minuten ohne erfolgreichen Abruf berechnet das Modell ebenfalls UNKNOWN.
- Der angezeigte Abrufzeitpunkt ist nicht der Zeitpunkt des letzten Quellchecks. Ein aktueller Bridge-Abruf garantiert daher nicht, dass die ursprüngliche Prüfung aktuell ist.
- Die Managementseite startet keine eigenen Quellenabfragen; bleibt kein Servicebaum geöffnet, altern Live-Werte dort zu UNKNOWN. Nach Browserdatenverlust gehen lokale Zuordnungen und Zustände verloren.
- Checkmk-Abfragen können umfangreich sein. Mehrdeutige Kennungen werden abgelehnt. Bei SCOM REST werden mehr als 200 Treffer abgelehnt; das Suchkriterium enger fassen.
- `nicht konfiguriert`: Umgebungsvariablen und Neustart prüfen. Bei Verbindungsfehlern URL, Zertifikat, Netzwerk, Identität und Leserechte prüfen. SCOM-Modulzugriff: Installation und Version der Operations Console prüfen.

Die Bridge bietet keine Authentifizierung für mehrere Benutzer, keine zentralen Zeitreihen, keine dauerhafte Hintergrundsynchronisation und kein Produktionsdeployment. Öffentliche Freigabe oder Betrieb im Netzwerk erfordert eine gesonderte Architektur- und Sicherheitsprüfung.

## SQLite-Hintergrundüberwachung

`node workspace-server.js` startet zusätzlich eine minütliche Hintergrundabfrage der zuletzt im Dialog „Gemeinsamer Speicher“ gespeicherten Konfiguration. Der Dienst verwendet die oben genannten Umgebungsvariablen seines eigenen Prozesses; bei Änderungen muss er neu gestartet werden. Die Live-Bridge auf Port 8766 ist dafür nicht erforderlich. Ohne gespeicherten Arbeitsbereich entstehen keine Aufnahmen. Nur Quellen mit zugeordneten Live-Objekten werden abgefragt. Fehlende oder mehrdeutige Objekte und fehlgeschlagene Quellen werden UNKNOWN; simulierte Komponenten behalten ihre simulierten Werte. Der Zeitpunkt bezeichnet den Abruf, nicht den letzten Check in der Quelle.

Die Momentaufnahmen werden getrennt von der Versionshistorie gespeichert und sind unter Service Intelligence → Datenbasis → SQLite-Hintergrundaufnahmen sichtbar. Sie enthalten die Revision der ausgewerteten Konfiguration; ungespeicherte Browseränderungen werden nicht berücksichtigt. Die Ansicht zeigt maximal 200 Aufnahmen, die Datenbank löscht keine automatisch: Größe und Backups müssen betrieben werden. Während eines Dienststillstands entstehen Lücken. Das Service-Cockpit kann auf die SQLite-Datenbasis umgeschaltet werden und fragt sie regelmäßig ab. Die Servicebaum-Seiten behalten ihren Browserstand; der Link aus dem Cockpit weist darauf hin. Der lokale Prototyp besitzt keine Anmeldung, Rollen oder produktive Betriebsüberwachung. Die Adapter sind weiterhin nicht gegen reale Systeme verifiziert.
