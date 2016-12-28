const fs = require('fs')
const path = require('path')
const log = require('npmlog')
const mkdirp = require('mkdirp')
const { json } = require('micro')
const joinVideos = require('../lib/join-videos')

const unlink = p => new Promise(r => fs.unlink(p, r))
const exists = p => new Promise(r => fs.exists(p, r))

const VIDEO_DIR = path.join(__dirname, '../tmp/videos')
mkdirp.sync(VIDEO_DIR)

module.exports.POST = async function generateVideo(req, res) {
  const data = await json(req)
  const name = data.name
  const slices = data.slices.map(slice => path.join(VIDEO_DIR, slice))
  const stamp = new Date().getDate() // cache for 1 day
  const videoName = `${name}-${stamp}.mp4`
  const generatedFile = path.join(VIDEO_DIR, videoName)
  const skip = await exists(generatedFile)
  if (skip) return { video: videoName }
  await joinVideos(slices, generatedFile)
  await Promise.all(data.slices.map(async function(slice) {
    log.silly(`cleaning up ${slice}`)
    await unlink(path.join(VIDEO_DIR, slice))
    await unlink(path.join(VIDEO_DIR, slice.replace('-slice', '')))
  }))
  return { video: videoName }
}
