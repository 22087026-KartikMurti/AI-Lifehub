const getBaseUrl = () => {
  // Use the browser's origin when running on the client.
  if(typeof window !== 'undefined') {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_BASE_URL
}

export default getBaseUrl