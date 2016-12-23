const fs = require('fs')
const path = require('path')
const log = require('npmlog')
const mkdirp = require('mkdirp')
const { send } = require('micro')
const findVideos = require('../lib/find-videos')
const sliceVideo = require('../lib/slice-video')
const joinVideos = require('../lib/join-videos')
const downloadVideo = require('../lib/download-video')

const rmfile = f => new Promise(r => fs.unlink(f, r))

const CLEANUP = process.env.CLEANUP
const VIDEO_DIR = path.join(__dirname, '../tmp/videos')
const STATIC_DIR = path.join(__dirname, '../static/videos')
mkdirp.sync(VIDEO_DIR)
mkdirp.sync(STATIC_DIR)
const MAX_RETRIES = 5

async function getVideo(id, minLength, maxLength, retries=0) {
  const vidPath = path.join(VIDEO_DIR, `${id}.mp4`)
  const slicePath = path.join(VIDEO_DIR, `${id}-slice.mp4`)
  try {
    log.info(`downloading ${id}`)
    await downloadVideo(id, vidPath)
    log.info(`${id} saved to ${vidPath}`)
    log.info(`slicing ${id}`)
    await sliceVideo(vidPath, slicePath, minLength, maxLength)
    log.info(`${id} slice saved to ${slicePath}`)
  } catch (e) {
    await rmfile(vidPath)
    if (retries < MAX_RETRIES) return await getVideo(id, ++retries)
    throw e
  }
  if (CLEANUP) await rmfile(vidPath)
  return slicePath
}

module.exports = async function generateVideo(req, res) {
  const search = encodeURIComponent(req.query.q).replace(/%20/g, '+')
  const numVideos = req.query.num_vids
  const minLength = req.query.min_length
  const maxLength = req.query.max_length
  if (!numVideos || !minLength || !maxLength) throw new Error('Invalid params')
  log.info(`finding videos matching ${search}`)
  const videos = await findVideos(search, numVideos)
  log.info(`found ${videos.length} videos`)
  const slices = await Promise.all(videos.map(v => getVideo(v, minLength, maxLength)))
  log.info(`generated ${slices.length} slices for ${search}`)
  const videoName = `${search}-${numVideos}.mp4`
  const generatedFile = path.join(STATIC_DIR, videoName)
  const generated = await joinVideos(slices, generatedFile)
  if (CLEANUP) await Promise.all(slices.map(rmfile))
  return { video: `/static/videos/${videoName}` }
}
