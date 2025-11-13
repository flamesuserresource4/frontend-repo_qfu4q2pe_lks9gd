import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children, subtitle }) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function ArtworkCard({ art, onInquire }) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
      {art.images?.[0] ? (
        <img src={art.images[0]} alt={art.title} className="h-56 w-full object-cover" />
      ) : (
        <div className="h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{art.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{art.story || 'No story added yet.'}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-700">{art.media || 'Mixed media'}</span>
          <span className="text-sm font-medium text-indigo-600">{art.price_range || 'Price on request'}</span>
        </div>
        <button
          onClick={() => onInquire(art)}
          className="mt-4 w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700"
        >
          Start Conversation
        </button>
      </div>
    </div>
  )
}

function SupplyCard({ s, onAdd }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold text-gray-900">{s.title}</h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-900 font-semibold">${s.price.toFixed(2)}</span>
        <button onClick={() => onAdd(s)} className="rounded-lg bg-gray-900 text-white py-1.5 px-3 text-sm hover:bg-black">Add</button>
      </div>
    </div>
  )
}

export default function App() {
  const [artworks, setArtworks] = useState([])
  const [supplies, setSupplies] = useState([])
  const [cart, setCart] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [a, s, p] = await Promise.all([
          fetch(`${API_BASE}/api/artworks`).then(r => r.json()),
          fetch(`${API_BASE}/api/supplies`).then(r => r.json()),
          fetch(`${API_BASE}/api/posts`).then(r => r.json()),
        ])
        setArtworks(a)
        setSupplies(s)
        setPosts(p)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(p => p._id === item._id)
      if (existing) {
        return prev.map(p => p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  async function inquire(art) {
    const name = prompt('Your name')
    const email = prompt('Your email')
    if (!name || !email) return
    await fetch(`${API_BASE}/api/purchase-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artwork_id: art._id, buyer_name: name, buyer_email: email, message: `Interested in ${art.title}` })
    })
    alert('Inquiry sent to the artist. They will reach out to you.')
  }

  async function checkout() {
    if (!cart.length) return
    const name = prompt('Shipping name')
    const email = prompt('Email')
    const address = prompt('Shipping address')
    if (!name || !email || !address) return
    const items = cart.map(c => ({ supply_id: c._id, title: c.title, price: c.price, quantity: c.quantity }))
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyer_name: name, buyer_email: email, shipping_address: address, items })
    })
    if (res.ok) {
      setCart([])
      alert('Order placed!')
    }
  }

  async function createPost() {
    const text = prompt('Share an update with the community:')
    if (!text) return
    await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 'demo', text })
    })
    const p = await fetch(`${API_BASE}/api/posts`).then(r => r.json())
    setPosts(p)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded bg-indigo-600 inline-block" />
            <span className="font-semibold">ArtLink</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-700">
            <a href="#art" className="hover:text-indigo-600">Artworks</a>
            <a href="#supplies" className="hover:text-indigo-600">Supplies</a>
            <a href="#community" className="hover:text-indigo-600">Community</a>
          </nav>
          <div className="text-sm font-medium">Cart ({cart.reduce((a,c)=>a+c.quantity,0)})</div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">A marketplace built for artists and art lovers</h1>
            <p className="mt-4 text-gray-700">Sell and discover artworks through stories and conversations, shop quality art supplies, and connect with a community that understands your craft.</p>
            <div className="mt-6 flex gap-3">
              <a href="#art" className="rounded-lg bg-indigo-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700">Explore Art</a>
              <a href="#community" className="rounded-lg bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-black">Join Community</a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-purple-100 border" />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl border shadow p-4 w-56">
              <p className="text-sm font-semibold">Conversation-first buying</p>
              <p className="text-xs text-gray-600 mt-1">Start a private thread with the artist before any purchase.</p>
            </div>
          </div>
        </div>
      </section>

      <div id="art">
        <Section title="Artworks" subtitle="Discover pieces through their stories, not just thumbnails.">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map(a => (
                <ArtworkCard key={a._id} art={a} onInquire={inquire} />
              ))}
            </div>
          )}
        </Section>
      </div>

      <div id="supplies" className="bg-white border-t border-b">
        <Section title="Art Supplies" subtitle="Brushes, paints, canvases and more.">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplies.map(s => (
                <SupplyCard key={s._id} s={s} onAdd={addToCart} />
              ))}
            </div>
          )}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {cart.length ? `${cart.length} item(s) in cart` : 'Your cart is empty'}
            </div>
            <button onClick={checkout} className="rounded-lg bg-indigo-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50" disabled={!cart.length}>
              Checkout
            </button>
          </div>
        </Section>
      </div>

      <div id="community">
        <Section title="Community" subtitle="Share progress, ask questions, celebrate wins.">
          <div className="mb-4">
            <button onClick={createPost} className="rounded-lg bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-black">Create Post</button>
          </div>
          <div className="grid gap-4">
            {posts.map(p => (
              <div key={p._id} className="rounded-xl border bg-white p-4">
                <p className="text-gray-900">{p.text}</p>
                <div className="text-xs text-gray-500 mt-2">by {p.author_id}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <footer className="py-12 text-center text-sm text-gray-500">© {new Date().getFullYear()} ArtLink — built for artists</footer>
    </div>
  )
}
