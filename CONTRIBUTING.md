# Mitwirken

Fehlerberichte und Verbesserungsvorschläge sind willkommen. Bitte zuerst prüfen, ob bereits ein passendes Issue existiert. Für Sicherheitslücken gilt [SECURITY.md](SECURITY.md).

## Lokal arbeiten

1. Repository klonen und Node.js 22 oder neuer installieren.
2. Auf einem eigenen Branch arbeiten und die App wie im [Schnellstart](README.md#schnellstart) öffnen.
3. `node --test` ausführen. Für Änderungen an PowerShell-Skripten zusätzlich deren Syntax prüfen; echte Integrationen benötigen eine eigene Testumgebung.
4. Den Pull Request anhand der Vorlage beschreiben und die tatsächlich durchgeführten Prüfungen nennen.

Tests verwenden simulierte Daten und dürfen keine echten SCOM- oder Checkmk-Zugangsdaten benötigen. Keine Geheimnisse, internen Konfigurationen oder Kundendaten in Issues, Commits oder Screenshots aufnehmen. Bestehende Tests nicht entfernen oder abschwächen, um einen Fehler zu umgehen.

Mit dem Einreichen eines Beitrags erklärst du, dass du ihn unter der [MIT-Lizenz](LICENSE) bereitstellen darfst.
