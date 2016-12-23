import React from 'react'
import store from 'store'
import Layout from '../components/Layout'
import 'isomorphic-fetch'

const API_HOST = 'http://localhost:4000'

export default class extends React.Component {
  constructor(props) {
    super(props)
    const videos = (store.get('videoIDs') || []).reduce((o, id) => {
      o[id] = {
        id,
        video: store.get(`videos-${id}`),
        slice: store.get(`videos-${id}-slice`)
      }
      return o
    }, {})
    this.state = {
      term: store.get('term') || '',
      numVideos: store.get('numVideos') || 25,
      minLength: store.get('minLength') || 200,
      maxLength: store.get('maxLength') || 1000,
      video: store.get('video'),
      videos: videos
    }
  }
  videoURLs() {
    const vids = this.state.videos
    return Object.keys(vids).map(k => vids[k].video).filter(v => !!v)
  }
  sliceURLs() {
    const vids = this.state.videos
    return Object.keys(vids).map(k => vids[k].slice).filter(v => !!v)
  }
  async downloadVideo(id) {
    const r = await fetch(`${API_HOST}/download-video/${id}`)
    const json = await r.json()
    const video = json.video
    store.set(`videos-${id}`, video)
    this.setState(state => {
      state.videos[id].video = video
      return state
    })
  }
  async sliceVideo(id) {
    const r = await fetch(`${API_HOST}/slice-video/${id}?min_length=${this.state.minLength}&max_length=${this.state.maxLength}`)
    const json = await r.json()
    const slice = json.slice
    store.set(`videos-${id}-slice`, slice)
    this.setState(state => {
      state.videos[id].slice = slice
      return state
    })
  }
  async sliceVideos(videos) {
    this.setState({ videos })
    const downloadVideo = this.downloadVideo.bind(this)
    const sliceVideo = this.sliceVideo.bind(this)
    await Promise.all(Object.keys(videos).map(async function(v) {
      await downloadVideo(v)
      await sliceVideo(v)
    }))
    await this.generateVideo()
  }
  async generateVideo() {
    const slices = this.sliceURLs()
    const r = await fetch(`${API_HOST}/generate-video`, {
      method: 'POST',
      body: JSON.stringify({ name: this.state.term, slices })
    })
    const json = await r.json()
    const video = json.video
    store.set('video', video)
    this.setState({ video })
  }
  async submit(e) {
    e.preventDefault()
    if (this.state.term.length) {
      this.setState({ loading: true, error: null })
      const response = await fetch(`${API_HOST}/find-videos?q=${this.state.term}&num_vids=${this.state.numVideos}`)
      const json = await response.json()
      const videos = json.videos.reduce((o, id) => {
        o[id] = { id }
        return o
      }, {})
      store.set('videoIDs', json.videos)
      await this.sliceVideos(videos)
      this.setState({ loading: false })
    }
  }
  updateVal(key, e) {
    this.setState({ [key]: e.target.value })
  }
  error() {
    if (!this.state.error) return null
    return (<div>
      <h4>{this.state.error.message}</h4>
      <pre>{this.state.error.stack}</pre>
    </div>)
  }
  video() {
    return (<video style={{width: '100%'}} controls autoPlay loop>
      <source src={this.state.video} type="video/mp4" />
      Your browser doesn't support HTML5 video tag.
    </video>)
  }
  form() {
    return (<form onSubmit={this.submit.bind(this)}>
      <ul>
        <li>
          <input type="text" placeholder="type something" onChange={this.updateVal.bind(this, 'term')} value={this.state.term} />
          <button type="submit">go</button>
        </li>
        <li>
          <input type="range" onChange={this.updateVal.bind(this, 'numVideos')} value={this.state.numVideos} min="10" max="50" step="1"/>
          <label>{this.state.numVideos} videos</label>
        </li>
        <li>
          <input type="range" onChange={this.updateVal.bind(this, 'minLength')} value={this.state.minLength} min="100" max="3000" step="50"/>
          <label>Minimum {this.state.minLength}ms</label>
        </li>
        <li>
          <input type="range" onChange={this.updateVal.bind(this, 'maxLength')} value={this.state.maxLength} min="300" max="3000" step="50"/>
          <label>Maximum {this.state.maxLength}ms</label>
        </li>
      </ul>
    </form>)
  }
  loader() {
    if (!this.state.loading) return null
    const downloaded = this.videoURLs().length
    const sliced = this.sliceURLs().length
    const total = this.state.numVideos
    return (<div>
        WORKIN ON IT: (downloaded {downloaded}/{total}, sliced {sliced}/{total})
    </div>)
  }
  content() {
    if (this.state.loading) return null
    return this.state.video ? this.video() : this.form()
  }
  reset() {
    store.set('videoIDs', null)
    store.set('video', null)
    this.setState({
      videos: [],
      video: null
    })
  }
  resetButton() {
    if (!this.state.video) return null
    return (<button name="reset" onClick={this.reset.bind(this)} value="reset">reset</button>)
  }
  render() {
    return (<Layout page="index">
      {this.error()}
      {this.content()}
      {this.loader()}
      {this.resetButton()}
    </Layout>)
  }
}
