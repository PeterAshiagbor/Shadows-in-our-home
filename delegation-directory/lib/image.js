// Client-side photo preparation: resize to max 800px on the long edge and
// re-encode as JPEG before upload. iOS converts HEIC to JPEG on file input in
// Safari; anything the browser cannot decode surfaces a clear error instead.
export async function prepareImage(file, maxEdge = 800, quality = 0.85) {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('That file is too large. Please choose a photo under 20MB.')
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () =>
        reject(
          new Error(
            "We couldn't read that image. Please try a JPG or PNG instead."
          )
        )
      i.src = url
    })
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob) throw new Error("We couldn't process that image.")
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1])
      reader.onerror = () => reject(new Error("We couldn't process that image."))
      reader.readAsDataURL(blob)
    })
    return { base64, contentType: 'image/jpeg', previewUrl: canvas.toDataURL('image/jpeg', quality) }
  } finally {
    URL.revokeObjectURL(url)
  }
}
