import 'whatwg-fetch'

const apiUrl = 'https://api.spotify.com/v1'

export default class SpotifyApi {
  constructor(token) {
    this.token = token
    this.headers = { Authorization: `Bearer ${this.token}` }
  }

  me() {
    const url = `${apiUrl}/me`
    console.log('GET', url)
    return fetch(url, {
      headers: this.headers
    }).then(response => response.json())
  }
}