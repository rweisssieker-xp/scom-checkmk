param([Parameter(Mandatory=$true)][string]$WebUrl)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
if (-not $env:SCOM_USERNAME -or -not $env:SCOM_PASSWORD) { throw 'SCOM REST credentials missing.' }
$uriBase = $WebUrl.TrimEnd('/')
$authText = 'Network:{0}:{1}' -f $env:SCOM_USERNAME, $env:SCOM_PASSWORD
$jsonBody = ConvertTo-Json -InputObject ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($authText))) -Compress
$headers = @{ 'Accept'='application/json'; 'Content-Type'='application/json; charset=utf-8' }
Invoke-WebRequest -Uri "$uriBase/authenticate" -Method Post -Headers $headers -Body $jsonBody -UseDefaultCredentials -SessionVariable session -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20 | Out-Null
$token = $session.Cookies.GetCookies($uriBase) | Where-Object { $_.Name -eq 'SCOM-CSRF-TOKEN' } | Select-Object -First 1
if ($token) { $headers['SCOM-CSRF-TOKEN'] = [System.Uri]::UnescapeDataString($token.Value) }
$criteria = if ($env:SCOM_OBJECT_CRITERIA) { $env:SCOM_OBJECT_CRITERIA } else { "DisplayName LIKE '%'" }
$objects = Invoke-RestMethod -Uri "$uriBase/data/scomObjects" -Method Post -Body (ConvertTo-Json -InputObject $criteria -Compress) -Headers $headers -WebSession $session -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20
if ($null -eq $objects.scopeDatas) { throw 'Unexpected SCOM object response.' }
if (@($objects.scopeDatas).Count -gt 200) { throw 'SCOM object result exceeds limit. Narrow SCOM_OBJECT_CRITERIA.' }
$instances = @($objects.scopeDatas | ForEach-Object {
    $objectId = [guid]::Parse($_.id).ToString()
    $data = Invoke-RestMethod -Uri "$uriBase/data/monitoring/$objectId" -Method Get -Headers $headers -WebSession $session -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20
    if (-not $data.healthState -or $data.objectId -ne $objectId) { throw 'Unexpected SCOM monitoring response.' }
    [pscustomobject]@{ id=$objectId; name=$_.displayName; path=$_.path; state=$data.healthState }
})
ConvertTo-Json -InputObject $instances -Depth 3 -Compress
