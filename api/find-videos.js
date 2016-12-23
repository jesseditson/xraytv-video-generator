const log = require('npmlog')
const { send } = require('micro')
const findVideos = require('../lib/find-videos')

module.exports = async function generateVideo(req, res) {
  const search = encodeURIComponent(req.query.q).replace(/%20/g, '+')
  const numVideos = req.query.num_vids
  log.silly(`finding videos matching ${search}`)
  const videos = await findVideos(search, numVideos)
  log.silly(`found ${videos.length} videos`)
  return { videos }
}
