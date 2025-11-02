const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT

export interface EventMetadata {
  name: string
  description: string
  location: string
  date: string
  time: string
  image: string
  maxTickets: number
  ticketPrice: number
  category: string
  creator: string
}

export const uploadImageToPinata = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to upload image to Pinata')
  }

  const data = await response.json()
  return data.IpfsHash
}

export const uploadMetadataToPinata = async (metadata: EventMetadata): Promise<string> => {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name}-metadata`
      }
    })
  })

  if (!response.ok) {
    throw new Error('Failed to upload metadata to Pinata')
  }

  const data = await response.json()
  return data.IpfsHash
}