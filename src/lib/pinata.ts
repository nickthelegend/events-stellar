const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2NmUzZTMwZi1kMTUxLTQ5YmItOTMxOC1hZDlkMDRhOWQ2OGQiLCJlbWFpbCI6InRlc3Rpbmd0ZXNsYTdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjJlNzgzNTBlMWZlZjJmZjdjNjk0Iiwic2NvcGVkS2V5U2VjcmV0IjoiY2I0ZWUwMmU2NjY5NmUxZDY4YWU3MzJiYzk3YjY2NjhlODU5OTQzZDY5ZGM2ZWQ2ZjJjNGRlY2ZkZjkxY2ZlYyIsImV4cCI6MTc5MzY0OTUyOH0.dCCtxSDaPnmXVJo5gacBtccM6cDmWzJRaOyIy51sqEA'

export interface EventMetadata {
  name: string
  description: string
  location: string
  date: string
  time: string
  image: string
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