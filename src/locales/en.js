module.exports = {
  // Main process menu
  'File': 'File',
  'Quit': 'Quit',
  'Language': 'Language',
  'appName': 'sRedisTool',
  'Hide App': 'Hide App',
  'Hide Others': 'Hide Others',
  'Show All': 'Show All',
  'Help': 'Help',
  'About App': 'About App',
  // Language names
  'en': 'English',
  'zh-CN': '简体中文',
  // Header bar tooltips
  'Server Settings': 'Server Settings',
  'Settings': 'Settings',
  // Dialog buttons
  'Cancel': 'Cancel',
  'Confirm': 'Confirm',
  // Dropdown list
  'Select': 'Please select',
  // Settings
  'Application Settings': 'Application Settings',
  'Redis Servers Settings': 'Redis Server Settings',
  // Servers setting
  'Servers': 'Servers',
  'Import Server Settings': 'Import Server Settings',
  'Export Server Settings': 'Export Server Settings',
  'Add Group': 'Add Group',
  'Rename Group': 'Rename Group',
  'Delete Group': 'Delete Group',
  'Sort': 'Sort',
  'Add Redis Server': 'Add Redis Server',
  'Group Name': 'Group Name',
  'Input group name': 'Input the group name',
  'Please input group Name': 'Please input the group name',
  'Message': 'Message',
  'delete group information': 'This operation will permanently delete the group {name} and all server configurations in the group. Do you want to continue? ',
  'Delete Server': 'Delete Server',
  'Open Server': 'Open Server',
  'delete server information': 'This operation will permanently delete the configuration of the server {name}, do you want to continue? ',
  'delete last group': 'This is the last group and cannot be deleted.',
  // Servers setting, server form
  'Server Name': 'Server Name',
  'Save': 'Save',
  'Close': 'Close',
  'Test Connection': 'Test Connection',
  'Host': 'Host',
  'Port': 'Port',
  'User Name': 'User Name',
  'Password': 'Password',
  'Show Password': 'Show Password',
  'Cluster config': 'Cluster Config',
  'Cluster': 'Cluster',
  'Cluster node': 'Cluster Nodes',
  'Add node': 'Add Node',
  'Delete node': 'Delete Node',
  'Advanced config': 'Advanced Config',
  'Default database': 'Default Database',
  'Max load key size per time': 'Maximum Load Key Size',
  'Sort keys': 'Sort Keys',
  'Sort': 'Sort',
  'Group show keys': 'Group Show Keys',
  'Group Show':'Group Show',
  'By head charactor size':'By head charactor size',
  'By split charactor':'By split charactor',
  'Please input server Name': 'Please input the server Name.',
  'Please input host address': 'Please input the host address.',
  'Please input service port': 'Please input the service port.',
  'Service port should be number': 'Service port should be number.',
  'Default database should be nonnegative integer': 'Default database should be nonnegative integer.',
  'Load key size should be nonnegative integer': 'Maximum load key size should be nonnegative integer.',
  'After selected group show,should select a group type': 'After selecting the group show, you need to select the group type.',
  'Head charactor size should be positive integer': 'Head charactor size should be positive integer.',
  'Please input split charactor': 'Please input split charactor.',
  'after validated': 'Please modify all illegal configurations and try again.',
  'Test connection successed': 'Test connection successed!',
  'Test connection failed': 'Test connection failed: {message}',
  //'How many keys read from the redis server per time,and also effect on load the fields of a key.': '每次从Redis服务器读取的键的数量，同样对短期键的字段信息也有效。',
  'Maxloadkeysize help': 'The number of keys read from the Redis server each time is also valid for reading key field information.',
  'Splitchar help': 'The separator can be a string or a single character; multiple separators can be set at the same time, each separator is separated by ";", when the separator contains ";", please use ";;" to escape.',
  'Add node help': 'The application will automatically read all the node information in the cluster, and it is generally unnecessary to set the node information separately. If the password of each node is different, this setting is necessary.',
  'User Name help': 'Authentication user name (Redis > 6.0)',
  // Open server dialog
  'select server': 'Please select a server configuration.',
  'Edit Server': 'Edit Server',
  // Conection area
  'connect redis failed': 'Connect to redis server failed.',
  'redis connection broken': 'Redis server connection has been disconnected.',
  // Key List
  'search patterns': 'Search Patterns(E.g. key.* )',
  'Terminal': 'Terminal',
  'Load more': 'Load More...',
  // Add key dialog
  'Add Key': 'Add Key',
  'Key': 'Key',
  'Key type': 'Key Type',
  'Encoding': 'Encoding',
  'Field value': 'Field Value',
  'Score value': 'Score Value',
  'Key value': 'Key Value',
  'key missing': 'Please input the key value.',
  'key type missing': 'Please select the key type.',
  'key type invalid': 'Please select a valid key type.',
  'field missing': 'Please input the field value.',
  'score missing': 'Please input the score value.',
  'score must be number': 'The score value should be number.',
  'redis is not valid to add key': 'Cannot add key in current Redis server state.',
  'Add key successed': 'Add key successed.',
  'Add key failed': 'Add key failed:{message}',
  // main area
  'not exist key': 'Key({message}) does not exist',
  'not surpported key type': 'Key types not yet supported:{message}',
  'Server information': 'Server Information',
  // keyvalue header,
  'Rename': 'Rename',
  'Delete': 'Delete',
  'delete confirm': 'This operation will permanently delete this key and its value. Do you want to continue?',
  'Delete Key': 'Delete Key',
  'Key deleted': 'Key deleted.',
  'Redis connect invalid': 'Redis service is unavailable ',
  'Set TTL': 'Set TTL',
  'TTL must be positive integer': 'TTL should be positive integer',
  'Set TTL successed': 'Set TTL successed.',
  'Set TTL failed': 'Set TTL failed:{message}',
  'Rename key successed': 'Rename key successed.',
  'Rename key failed': 'Rename key failed:{message}',
  // value editor
  'Format': 'Format',
  'Copy': 'Copy',
  'Line wrap': 'Line wrap',
  'Copied to clipboard': 'Copied into the clipboard.',
  // editor string
  'Get key failed': 'Get key failed:{message}',
  'Refresh': 'Refresh',
  'Save successed': 'Save successed.',
  'Save failed': 'Save failed:{message}',
  // editor list
  'list data changed': 'After the List data is loaded, the data that needs to be modified has been modified in the Redis server, and this data cannot be modified.',
  'Insert': 'Insert',
  'delete item confirm': 'This operation will delete this value, do you want to continue?',
  'Delete successed': 'Delete successed.',
  'Delete failed': 'Delete failed:{message}',
  'Add': 'Add',
  'Add to': 'Add To',
  'Add successed': 'Add successed.',
  'Add failed': 'Add failed:{message}',
  // server info
  'Server information': 'Server Information',
  'Server configuration': 'Server Configuration',
  'Server running charts': 'Server operation chart.',
  'Server clients': 'Server Clients',
  // info info
  'Auto refresh': 'Auto Refresh',
  'Get server info failed': 'Get server information failed:{message}',
  // info config
  'Config name': 'Config Name',
  'Config value': 'Config Value',
  // info clients
  'Address': 'Address',
  'Idle span': 'Idle Span',
  'Connect span': 'Connection span',
  // info monitor
  'Memory Usage': 'Memory Usage',
  'Clients': 'Clients',
  'CPU Usage': 'CPU Usage',
  'Key Size': 'Key Size',
  'Commands per Second': 'Commands Executed per Second ',
  'Uptime in days': 'Uptime in Days',
  // terminal
  'Command monitor': 'Command Monitor',
  'Start monitor': 'Start Monitor',
  'Security': 'Security',
  'NONE': 'NONE',
  'SSH': 'SSH',
  'SSL/TLS': 'SSL/TLS',
  'Public key': 'Public key',
  'Private key': 'Private key',
  'Authority': 'Authority',
  'Select File': 'Select File',
  'public key tooltip': 'Public key file, tls-ca-cert-file in Redis server configuration file',
  'private key tooltip': 'Private key file, tls-key-file in Redis server configuration file',
  'authority tooltip': 'Authority file, tls-cert-file in Redis server configuration file',
  'SSH User Name': 'SSH User Name',
  'Passphrase': 'Passphrase',
  'Select export file': 'Please select export file',
  'Config file type': 'Configuration file',
  'All file type': 'All files',
  'Select import file': 'Please select import file',
  'Import configuration file failed': 'Import configuration file failed:{message}',
  'read file failed': 'read file failed',
  'not surpported file format': 'not surpported file format',
  'Import configuration file successed': 'Import configuration file failed',
  'Not a configuration file for xxx': 'Not a configuration file for {appName}',
}