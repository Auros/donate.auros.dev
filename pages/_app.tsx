import type { AppProps } from 'next/app'
import '../styles/scroll.css'
import 'bulma'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
