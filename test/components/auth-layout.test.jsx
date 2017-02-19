import fetchMock from 'fetch-mock'
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

import Config from '../../src/public/config'
import AuthLayout from '../../src/components/auth-layout.jsx'

import mockLocalStorage from '../mocks/local-storage'

import MeResponse from '../fixtures/spotify/me'

function props(push) {
  return {
    children: <div>hey</div>,
    router: {push}
  }
}

describe('AuthLayout', () => {
  let component = null
  let path = null
  let meRequest = null
  let timer = null

  function waitForRequests(mockedRequests) {
    return new Promise(resolve => {
      if (mockedRequests.length < 1) {
        resolve()
        return
      }

      timer = setInterval(() => {
        const notYetCalled = mockedRequests.map(req => req.called()).
          filter(isCalled => !isCalled)
        if (notYetCalled.length < 1) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  }

  beforeEach(() => {
    meRequest = fetchMock.get(`${Config.spotify.apiUrl}/me`, MeResponse)

    const localData = { 'spotify-token': '123abc' }
    const store = { 'spotty-features': JSON.stringify(localData) }
    mockLocalStorage(store)

    const routeChange = newPath => {
      path = newPath
    }
    component = <AuthLayout {...props(routeChange)} />
  })

  test('matches snapshot', () => {
    const tree = renderer.create(component).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('has title', () => {
    const title = shallow(component).find('.is-brand')
    expect(title.text()).toBe('Spotty Features')
  })

  test('shows authenticated user', done => {
    waitForRequests([meRequest]).then(() => {
      const user = shallow(component).find('.username')
      expect(user.text()).toBe(MeResponse.display_name)
      done()
    })
  })
})
