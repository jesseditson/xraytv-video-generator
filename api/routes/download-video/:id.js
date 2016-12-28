const fs = require('fs')
const path = require('path')
const log = require('npmlog')
const mkdirp = require('mkdirp')
const downloadVideo = require('../../lib/download-video')

const VIDEO_DIR = path.join(__dirname, '../../tmp/videos')
mkdirp.sync(VIDEO_DIR)
const MAX_RETRIES = 5

const rmfile = f => new Promise(r => fs.unlink(f, r))

async function download(id, retries=0) {
  const videoName = `${id}.mp4`
  const vidPath = path.join(VIDEO_DIR, videoName)
  try {
    log.silly(`downloading ${id}`)
    await downloadVideo(id, vidPath)
    log.silly(`${id} saved to ${vidPath}`)
  } catch (e) {
    await rmfile(vidPath)
    if (retries < MAX_RETRIES) return await download(id, ++retries)
    throw e
  }
  return videoName
}

module.exports = async function downloadVideo(req, res) {
  const id = req.params.id
  const video = await download(id)
  return { video }
}
