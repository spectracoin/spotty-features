import fetchMock from 'fetch-mock'
import MockDate from 'mockdate'
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow, mount } from 'enzyme'

import Config from '../../src/public/config'
import Spotify from '../../src/components/spotify.jsx'

import mockLocalStorage from '../mocks/local-storage'
import waitForRequests from '../helpers/wait-for-requests'

import MeResponse from '../fixtures/spotify/me'
import MultiAudioFeaturesResponse from '../fixtures/spotify/multi-audio-features'
import SavedTracksResponse from '../fixtures/spotify/saved-tracks'
import UnauthorizedResponse from '../fixtures/spotify/unauthorized'

const initialLocalData = {
  'spotify-token': '123abc' ,
  'spotify-user': MeResponse.display_name,
  'spotify-avatar-url': MeResponse.images[0].url
}

describe('Spotify', () => {
  const tracksPath = 'me/tracks?limit=50&offset=0'
  let component = null
  let path = null
  let store = null
  let featuresReq = null

  const routeChange = newPath => {
    path = newPath
  }

  beforeEach(() => {
    MockDate.set('3/15/2017')

    store = { 'spotty-features': JSON.stringify(initialLocalData) }
    mockLocalStorage(store)

    const path = 'audio-features?ids=4nDfc6F2uVcc6wdG7kBzWO'
    featuresReq = fetchMock.get(`${Config.spotify.apiUrl}/${path}`,
                                MultiAudioFeaturesResponse)

    component = <Spotify numWeeks={1} router={{ push: routeChange }} />
  })

  afterEach(fetchMock.restore)

  test('matches snapshot', () => {
    fetchMock.get(`${Config.spotify.apiUrl}/${tracksPath}`, SavedTracksResponse)

    const tree = renderer.create(component).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('shows recently saved tracks', done => {
    const tracksReq = fetchMock.get(`${Config.spotify.apiUrl}/${tracksPath}`,
                                    SavedTracksResponse)

    const wrapper = mount(component)
    expect(wrapper.find('.week-list-container').length).toBe(0)

    waitForRequests([tracksReq, featuresReq], done, () => {
      expect(wrapper.find('.week-list-container').length).toBe(1)
    })
  })

  test('handles expired token when fetching tracks', done => {
    const resp = { body: UnauthorizedResponse, status: 401 }
    const tracksReq = fetchMock.get(`${Config.spotify.apiUrl}/${tracksPath}`, resp)

    mount(component)

    waitForRequests([tracksReq], done, () => {
      expect(path).toBe('/')
      expect(store).toEqual({ 'spotty-features': '{}' })
    })
  })
})
