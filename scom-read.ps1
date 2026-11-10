param([Parameter(Mandatory=$true)][string]$ManagementServer)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
Import-Module OperationsManager -ErrorAction Stop
$instances = @(Get-SCOMClassInstance -ComputerName $ManagementServer -ErrorAction Stop | ForEach-Object {
    [pscustomobject]@{ id = $_.Id.ToString(); name = $_.DisplayName; path = $_.Path; state = $_.HealthState.ToString() }
})
ConvertTo-Json -InputObject $instances -Depth 3 -Compress
