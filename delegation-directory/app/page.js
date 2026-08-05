import DirectoryGrid from '../components/DirectoryGrid'
import { fetchDelegates } from '../lib/data'

export const revalidate = 60

export default async function Home() {
  const delegates = await fetchDelegates()
  return (
    <>
      <p className="result-count">
        {delegates.length} delegates · tap a card for their full profile. On the
        delegation but haven&rsquo;t claimed your profile? Use the personal link
        you were sent, or ask in the delegation WhatsApp group.
      </p>
      <DirectoryGrid delegates={delegates} />
    </>
  )
}
