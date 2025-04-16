### PM2
- install pm2 : ``udo npm install -g pm2 ``
- check version : pm2 -v

### Update env
```shell
    - PLATFORM_BASE_PATH: path of folder that contains all your platform codes
    - PLATFORM_PORT : Port start platform such as 8081
    - PLATFORM_URL : your vm url
```

- start app manager : pm2 start npm --name app-manager -- run dev