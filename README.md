# Service Atlas

Service Atlas modelliert Geschäftsservices aus Komponenten und Abhängigkeiten und zeigt deren berechneten Zustand in mehreren Serviceansichten und einer Managementübersicht. Die mitgelieferten Beispiele sind fiktiv. Eine optionale Live-Anbindung an SCOM und Checkmk ist ein bisher nicht gegen reale Instanzen verifizierter Prototyp.

## Schnellstart

Für die Simulation genügt ein moderner Browser. Für die automatisierten Tests und die optionale Live-Bridge wird Node.js 22 oder neuer benötigt. Es müssen keine npm-Pakete installiert werden.

1. In einem Terminal im Projektordner einen lokalen Webserver starten, zum Beispiel mit Python:

   ```powershell
   python -m http.server 8765 --bind 127.0.0.1
   ```

2. [Gesamtübersicht](http://127.0.0.1:8765/management.html) oder [Service-Map](http://127.0.0.1:8765/service-map.html) im Browser öffnen und einen Beispielbaum auswählen.
3. Optional mit `node --test` die automatisierten Tests starten.

Für die Live-Anbindung zusätzlich die [Einrichtung und Betriebsgrenzen](docs/betrieb.md) beachten. Die Bridge funktioniert nur mit der oben genannten Adresse und muss separat gestartet und konfiguriert werden.

Weitere Informationen: [Architektur und Datenmodell](docs/architektur.md) · [Mitwirken](CONTRIBUTING.md) · [Sicherheit](SECURITY.md) · [MIT-Lizenz](LICENSE).

Für die Simulation `index.html` im Browser öffnen. Die optionale Live-Anbindung benötigt Node.js und die unten beschriebene lokale Bridge.

Servicebäume und Komponenten lassen sich anlegen, bearbeiten und nach Bestätigung löschen. Ein Baum enthält benannte Bereiche mit Komponenten; jeder Bereich hat eine gemeinsame Aggregationsregel. Bei Pflichtbereichen bestimmt der schlechteste Zustand den Bereich. Bei redundanten Bereichen lässt sich die Mindestanzahl verfügbarer Komponenten einstellen: OK und WARN zählen als verfügbar; sind nicht genügend verfügbar, ist der Bereich CRIT. Könnte ein unbekannter Zustand das Ergebnis verändern, ist der Bereich UNKNOWN. Sind genügend verfügbar, aber nicht alle OK, ist er WARN. Informative Bereiche werden angezeigt, fließen aber nicht in den Gesamtzustand ein. Ein leerer Baum ist UNKNOWN. Gesamtstatus: CRIT vor UNKNOWN vor WARN vor OK.

Zustände von Demo-Komponenten können simuliert und für den gewählten Baum auf UNKNOWN zurückgesetzt werden. Gemeinsam verwendete Komponenten ändern sich dabei auch in anderen Bäumen. Änderungen werden im lokalen Browserspeicher dieses Browsers gespeichert; beim Löschen der Browserdaten können sie verloren gehen. Eventuelle Zustände aus der ersten Version werden beim ersten Start übernommen. Live-Verbindungen sind nur nach gesonderter Konfiguration verfügbar.

## Optionale Live-Anbindung (technischer Prototyp)

Die bestehende Simulation bleibt getrennt. Für Live-Objekte in Windows mit Node.js 22 oder neuer die Website über `http://127.0.0.1:8765/` bereitstellen und in einem zweiten Terminal `node live-server.js` starten. Die Bridge lauscht ausschließlich auf `127.0.0.1:8766` und akzeptiert nur lesende Anfragen von der genannten Website-Origin. Sie ist kein für Mehrbenutzer- oder Internetbetrieb abgesicherter Server. Ein Hintergrundprozess muss mit den Umgebungsvariablen des ausführenden Benutzerkontos neu gestartet werden, wenn sich die Konfiguration ändert.

Serverseitige Umgebungsvariablen: `CHECKMK_SITE_URL` (HTTPS-URL einschließlich Site-Namen, ohne `/check_mk/api/…`), `CHECKMK_USERNAME` und `CHECKMK_SECRET` (Automation Secret); für SCOM `SCOM_MANAGEMENT_SERVER` (Hostname). Keine Geheimnisse in den Browser, in dieses Repository oder in den Chat schreiben. HTTPS-Zertifikate müssen vertrauenswürdig sein. Ein lesendes Checkmk-Konto und ein Windows-Konto mit SCOM-Leserechten verwenden. SCOM benötigt auf dem ausführenden Windows-Rechner die zu eurer Version passende Operations Console und das `OperationsManager`-PowerShell-Modul. Die Bridge startet Windows PowerShell 5.1 unter ihrer eigenen Windows-Identität. Checkmk verwendet den REST-API-Endpunkt für überwachte Services (Checkmk 2.4 oder neuer), SCOM die PowerShell-Abfrage über den Management-Server.

Alternativ zum SCOM-Modul kann die REST-API der SCOM-Webkonsole genutzt werden: `SCOM_WEB_URL` auf `https://<webserver>/OperationsManager` und `SCOM_USERNAME` sowie `SCOM_PASSWORD` serverseitig setzen. Die Bridge nutzt Windows PowerShell 5.1 für die Webauthentifizierung, das REST-Login und den CSRF-Token und ruft anschließend Objektinformationen und Health States über die REST-API ab. Auch hierfür muss das ausführende Windows-Konto die Authentifizierungsanforderungen der Webkonsole erfüllen. `SCOM_WEB_URL` hat Vorrang vor `SCOM_MANAGEMENT_SERVER`. Über `SCOM_OBJECT_CRITERIA` kann die SCOM-Suche eingegrenzt werden, zum Beispiel `DisplayName LIKE '%MESO%'`. Die REST-Abfrage bricht bei mehr als 200 Objekten ab, statt ein unvollständiges Ergebnis als vollständig auszugeben. Die REST-Variante ist ebenfalls bislang nur mit simulierten Antworten getestet.

Im Servicebaum **Live-Quellen** öffnen, abfragen und ein Objekt ausdrücklich zum aktuellen Baum hinzufügen. SCOM-Instanzen werden über ihre GUID, Checkmk-Services über Site/Hostname/Servicebeschreibung zugeordnet. Der Abruf wird bei geöffnetem Servicebaum minütlich wiederholt; scheitert die Quelle, werden ihre zugeordneten Werte UNKNOWN. Nach drei Minuten ohne erfolgreiche Abfrage wertet der Rollup den Zustand ebenfalls UNKNOWN. Im Katalog gemeinsam verwendete Live-Objekte werden übergreifend aktualisiert. Das Abrufdatum zeigt den Zeitpunkt der Bridge-Abfrage, nicht notwendigerweise den letzten Check der Quelle. Die Managementseite fragt die Quellen nicht selbst ab; ein Servicebaum muss dazu geöffnet bleiben. Bei verteilten Checkmk-Sites mit nicht eindeutig identifizierbaren Services wird die Abfrage abgelehnt. Die Abfragen können bei großen Umgebungen umfangreich sein; diese erste Fassung ist nicht für den produktiven Dauerbetrieb optimiert.

Die Adapter sind mit simulierten HTTP- und PowerShell-Antworten getestet, aber noch nicht gegen eine echte SCOM- oder Checkmk-Instanz verifiziert. Vor produktiver Verwendung Zugriffsrechte, Antwortformat, Umfang, Zeitüberschreitungen und den Monitoring-Zustand mit eurer konkreten Version prüfen. Abhängigkeiten müssen weiterhin modelliert werden; sie werden nicht automatisch aus den Quellen übernommen.

Tests ausführen: `node --test`.

## Gemeinsamer Komponentenkatalog
Über „Komponentenkatalog“ lassen sich vorhandene Komponenten in weitere Bäume übernehmen. Neue Komponenten werden beim Anlegen im Katalog registriert. Name, Host, Quelle, Typ und simulierter Zustand sind gemeinsam; Bereich, Bereichsregel und Abhängigkeiten werden je Baum festgelegt. Die Beispielkomponente „Gemeinsamer Zeitdienst“ ist in VOIS/MESO und P&I LogaHR enthalten: Eine Zustandsänderung wirkt sich auf beide Bäume aus. Bestehende Komponenten werden bei der Übernahme nicht allein anhand gleicher Namen oder Hosts automatisch zusammengeführt. Der Katalog ist lokal im Browser gespeichert und kein zentraler Mehrbenutzer-Katalog.

Die vier OWL-IT-Beispielbäume orientieren sich an den öffentlich genannten Produktnamen VOIS/MESO, P&I LogaHR, Infoma newsystem und d.velop documents. Servernamen, Architektur, Redundanzregeln, Zuordnungen und Zustände sind erfunden und bilden keine tatsächliche OWL-IT-Infrastruktur ab. Quelle: https://www.owl-it.de/Produkte/ und https://owl-it.de/Produkte/Finanzservices/. Beispiele werden einmalig ergänzt; vorhandene eigene Daten bleiben erhalten.

## Simulierte Schnittstellen

Über „Schnittstellen“ den simulierten Katalog von SCOM und Checkmk anzeigen, einen Rohzustand setzen, ein Objekt hinzufügen und den ausgewählten Baum synchronisieren. Quellzustände und Baumzustände sind getrennt gespeichert. Die manuelle Synchronisation ordnet Quelle und Objektkennung (hier das Feld Objekt / Hostname) exakt zu. Fehlende und mehrdeutige Zuordnungen werden UNKNOWN. Live-Objekte sind von der Demo-Synchronisation ausgenommen.

## Entwurfsansichten
Über „Ansicht“ lassen sich vier visuelle Entwurfsrichtungen sowie die vorherige Liste und das Knotendiagramm umschalten. Alle Ansichten verwenden denselben lokal gespeicherten Baum und dieselben Zustände. Die Gruppierungen bilden keine automatisch bestätigten technischen Hosting- oder Abhängigkeitsbeziehungen ab. Die Ansichten sind an die Entwürfe angelehnt; Abhängigkeiten werden manuell modelliert.

## Abhängigkeiten
Komponenten haben direkte `dependsOn`-IDs innerhalb desselben Baums. Beim Bearbeiten einer Komponente können mehrere Voraussetzungen gewählt und jeweils als Pflicht oder optional markiert werden; Selbstbezüge, unbekannte IDs und Zyklen werden abgelehnt. Löschen entfernt eingehende Referenzen. Die vier Entwurfsansichten zeigen gerichtete Pfade (Quelle hängt von Ziel ab); lange Pfade können innerhalb ihres Bereichs horizontal gescrollt werden. Die Beispielkette Datenbank → Datenbankserver (VM) → Hypervisor → Storage ist simuliert und keine Aussage über die echte Umgebung. Bis zu 200 Pfade werden dargestellt. Der abgeleitete Zustand ergibt sich aus dem schlechtesten Rohzustand und den abgeleiteten Zuständen aller direkten Pflichtvoraussetzungen. Optionale Kanten werden angezeigt, verändern diesen Zustand jedoch nicht. Das Ziel einer optionalen Kante kann über seinen eigenen Bereich trotzdem in den Gesamtzustand einfließen; falls dies nicht gewünscht ist, diesen Bereich als informativ konfigurieren. Reihenfolge: CRIT vor UNKNOWN vor WARN vor OK. Die Bereichsregeln aggregieren die abgeleiteten Zustände. Rohzustände werden nicht überschrieben; die Ableitung ist keine bestätigte Ursache.

## Eigenständige Seiten
Die vier Ansichten haben separate lokale Seiten: `service-map.html`, `incident-radar.html`, `service-konstellation.html` und `schichtenansicht.html`. Sie verwenden denselben Browserspeicher und dieselben gemeinsamen Skripte. Die Simulation und ihre Einschränkungen gelten auf allen Seiten.

## Gesamtübersicht
`management.html` zeigt alle gespeicherten Servicebäume nach ihrem berechneten Gesamtzustand priorisiert, mit Statusfilter und einer Übersicht gemeinsam genutzter Katalogkomponenten. Ein Klick auf einen Service öffnet seine verbundenen Abhängigkeitspfade und Bereiche; über die Knoten oder Bereiche gelangt man zu den Komponenten und kann deren direkte Pflicht- und optionale Abhängigkeiten weiterverfolgen. „Im Servicebaum öffnen“ übernimmt die Auswahl in die Service-Map. Gemessene und abgeleitete Zustände werden getrennt angezeigt. Auf schmalen Bildschirmen werden die Pfade vertikal angeordnet. Die Kennzahlen beschreiben den jeweils berechneten Zustand aus Demo- oder zugeordneten Live-Daten, keine historische Verfügbarkeit oder SLAs.
