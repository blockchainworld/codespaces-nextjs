import '../global.css'
import { WalletSessionProvider } from '../components/WalletSessionProvider'

export default function MyApp({ Component, pageProps }) {
  return (
    <WalletSessionProvider>
      <Component {...pageProps} />
    </WalletSessionProvider>
  )
}
