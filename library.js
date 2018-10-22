const https = require('https')
var log = {}
var options = {}
var controller = {}
var sandbox = false

exports = module.exports = (params) => {
  sandbox = params.sandbox
  log = require('./log')(params).log

  options = {
    port: 443,
    encoding: 'utf-8',
    headers: {
      'Content-Type': 'application/json',
      'MerchantId': params.MerchantId,
      'MerchantKey': params.MerchantKey,
      'RequestId': params.RequestId || ''
    }
  }

  return controller
}

// Realiza um request https
controller.get = function (optionsData, data) {
  return new Promise((resolve, reject) => {
    var requestOptions = Object.assign(options, optionsData)
    const dataPost = JSON.stringify(data)
    requestOptions.headers['Content-Length'] = Buffer.byteLength(dataPost)
    var req = https.request(requestOptions, (res) => {
      const statusCode = res.statusCode
      var chunks = []

      res.on('data', function (chunk) {
        chunks.push(chunk)
      })

      res.on('end', function () {
        var body = Buffer.concat(chunks)
        var response = ''
        try {
          if (options.method === 'PUT' && chunks.length === 0 && statusCode === 200) return resolve({statusCode: statusCode})
          if (chunks.length > 0){
            response = JSON.parse(body)
          }
          log('retorno cielo', response)
        } catch (err) {
          return reject(err)
        }
        log('res.on(end)', response)
        return resolve(response)
      })
    })
    req.write(dataPost)
    req.on('error', (err) => {
      const errorMessage = {
        msg: 'Erro na requisicao para a Cielo',
        request: requestOptions,
        data: dataPost,
        erro: err
      }
      log('erro no request ', errorMessage)
      return reject(errorMessage)
    })
    req.end()
  })
}

controller.getHostname = function (type) {
  switch (type) {
    case 'requisicao':
      if (sandbox) {
        return 'apisandbox.cieloecommerce.cielo.com.br'
      } else {
        return 'api.cieloecommerce.cielo.com.br'
      }
    case 'consulta':
      if (sandbox) {
        return 'apiquerysandbox.cieloecommerce.cielo.com.br'
      } else {
        return 'apiquery.cieloecommerce.cielo.com.br'
      }
    default:
      return 'ERROR - HOSTNAME OPTIONS INVÁLIDO'
  }
}