Add-Type -AssemblyName System.Speech
$scenes = Get-Content -LiteralPath 'output/playwright/scenes.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$speech = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speech.SelectVoice('Microsoft Hedda Desktop')
$speech.Rate = -1
for ($i=0; $i -lt $scenes.Count; $i++) {
  $path = Join-Path (Get-Location) ('output/playwright/narration-{0:00}.wav' -f $i)
  $speech.SetOutputToWaveFile($path)
  $speech.Speak([string]$scenes[$i][1])
  $speech.SetOutputToNull()
}
$speech.Dispose()
