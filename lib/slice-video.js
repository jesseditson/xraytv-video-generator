const fs = require('fs')
const log = require('npmlog')
const ffmpeg = require('fluent-ffmpeg')

let cycle = 0
function padColor() {
  return ++cycle % 2 ? 'black' : 'white'
}

function start(duration, max) {
  const leadTime = duration * 0.1
  const innerDuration = duration - max - (leadTime * 2)
  return (Math.random() * innerDuration) + leadTime
}

function length(max, min) {
  return min + (Math.random() * (max - min))
}

/**
 * Gets a random slice from a video and saves it
 * Usage:
 * let vid = await sliceVideo(path, out, [min], [max])
 *
 * does not slice from the first 10% or last 10% to avoid common lead in and out bits
 */

module.exports = async function sliceVideo(path, out, min=500, max=1200) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, async function(err, metadata) {
      log.silly(`slicing ${path}, max duration ${max}`)
      let duration = metadata && metadata.format && metadata.format.duration
      if (err || !duration) return reject(err || new Error('Failed to find video duration'))
      duration = parseFloat(duration) * 1000
      log.silly(`video is of ${duration} length`)
      const color = padColor()
      log.silly(`using color ${color}`)
      const size = length(max, min)
      log.silly(`slice length: ${size}`)
      const seek = start(duration, size)
      log.silly(`slice starts at ${seek}`)
      const command = ffmpeg({ logger: log })
        .input(path)
        .seekInput(seek / 1000)
        .duration(size / 1000)
        // .size('1024x576')
        // ffmpeg -ss 295.5888237255273 -i /Users/jesseditson/code/jesseditson/xraytv-video-generator/tmp/videos/0yDcz2r-9QY.mp4 -y -filter:v scale=w='if(gt(a,1.7777777777777777),1024,trunc(576*a/2)*2)':h='if(lt(a,1.7777777777777777),576,trunc(1024/a/2)*2)',pad=w=1024:h=576:x='if(gt(a,1.7777777777777777),0,(1024-iw)/2)':y='if(lt(a,1.7777777777777777),0,(576-ih)/2)':color=black -t 0.3122249395734807 -vf scale=1024x576,setsar=1:1 /Users/jesseditson/code/jesseditson/xraytv-video-generator/tmp/videos/0yDcz2r-9QY-slice.mp4
        .outputOptions(
          '-vf', 'scale=1024x576,setsar=1:1'
        )
        .autopad(color)
        .on('start', (cmd) => console.log(cmd))
        .on('error', (err, stdout, stderr) => reject(err))
        .on('end', (stdout, stderr) => resolve(out))
        .save(out)
    })
  })
}
