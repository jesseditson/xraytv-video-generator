import React from 'react'
import Layout from '../components/Layout'
import 'isomorphic-fetch'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      term: '',
      numVideos: 25,
      minLength: 200,
      maxLength: 1000
    }
  }
  async submit(e) {
    e.preventDefault()
    if (this.state.term.length) {
      this.setState({ loading: true, error: null })
      try {
        const response = await fetch(`http://localhost:4000/generate-video?q=${this.state.term}&num_vids=${this.state.numVideos}&min_length=${this.state.minLength}&max_length=${this.state.maxLength}`)
        const json = await response.json()
        this.setState({ video: json.video })
      } catch (e) {
        console.log(e)
        this.setState({ video: null, error: e })
      }
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
    return (<video style={{width: '100%'}} controls autoplay autostart loop>
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
  render() {
    let content = this.state.video ? this.video() : this.form()
    return (<Layout page="index">
      {this.error()}
      {this.state.loading ? 'WORKIN ON IT' : content}
    </Layout>)
  }
}
