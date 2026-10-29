// PDFs from the API (report cards): the API needs the bearer token, so a plain
// link cannot open them. Download saves the file; print opens the system print dialog.
export const usePdf = () => {
  const config = useRuntimeConfig()
  const toast = useToast()

  const fetchPdf = async (path) => {
    const res = await fetch(`${config.public.apiBase}${path}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('unicore_token')}`, Accept: 'application/json' },
    })
    if (!res.ok) {
      let message
      try { message = (await res.json()).message } catch { /* not JSON */ }
      toast.add({ title: 'Could not create the PDF', description: message, color: 'error' })
      return null
    }
    return URL.createObjectURL(await res.blob())
  }

  const download = async (path, filename) => {
    const url = await fetchPdf(path)
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  const print = async (path) => {
    const url = await fetchPdf(path)
    if (!url) return
    const frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    frame.src = url
    frame.onload = () => {
      // Give the PDF viewer a moment to render before printing
      setTimeout(() => {
        try {
          frame.contentWindow.focus()
          frame.contentWindow.print()
        } catch {
          window.open(url, '_blank')   // browsers that cannot print a framed PDF
        }
      }, 300)
    }
    document.body.appendChild(frame)
    setTimeout(() => { frame.remove(); URL.revokeObjectURL(url) }, 120_000)
  }

  return { download, print }
}
