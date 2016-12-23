const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const mkdirp = require('mkdirp')
const log = require('npmlog')

const TMP_DIR = path.join(__dirname, '../tmp/concat')
mkdirp.sync(TMP_DIR)

module.exports = async function joinVideos(paths, out) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg({ logger: log })
    for (let p of paths) {
      command.input(p)
    }
    command
      .on('start', (cmd) => console.log(cmd))
      .on('error', (err, stdout, stderr) => reject(err))
      .on('end', (stdout, stderr) => resolve(out))
      .mergeToFile(out, TMP_DIR)
  })
}
