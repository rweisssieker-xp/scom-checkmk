# Service Atlas – Simulation

`index.html` im Browser öffnen. Es sind keine Abhängigkeiten und kein Server erforderlich.

Servicebäume und Komponenten lassen sich anlegen, bearbeiten und nach Bestätigung löschen. Ein Baum enthält benannte Bereiche mit Komponenten; jeder Bereich hat eine gemeinsame Aggregationsregel. Bei Pflichtbereichen bestimmt der schlechteste Zustand den Bereich. Bei redundanten Bereichen lässt sich die Mindestanzahl verfügbarer Komponenten einstellen: OK und WARN zählen als verfügbar; sind nicht genügend verfügbar, ist der Bereich CRIT. Könnte ein unbekannter Zustand das Ergebnis verändern, ist der Bereich UNKNOWN. Sind genügend verfügbar, aber nicht alle OK, ist er WARN. Informative Bereiche werden angezeigt, fließen aber nicht in den Gesamtzustand ein. Ein leerer Baum ist UNKNOWN. Gesamtstatus: CRIT vor UNKNOWN vor WARN vor OK.

Zustände können pro Komponente simuliert und für den gewählten Baum auf UNKNOWN zurückgesetzt werden. Gemeinsam verwendete Komponenten ändern sich dabei auch in anderen Bäumen. Änderungen werden im lokalen Browserspeicher dieses Browsers gespeichert; beim Löschen der Browserdaten können sie verloren gehen. Eventuelle Zustände aus der ersten Version werden beim ersten Start übernommen. Es bestehen keine Verbindungen zu SCOM oder Checkmk.

Tests ausführen: `node --test`.

## Gemeinsamer Komponentenkatalog
Über „Komponentenkatalog“ lassen sich vorhandene Komponenten in weitere Bäume übernehmen. Neue Komponenten werden beim Anlegen im Katalog registriert. Name, Host, Quelle, Typ und simulierter Zustand sind gemeinsam; Bereich, Bereichsregel und Abhängigkeiten werden je Baum festgelegt. Die Beispielkomponente „Gemeinsamer Zeitdienst“ ist in VOIS/MESO und P&I LogaHR enthalten: Eine Zustandsänderung wirkt sich auf beide Bäume aus. Bestehende Komponenten werden bei der Übernahme nicht allein anhand gleicher Namen oder Hosts automatisch zusammengeführt. Der Katalog ist lokal im Browser gespeichert und kein zentraler Mehrbenutzer-Katalog.

Die vier OWL-IT-Beispielbäume orientieren sich an den öffentlich genannten Produktnamen VOIS/MESO, P&I LogaHR, Infoma newsystem und d.velop documents. Servernamen, Architektur, Redundanzregeln, Zuordnungen und Zustände sind erfunden und bilden keine tatsächliche OWL-IT-Infrastruktur ab. Quelle: https://www.owl-it.de/Produkte/ und https://owl-it.de/Produkte/Finanzservices/. Beispiele werden einmalig ergänzt; vorhandene eigene Daten bleiben erhalten.

## Simulierte Schnittstellen

Über „Schnittstellen“ den simulierten Katalog von SCOM und Checkmk anzeigen, einen Rohzustand setzen, ein Objekt hinzufügen und den ausgewählten Baum synchronisieren. Quellzustände und Baumzustände sind getrennt gespeichert. Die manuelle Synchronisation ordnet Quelle und Objektkennung (hier das Feld Objekt / Hostname) exakt zu. Fehlende und mehrdeutige Zuordnungen werden UNKNOWN. Ein SCOM-Objektmodell oder eine echte Checkmk-API ist nicht angebunden; eine spätere Produktivintegration braucht insbesondere echte stabile Objekt- bzw. Servicekennungen, Authentifizierung, Netzverbindung und Fehler-/Aktualitätsüberwachung.

## Entwurfsansichten
Über „Ansicht“ lassen sich vier visuelle Entwurfsrichtungen sowie die vorherige Liste und das Knotendiagramm umschalten. Alle Ansichten verwenden denselben lokal gespeicherten Baum und dieselben Zustände. Die Gruppierungen bilden keine automatisch bestätigten technischen Hosting- oder Abhängigkeitsbeziehungen ab. Die Ansichten sind an die Entwürfe angelehnt; das Datenmodell unterstützt noch keine beliebigen Beziehungskanten oder echte Live-Systeme.

## Abhängigkeiten
Komponenten haben direkte `dependsOn`-IDs innerhalb desselben Baums. Beim Bearbeiten einer Komponente können mehrere Voraussetzungen gewählt und jeweils als Pflicht oder optional markiert werden; Selbstbezüge, unbekannte IDs und Zyklen werden abgelehnt. Löschen entfernt eingehende Referenzen. Die vier Entwurfsansichten zeigen gerichtete Pfade (Quelle hängt von Ziel ab); lange Pfade können innerhalb ihres Bereichs horizontal gescrollt werden. Die Beispielkette Datenbank → Datenbankserver (VM) → Hypervisor → Storage ist simuliert und keine Aussage über die echte Umgebung. Bis zu 200 Pfade werden dargestellt. Der abgeleitete Zustand ergibt sich aus dem schlechtesten Rohzustand und den abgeleiteten Zuständen aller direkten Pflichtvoraussetzungen. Optionale Kanten werden angezeigt, verändern diesen Zustand jedoch nicht. Das Ziel einer optionalen Kante kann über seinen eigenen Bereich trotzdem in den Gesamtzustand einfließen; falls dies nicht gewünscht ist, diesen Bereich als informativ konfigurieren. Reihenfolge: CRIT vor UNKNOWN vor WARN vor OK. Die Bereichsregeln aggregieren die abgeleiteten Zustände. Rohzustände werden nicht überschrieben; die Ableitung ist keine bestätigte Ursache.

## Eigenständige Seiten
Die vier Ansichten haben separate lokale Seiten: `service-map.html`, `incident-radar.html`, `service-konstellation.html` und `schichtenansicht.html`. Sie verwenden denselben Browserspeicher und dieselben gemeinsamen Skripte. Die Simulation und ihre Einschränkungen gelten auf allen Seiten.
