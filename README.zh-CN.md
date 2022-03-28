# sRedisTool

"sRedisTool" 是一个Redis简单易用的GUI管理工具。 基于[Electron](https://github.com/atom/electron),[Vue](https://vuejs.org/)构建。它由许多很棒的模块驱动，特别是[ioredis](https://github.com/luin/ioredis),[Element UI](https://element.eleme.io/)。本项目受[RedisDesktopManager](https://resp.app/)和[medis](https://github.com/luin/medis)启发而创建。

此工具可支持运行于Windows、Mac和Linux环境，目前仅在Windows平台进行了全面测试。

## 主要功能
* Key 列表显示，可对Key排序、分组显示。
* Key 关键字查询。
* 添加、修改、删除Redis值。
* 支持Redis值类型: String,Hash,List,Set，Zset。
* 支持Redis集群。
* Redis服务器配置管理。
* Redis服务器状态监控: 连接客户端、运行指标图表显示、服务器配置。
* Redis命令行。
* Redis命令监听。
* 多语言支持，目前支持简体中文，英文。
* 使用SSL/TLS、SSH连接。(暂不支持集群方式使用SSH连接)
* 可导入和导出配置文件，可导入RESP.app配置文件
* 支持用户名认证(Redis > 6.0)

## 项目构建
### 项目初始化

```
npm install
```

### 调试运行
```
npm run electron:serve
```

### 构建
```
npm run electron:build
```

## 下载
你可以在本项目[发布页](https://github.com/programsimon/sRedisTool/releases)，获取已编译的可执行文件。

## TODO

## 已知问题

## License

MIT