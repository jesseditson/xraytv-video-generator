const { send } = require('micro')
const qs = require('querystring')
const { GOOGLE_KEY } = require('load-secrets')
require('isomorphic-fetch')

const GOOGLE_URL = 'https://content.googleapis.com/youtube/v3/search'

module.exports = async function findVideos(search, max, req) {
  const query = qs.stringify({
    maxResults: max,
    part: 'snippet',
    q: search,
    type: 'video',
    videoEmbeddable: true,
    key: GOOGLE_KEY,
    safeSearch: 'none',
    videoSyndicated: true
  })
  const headers = {}
  if (req) headers.referrer = `https://${req.headers.host}`
  const r = await fetch(`${GOOGLE_URL}?${query}`, { headers })
  const json = await r.json()
  const items = json.items
  if (!items) {
    console.log('Error: no items: ', json)
    throw new Error('No videos returned')
  }
  return items.map(v => v.id.videoId)
}
