# sRedisTool

"sRedisTool" is an easy-to-use GUI management tool for Redis. It is built on [Electron](https://github.com/atom/electron), [Vue](https://vuejs.org/). It is driven by many great modules, in particular [ioredis](https://github.com/luin/ioredis), [Element UI](https://element.eleme.io/). This project was created inspired by [RedisDesktopManager](https://resp.app/) and [medis](https://github.com/luin/medis).

This tool is supported to run on Windows, Mac and Linux environments and is currently only fully tested on the Windows platform.

> [🇨🇳 中文版](./README.zh-CN.md)

## Features
* Key list display, you can sort and group the Key display.
* Key keyword query.
* Add, modify, and delete Redis values.
* Support Redis value types: String,Hash,List,Set,Zset.
* Support for Redis clusters.
* Redis server configuration management.
* Redis server status monitoring: connected clients, graphical display of operational metrics, server configuration.
* Redis command line.
* Redis command monitor.
* Multi-language support, currently supports Simplified Chinese, English.
* Connect using SSL/TLS, SSH。(Cluster mode using SSH connection is not supported at this time)

## Project setup
### Project initialization

```
npm install
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

## Download
You can get the compiled executable on the [release page](https://github.com/programsimon/sRedisTool/releases) of this project.

## TODO
* import and export configuration

## License

MIT