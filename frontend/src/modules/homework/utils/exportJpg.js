import { toJpeg } from 'html-to-image'

export const safeFileName = (text) =>
  String(text ?? '').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim() || 'report'

export const downloadNodeAsJpg = async (node, fileName) => {
  if (document.fonts?.ready) await document.fonts.ready 

  const dataUrl = await toJpeg(node, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#a9ddf7',
    cacheBust: true,
  })

  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}