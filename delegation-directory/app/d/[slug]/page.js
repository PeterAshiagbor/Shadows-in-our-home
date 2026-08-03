import Link from 'next/link'
import { notFound } from 'next/navigation'
import Monogram from '../../../components/Monogram'
import { fetchDelegateBySlug } from '../../../lib/data'
import { categoryLabel } from '../../../lib/categories'
import { photoUrl } from '../../../lib/config'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params
  const d = await fetchDelegateBySlug(slug)
  if (!d) return { title: 'Delegate not found' }
  return { title: `${d.first_name} ${d.last_name} — UK Delegation Directory` }
}

export default async function DelegateProfile({ params }) {
  const { slug } = await params
  const d = await fetchDelegateBySlug(slug)
  if (!d) notFound()

  const published = d.claim_status === 'published'

  return (
    <div className="profile">
      <Link href="/" className="back-link">
        ← Back to the delegation
      </Link>
      <div className="profile-card">
        <div className="profile-head">
          {d.photo_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="photo"
              src={photoUrl(d.photo_path)}
              alt={`${d.first_name} ${d.last_name}`}
            />
          ) : (
            <Monogram firstName={d.first_name} lastName={d.last_name} />
          )}
          <div>
            <h2>
              {d.first_name} {d.last_name}
            </h2>
            <div className="role-line">
              {[d.role, d.organisation].filter(Boolean).join(' · ') ||
                'UK delegation'}
            </div>
            {categoryLabel(d.category) && (
              <span className="badge">{categoryLabel(d.category)}</span>
            )}
          </div>
        </div>
        <div className="profile-body">
          {d.summary && (
            <div className="profile-section">
              <h3>About</h3>
              <p>{d.summary}</p>
            </div>
          )}
          {d.looking_for && (
            <div className="profile-section">
              <h3>Looking for at GEC</h3>
              <p>{d.looking_for}</p>
            </div>
          )}
          {d.can_help_with && (
            <div className="profile-section">
              <h3>Can help with</h3>
              <p>{d.can_help_with}</p>
            </div>
          )}
          {!published && (
            <div className="note">
              {d.first_name} hasn&rsquo;t completed their profile yet. If this
              is you, use the personal claim link you were sent to add your
              photo and what you&rsquo;re looking for at GEC.
            </div>
          )}
          {d.linkedin_url && (
            <div>
              <a
                className="linkedin-btn"
                href={d.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
