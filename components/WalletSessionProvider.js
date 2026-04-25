import { createContext, useContext, useEffect, useRef, useState } from 'react'

const WalletSessionContext = createContext(null)

function getInjectedProvider() {
  if (typeof window === 'undefined') {
    return null
  }

  const { ethereum } = window

  if (!ethereum) {
    return null
  }

  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return ethereum.providers.find((provider) => provider.isMetaMask) || ethereum.providers[0]
  }

  return ethereum
}

function getWalletLabel(provider) {
  if (!provider) {
    return 'Wallet'
  }

  if (provider.isMetaMask) {
    return 'MetaMask'
  }

  if (provider.isCoinbaseWallet) {
    return 'Coinbase Wallet'
  }

  if (provider.isBraveWallet) {
    return 'Brave Wallet'
  }

  if (provider.isRabby) {
    return 'Rabby'
  }

  return 'Injected wallet'
}

function getChainName(chainId) {
  switch (chainId) {
    case '0x1':
      return 'Ethereum'
    case '0x89':
      return 'Polygon'
    case '0xa':
      return 'OP Mainnet'
    case '0xa4b1':
      return 'Arbitrum'
    case '0x2105':
      return 'Base'
    default:
      return chainId ? `Chain ${Number.parseInt(chainId, 16)}` : 'Unknown chain'
  }
}

export function WalletSessionProvider({ children }) {
  const [status, setStatus] = useState('idle')
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [walletLabel, setWalletLabel] = useState('Wallet')
  const [hasProvider, setHasProvider] = useState(false)
  const latestAddressRef = useRef('')

  useEffect(() => {
    latestAddressRef.current = address
  }, [address])

  const syncSession = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const payload = await response.json()

      if (!payload.authenticated) {
        setAddress('')
        setStatus('idle')
        return null
      }

      setAddress(payload.address || '')
      setChainId(payload.chainId || '')
      setStatus('connected')
      setErrorMessage('')

      return payload
    } catch {
      setStatus('idle')
      return null
    }
  }

  const signMessage = async (provider, message, address) => {
    try {
      return await provider.request({
        method: 'personal_sign',
        params: [message, address],
      })
    } catch (error) {
      if (error?.code !== -32602) {
        throw error
      }

      return provider.request({
        method: 'personal_sign',
        params: [address, message],
      })
    }
  }

  useEffect(() => {
    const provider = getInjectedProvider()

    if (!provider) {
      setHasProvider(false)
      setWalletLabel('Wallet')
      return undefined
    }

    let disposed = false

    setHasProvider(true)
    setWalletLabel(getWalletLabel(provider))

    const restoreSession = async () => {
      const session = await syncSession()

      if (!session || disposed) {
        return
      }

      const nextChainId = provider.chainId || (await provider.request({ method: 'eth_chainId' }).catch(() => ''))
      setChainId(nextChainId || session.chainId || '')
    }

    const handleAccountsChanged = async (accounts) => {
      const nextAddress = accounts[0] || ''

      if (!nextAddress) {
        await fetch('/api/auth/logout', { method: 'POST' })
        setAddress('')
        setStatus('idle')
        return
      }

      if (latestAddressRef.current && latestAddressRef.current.toLowerCase() !== nextAddress.toLowerCase()) {
        await fetch('/api/auth/logout', { method: 'POST' })
        setAddress('')
        setStatus('idle')
        setErrorMessage('Wallet account changed. Sign in again to continue.')
        return
      }

      setAddress(nextAddress)
    }

    const handleChainChanged = (nextChainId) => {
      setChainId(nextChainId || '')
    }

    const handleDisconnect = async () => {
      setAddress('')
      setStatus('idle')
      setErrorMessage('')
      await fetch('/api/auth/logout', { method: 'POST' })
    }

    restoreSession()

    if (provider.on) {
      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)
    }

    return () => {
      disposed = true

      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged)
        provider.removeListener('chainChanged', handleChainChanged)
        provider.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [])

  const connect = async () => {
    const provider = getInjectedProvider()

    if (!provider) {
      setHasProvider(false)
      setStatus('unsupported')
      setErrorMessage('No injected wallet detected in this browser.')
      return
    }

    try {
      setHasProvider(true)
      setWalletLabel(getWalletLabel(provider))
      setStatus('connecting')
      setErrorMessage('')

      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const nextAddress = accounts[0]
      const nextChainId = provider.chainId || (await provider.request({ method: 'eth_chainId' }))

      if (!nextAddress) {
        setStatus('idle')
        return
      }

      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: nextAddress }),
      })

      const noncePayload = await nonceResponse.json()

      if (!nonceResponse.ok) {
        throw new Error(noncePayload.error || 'Failed to start wallet login')
      }

      const signature = await signMessage(provider, noncePayload.message, nextAddress)

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: nextAddress,
          chainId: nextChainId,
          signature,
        }),
      })

      const verifyPayload = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyPayload.authenticated) {
        throw new Error(verifyPayload.error || 'Wallet login failed')
      }

      setAddress(verifyPayload.address)
      setChainId(nextChainId || '')
      setStatus('connected')
    } catch (error) {
      const nextMessage = error?.code === 4001 ? 'Wallet signature was rejected.' : error?.message || 'Wallet login failed.'

      setStatus('error')
      setErrorMessage(nextMessage)
    }
  }

  const disconnect = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAddress('')
    setStatus('idle')
    setErrorMessage('')
  }

  return (
    <WalletSessionContext.Provider
      value={{
        address,
        chainId,
        chainName: getChainName(chainId),
        connect,
        disconnect,
        errorMessage,
        hasProvider,
        isConnected: status === 'connected',
        status,
        walletLabel,
      }}
    >
      {children}
    </WalletSessionContext.Provider>
  )
}

export function useWalletSession() {
  const context = useContext(WalletSessionContext)

  if (!context) {
    throw new Error('useWalletSession must be used within WalletSessionProvider')
  }

  return context
}