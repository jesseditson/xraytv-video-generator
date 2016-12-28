const { send } = require('micro')
const qs = require('querystring')
const log = require('npmlog')
const { GOOGLE_KEY } = require('load-secrets')
require('isomorphic-fetch')

const GOOGLE_URL = 'https://content.googleapis.com/youtube/v3/search'

const RESULTS_PAGE = 1

module.exports = async function findVideos(search, max, results=[], req, pageToken, pageNum=0) {
  let remainder = 0
  if (max > 50) {
    remainder = max - 50
    max = 50
  }
  const obj = {
    maxResults: max,
    part: 'snippet',
    q: search,
    type: 'video',
    videoEmbeddable: true,
    safeSearch: 'moderate',
    videoSyndicated: true,
    relevanceLanguage: 'en',
    videoDuration: 'short',
    videoDimension: '2d'
  }
  if (pageToken) obj.pageToken = pageToken
  log.silly('searching for', obj, pageNum)
  obj.key = GOOGLE_KEY
  const query = qs.stringify(obj)
  const headers = {}
  if (req) headers.referrer = `https://${req.headers.host}`
  const r = await fetch(`${GOOGLE_URL}?${query}`, { headers })
  const json = await r.json()
  if (++pageNum >= RESULTS_PAGE) {
    const items = json.items
    if (!items) {
      console.log('Error: no items: ', json)
      throw new Error('No videos returned')
    }
    results = results.concat(items.map(v => v.id.videoId))
    if (remainder > 0) {
      return findVideos(search, remainder, results, req, json.nextPageToken, pageNum)
    } else {
      return results
    }
  } else {
    log.silly('seeking page...')
    return findVideos(search, max, results, req, json.nextPageToken, pageNum)
  }
}
