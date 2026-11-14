param(
    [string]$Profile = "laurila",
    [string]$Region = "eu-north-1",
    [string]$AppId = "d2nl0hqzfcyme6",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$archivePath = Join-Path ([System.IO.Path]::GetTempPath()) "roket-$([guid]::NewGuid()).zip"

function Invoke-Amplify {
    param([string[]]$Arguments)

    $result = & aws amplify @Arguments --profile $Profile --region $Region --output json
    if ($LASTEXITCODE -ne 0) {
        throw "AWS Amplify command failed with exit code $LASTEXITCODE."
    }
    return ($result | ConvertFrom-Json)
}

Push-Location $PSScriptRoot
try {
    Write-Host "Building Roket..."
    & pnpm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE."
    }

    Compress-Archive -Path "dist/*" -DestinationPath $archivePath

    Write-Host "Creating deployment for $AppId/$Branch..."
    $deployment = Invoke-Amplify @("create-deployment", "--app-id", $AppId, "--branch-name", $Branch)
    if (-not $deployment.jobId -or -not $deployment.zipUploadUrl) {
        throw "Amplify did not return a job ID and upload URL."
    }

    Write-Host "Uploading build..."
    Invoke-RestMethod -Uri $deployment.zipUploadUrl -Method Put `
        -ContentType "application/zip" -InFile $archivePath | Out-Null

    Invoke-Amplify @(
        "start-deployment", "--app-id", $AppId, "--branch-name", $Branch,
        "--job-id", $deployment.jobId
    ) | Out-Null
    Write-Host "Deployment job $($deployment.jobId) started."

    $deadline = (Get-Date).AddMinutes(15)
    do {
        if ((Get-Date) -ge $deadline) {
            throw "Timed out waiting for job $($deployment.jobId). Check its status in Amplify."
        }
        Start-Sleep -Seconds 5
        $job = Invoke-Amplify @(
            "get-job", "--app-id", $AppId, "--branch-name", $Branch,
            "--job-id", $deployment.jobId
        )
        $status = $job.job.summary.status
        Write-Host "Deployment status: $status"
    } while ($status -in @("PENDING", "PROVISIONING", "RUNNING", "CANCELLING"))

    if ($status -ne "SUCCEED") {
        throw "Deployment job $($deployment.jobId) ended with status '$status'. Check Amplify for details."
    }

    Write-Host "Deployment succeeded."
}
finally {
    if (Test-Path $archivePath) {
        Remove-Item $archivePath
    }
    Pop-Location
}
