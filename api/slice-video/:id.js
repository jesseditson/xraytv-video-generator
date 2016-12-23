const fs = require('fs')
const path = require('path')
const log = require('npmlog')
const mkdirp = require('mkdirp')
const sliceVideo = require('../../lib/slice-video')

const VIDEO_DIR = path.join(__dirname, '../../tmp/videos')
mkdirp.sync(VIDEO_DIR)

async function slice(id, minLength, maxLength, retries=0) {
  const sliceName = `${id}-slice.mp4`
  const vidPath = path.join(VIDEO_DIR, `${id}.mp4`)
  const slicePath = path.join(VIDEO_DIR, sliceName)
  log.info(`slicing ${id}`)
  await sliceVideo(vidPath, slicePath, minLength, maxLength)
  log.info(`${id} slice saved to ${slicePath}`)
  return sliceName
}

module.exports = async function sliceVideo(req, res) {
  const minLength = req.query.min_length
  const maxLength = req.query.max_length
  const id = req.params.id
  const s = await slice(id, minLength, maxLength)
  return { slice: s }
}
