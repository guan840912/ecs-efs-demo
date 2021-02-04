# ECS Mount EFS Demo

### `cdk-efs-assets` 將會幫助我們在 efs `fs-xxxxxx:/demo-github`，Clone `https://github.com/guan840912/guan840912.git`

### 當前目錄 清單
```bash
fs-xxxxxx:/demo-github/guan840912/README.md
# ECS TASK
...
mountPoint: [
  {
    containerPath: "/config",
    sourceVolume: "app-data"
  }
  ...
]
...
"volumes": [
        {
            "name": "app-data",
            "efsVolumeConfiguration": {
                "fileSystemId": "fs-xxxxxxx",
                "transitEncryption": "ENABLED"
            }
        }
    ],
...
```

### 確認過後, 將會掛成 
```bash
Container Path => /config/demo-github/guan840912/README.md
```