const log = require('npmlog')
const ffmpeg = require('fluent-ffmpeg')

module.exports = async function reverseVideo(path, out) {
  return new Promise((resolve, reject) => {
    ffmpeg({ logger: log })
      .input(path)
      .outputOptions(
        '-vf', 'reverse',
        '-af', 'areverse'
      )
      .on('start', (cmd) => log.info(cmd))
      .on('error', (err, stdout, stderr) => reject(err))
      .on('end', (stdout, stderr) => resolve(out))
      .save(out)
  })
}
