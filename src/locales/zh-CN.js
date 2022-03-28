module.exports = {
  // Main process menu
  'File': '文件',
  'Quit': '退出',
  'Language': '语言',
  'appName': 'sRedisTool',
  'Hide App': '隐藏',
  'Hide Others': '隐藏其它',
  'Show All': '显示所有',
  'Help': '帮助',
  'About App': '关于',
  // Language names
  'en': 'English',
  'zh-CN': '简体中文',
  // Header bar tooltips
  'Server Settings': '服务器配置',
  'Settings': '设置',
  // Dialog buttons
  'Cancel': '取消',
  'Confirm': '确定',
  // Dropdown list
  'Select': '请选择',
  // Settings
  'Application Settings': '应用设定',
  'Redis Servers Settings': 'Redis服务器设定',
  // Servers setting
  'Servers': '服务器',
  'Import Server Settings': '导入服务器配置',
  'Export Server Settings': '导出服务器配置',
  'Add Group': '添加组',
  'Rename Group': '修改组名称',
  'Delete Group': '删除组',
  'Sort': '排序',
  'Add Redis Server': '添加Redis服务器',
  'Group Name': '组名称',
  'Input group name': '请输入组名称',
  'Please input group Name': '请输入组名称',
  'Message': '提示',
  'delete group information': '此操作将永久删除组 {name} 及组中的所有服务器配置, 是否继续?',
  'Delete Server': '删除Redis服务器',
  'Open Server': '打开Redis服务器',
  'delete server information': '此操作将永久删除服务器 {name} 的配置, 是否继续?',
  'delete last group': '这是最后一个组，不能删除',
  // Servers setting, server form
  'Server Name': '服务器名称',
  'Save': '保存',
  'Close': '关闭',
  'Test Connection': '测试连接',
  'Host': '主机',
  'Port': '端口',
  'User Name': '用户名',
  'Password': '密码',
  'Show Password': '显示密码',
  'Cluster config': '集群选项',
  'Cluster': '集群',
  'Cluster node': '集群节点',
  'Add node': '添加节点',
  'Delete node': '删除节点',
  'Advanced config': '高级选项',
  'Default database': '默认数据库',
  'Max load key size per time': '一次最大加载键数量',
  'Sort keys': '键排序',
  'Sort': '排序',
  'Group show keys': '分组显示键',
  'Group show':'分组显示',
  'By head charactor size':'字符数',
  'By split charactor':'分隔符',
  'Please input server Name': '请输入服务器名称',
  'Please input host address': '请输入服务器地址',
  'Please input service port': '请输入服务端口号',
  'Service port should be number': '端口号应为数字',
  'Default database should be nonnegative integer': '默认数据库应为非负整数',
  'Load key size should be nonnegative integer': '加载键数量应为非负整数',
  'After selected group show,should select a group type': '选择分组显示后，需选择分组类型',
  'Head charactor size should be positive integer': '字符数应为正整数',
  'Please input split charactor': '请输入分隔符',
  'after validated': '请修改所有不合法的配置后再尝试',
  'Test connection successed': '测试连接成功!',
  'Test connection failed': '测试连接失败：{message}',
  //'How many keys read from the redis server per time,and also effect on load the fields of a key.': '每次从Redis服务器读取的键的数量，同样对短期键的字段信息也有效。',
  'Maxloadkeysize help': '每次从Redis服务器读取的键的数量，同样对读取键的字段信息也有效。',
  'Splitchar help': '分隔符可以是字符串，也可以是单个字符；同时可以设置多个分隔符，每个分隔符以“;”分隔，分隔符中包含“;”时，请使用“;;”转义。',
  'Add node help': '应用会自动读取所有的在集群中的节点信息，一般可不必单独设置节点信息。如果每个节点的密码不同时，此设置是必须的',
  'User Name help': '认证用户名(Redis > 6.0)',
  // Open server dialog
  'select server': '请选择一个服务器配置',
  'Edit Server': '修改服务器配置',
  // Conection area
  'connect redis failed': '连接Redis服务器失败',
  'redis connection broken': 'Redis服务器连接已断开',
  // Key List
  'search patterns': '查询模式(如:key.*)',
  'Terminal': '终端',
  'Load more': '加载更多...',
  // Add key dialog
  'Add Key': '添加Key',
  'Key': '键名',
  'Key type': '键类型',
  'Encoding': '编码',
  'Field value': '字段名',
  'Score value': '分数值',
  'Key value': '键值',
  'key missing': '请输入键名',
  'key type missing': '请选择键类型',
  'key type invalid': '请选择正确的键类型',
  'field missing': '请输入字段名',
  'score missing': '请输入分数值',
  'score must be number': '分数值必须为数字',
  'redis is not valid to add key': '当前Redis状态无法添加键',
  'Add key successed': '添加键成功',
  'Add key failed': '添加键失败:{message}',
  // main area
  'not exist key': '键({message})不存在',
  'not surpported key type': '尚未支持的键类型:{message}',
  'Server information': '服务器信息',
  // keyvalue header,
  'Rename': '重命名',
  'Delete': '删除',
  'delete confirm': '此操作将永久删除此键及其值，是否继续？',
  'Delete Key': '删除键',
  'Key deleted': '键已删除',
  'Redis connect invalid': 'Redis服务不可用',
  'Set TTL': '设置TTL',
  'TTL must be positive integer': 'TTL应当为正整数',
  'Set TTL successed': '设置TTL成功',
  'Set TTL failed': '设置TTL失败:{message}',
  'Rename key successed': '重命名键成功',
  'Rename key failed': '重命名键失败:{message}',
  // value editor
  'Format': '格式化',
  'Copy': '复制',
  'Line wrap': '自动换行',
  'Copied to clipboard': '已复制到粘贴板',
  // editor string
  'Get key failed': '获取键值失败:{message}',
  'Refresh': '刷新',
  'Save successed': '保存成功',
  'Save failed': '保存失败:{message}',
  // editor list
  'list data changed': '在List数据加载后，需要修改的数据在Redis服务器已被修改，无法修改此数据',
  'Insert': '插入',
  'delete item confirm': '此操作将删除此值，是否继续？',
  'Delete successed': '删除成功',
  'Delete failed': '删除失败:{message}',
  'Add': '添加',
  'Add to': '添加至',
  'Add successed': '添加成功',
  'Add failed': '添加失败:{message}',
  // server info
  'Server configuration': '服务器配置',
  'Server running charts': '服务器运行图表',
  'Server clients': '客户端',
  // info info
  'Auto refresh': '自动刷新',
  'Get server info failed': '获取服务器信息失败:{message}',
  // info config
  'Config name': '配置名称',
  'Config value': '配置值',
  // info clients
  'Address': '地址',
  'Idle span': '空闲时长',
  'Connect span': '连接时长',
  // info monitor
  'Memory Usage': '内存占用',
  'Clients': '客户端连接数',
  'CPU Usage': 'CPU占用',
  'Key Size': '键数量',
  'Commands per Second': '每秒执行命令数',
  'Uptime in days': '运行天数',
  // terminal
  'Command monitor': '命令监听',
  'Start monitor': '启动监听',
  'Security': '安全',
  'NONE': '无',
  'SSH': 'SSH',
  'SSL/TLS': 'SSL/TLS',
  'Public key': '公钥',
  'Private key': '私钥',
  'Authority': '授权',
  'Select File': '选择文件',
  'public key tooltip': '公钥文件, Redis服务配置文件中tls-ca-cert-file配置项',
  'private key tooltip': '公钥文件, Redis服务配置文件中tls-key-file配置项',
  'authority tooltip': '公钥文件, Redis服务配置文件中tls-cert-file配置项',
  'SSH User Name': 'SSH用户',
  'Passphrase': '秘钥锁码',
  'Select export file': '请选择导出文件',
  'Config file type': '配置文件',
  'All file type': '所有文件',
  'Select import file': '请选择导入文件',
  'Import configuration file failed': '导入配置文件失败:{message}',
  'read file failed': '读取文件失败',
  'not surpported file format': '不支持的文件格式',
  'Import configuration file successed': '导入配置文件成功',
  'Not a configuration file for xxx': '不是{appName}的配置文件',
}