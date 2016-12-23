const { send } = require('micro')
const log = require('npmlog')
const match = require('fs-router')(__dirname + '/api')

log.level = 'silly'

module.exports = async function(req, res) {
  let matched = match(req)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  if (matched) {
    try {
      return await matched(req, res)
    } catch (err) {
      console.error(err)
      return send(res, 500, { error: err.message, stack: err.stack })
    }
  }
  send(res, 404, { error: 'Not found' })
}
