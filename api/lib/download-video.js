const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')

const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch'
const exists = p => new Promise(r => fs.exists(p, r))

module.exports = async function downloadVideo(id, filePath) {
  const cached = await exists(filePath)
  return new Promise((resolve, reject) => {
    if (cached) return resolve(filePath)
    const stream = ytdl(`${YOUTUBE_VIDEO_URL}?v=${id}`, { quality: [18] })
    stream.on('error', reject)
    stream.on('end', () => resolve(filePath))
    stream.pipe(fs.createWriteStream(filePath))
  })
}
