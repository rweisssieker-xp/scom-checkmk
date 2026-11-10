# Design-QA – vier umschaltbare Ansichten

Final result: blocked (referenzgetreue Umsetzung der vier generierten Entwürfe noch nicht erreicht).

Geprüft: Browser-Darstellung der Service-Map, des Incident Radar und der Schichtenansicht; Umschalten aller vier Ansichten; Auswahl einer Komponente und Zustandswechsel mit Erhaltung beim Ansichtswechsel; schmale Schichtenansicht ohne horizontalen Überlauf. Vierzehn automatisierte Tests erfolgreich.

Bekannte Abweichungen: Die Entwürfe sind als unterschiedliche Gruppierungsansichten innerhalb der bestehenden App umgesetzt und nicht als vollständige 1:1-Reproduktionen ihrer Screens. Die Service-Map und die Konstellation bilden keine mehrstufigen technischen Abhängigkeitskanten ab; die Schichten entsprechen vorhandenen Gruppen, nicht einem verifizierten Architekturmodell. Das Incident Radar zeigt Zustände, keine validierte Ursachenanalyse. Ein echtes SCOM-/Checkmk-Backend ist nicht angeschlossen. Auf kleinen Fenstern und bei vielen Komponenten kann Scrollen erforderlich sein. Konstellation und Service-Map sind nicht bei allen Fenstergrößen visuell geprüft.
