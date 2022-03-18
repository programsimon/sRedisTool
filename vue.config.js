const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: './',
  devServer: {
    // can be overwritten by process.env.HOST
    host: '0.0.0.0',
    port: 8080
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      // .set('src', resolve('src'))
      .set('m', resolve('src/models'))
      .set('c', resolve('src/components'))
      .set('v', resolve('src/views'))
      .set('a', resolve('src/assets'))
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'sRedisTool',
        win: {
          icon: './public/logo.ico',
          publisherName: 'Simon Gao',
          artifactName: '${productName}-${version}-win-${arch}.${ext}',
          target: [
            {
              target: 'portable', // 目标包类型
              arch: ['x64','ia32']
            },
            {
              target: 'msi', // 目标包类型
              arch: ['x64','ia32']
            }
          ]
        },
        linux: {
          icon: './public/logo.ico',
          artifactName: '${productName}-${version}-linux-${arch}.${ext}',
          target: [
            {
              target: 'tar.gz', // 目标包类型
              arch: ['x64']
            }
          ]
        }
      },
      nodeIntegration: true
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  },
  css: {
    sourceMap: true
  }
}
