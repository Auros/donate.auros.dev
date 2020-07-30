import useSWR from 'swr'
import fetch from 'unfetch'
import Donate from '../components/Donate'
import getStripe from '../utils/get-stripejs';
import { Elements } from '@stripe/react-stripe-js'

const fetcher = (url: RequestInfo) => fetch(url).then(r => r.json())

function getCard() {
  const { data, error } = useSWR('https://suit.auros.dev/api/discord/user/218571218545016832', fetcher)

  return {
    user: data,
    isLoading: !error && !data,
    isError: error
  }
}

function Card() {
  const { user, isLoading, isError } = getCard()

  if (isLoading) return null
  if (isError) {
    console.log(isError)
    return null
  }
  return (
    <>
      <h1 className="title">
        Auros
      </h1>
      <h2 className="subtitle">
        Developer and VR Enthusiast
      </h2>
      <figure className="image is-256x256 is-inline-block">
        <img className="is-rounded" src={user.avatar + "?size=512"} />
      </figure>
    </>
  )
}

export default function Home() {
  return (
    <>
      <div className="columns is-mobile is-gapless">
        <div className="column">
          <section className="hero is-info is-fullheight">
            <div className="hero-body">
              <div className="container has-text-right">
                <Card />
              </div>
            </div>
          </section>
        </div>
        <div className="column">
          <section className="hero is-fullheight">
            <div className="hero-body">
              <div className="container">
                <div className="columns">
                  <div className="column is-half">
                    <Elements stripe={getStripe()}>
                      <Donate />
                    </Elements>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
