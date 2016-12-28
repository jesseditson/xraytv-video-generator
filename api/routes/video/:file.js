const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { send } = require('micro')

const exists = p => new Promise(r => fs.exists(p, r))

const VIDEO_DIR = path.join(__dirname, '../../tmp/videos')
mkdirp.sync(VIDEO_DIR)

module.exports = async function video(req, res) {
  const videoFile = path.join(VIDEO_DIR, decodeURIComponent(req.params.file))
  const e = await exists(videoFile)
  if (e) {
    const stream = fs.createReadStream(videoFile)
    send(res, 200, stream)
  } else {
    send(res, 404, { error: 'Not Found' })
  }
}
