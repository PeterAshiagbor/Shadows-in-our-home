import './globals.css'

export const metadata = {
  title: 'UK Delegation Directory — Global Entrepreneurship Congress',
  description:
    'The UK delegation to the Global Entrepreneurship Congress: who is in the room, what they are looking for, and how to connect before the event.',
  robots: { index: false, follow: false },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#101f3c',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>
        <header className="site-header">
          <div className="inner">
            <div className="kicker">Global Entrepreneurship Congress</div>
            <h1>
              <a href="/">UK Delegation Directory</a>
            </h1>
            <p className="strapline">
              Who&rsquo;s in the UK delegation, what they&rsquo;re looking for,
              and how to connect — before the congress, not after it.
            </p>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="inner">
            <span>
              Built by Kickstart Global for the GEN UK delegation. Visible to
              anyone with the link; not listed on search engines.
            </span>
            <span>
              To update or remove your profile at any time, email{' '}
              <a href="mailto:peter@kickstartglobal.com">
                peter@kickstartglobal.com
              </a>{' '}
              — removals are actioned same day.
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
