const fs = require('fs')
const path = require('path')
const log = require('npmlog')
const mkdirp = require('mkdirp')
const { json } = require('micro')
const joinVideos = require('../lib/join-videos')

const exists = p => new Promise(r => fs.exists(p, r))

const VIDEO_DIR = path.join(__dirname, '../tmp/videos')
const STATIC_DIR = path.join(__dirname, '../static/videos')
mkdirp.sync(VIDEO_DIR)
mkdirp.sync(STATIC_DIR)

module.exports.POST = async function generateVideo(req, res) {
  const data = await json(req)
  const name = data.name
  const slices = data.slices.map(slice => path.join(VIDEO_DIR, slice))
  const stamp = new Date().getDate() // cache for 1 day
  const videoName = `${name}-${stamp}.mp4`
  const generatedFile = path.join(STATIC_DIR, videoName)
  const videoPath = `/static/videos/${videoName}`
  const skip = await exists(generatedFile)
  if (skip) return { video: videoPath }
  const generated = await joinVideos(slices, generatedFile)
  return { video: videoPath }
}
