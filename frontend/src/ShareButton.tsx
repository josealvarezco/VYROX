import { useRef, useState, type ReactNode } from 'react'
import { CopyIcon, CrossIcon, DownloadIcon } from './icons'

const ACTION =
  'flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0'

// A button that draws a shareable card and previews it, ready to copy to the clipboard or download as a PNG.
export function ShareButton({
  draw,
  filename,
  label,
  className,
  children,
}: {
  draw: () => Promise<HTMLCanvasElement>
  filename: string
  label: string
  className: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null)
  const [note, setNote] = useState('')

  const open = async () => {
    setNote('')
    try {
      const canvas = await draw()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Empty image')
      setImage({ blob, url: URL.createObjectURL(blob) })
    } catch {
      setNote('No se pudo generar la imagen.')
    }
    dialog.current?.showModal()
  }

  const copy = async () => {
    if (!image) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image.blob })])
      setNote('¡Imagen copiada!')
    } catch {
      setNote('Este navegador no deja copiar imágenes: descárgala.')
    }
  }

  const close = () => {
    if (image) URL.revokeObjectURL(image.url)
    setImage(null)
  }

  return (
    <>
      <button type="button" onClick={open} aria-label={label} title={label} className={className}>
        {children}
      </button>
      <dialog
        ref={dialog}
        onClose={close}
        aria-label="Vista previa para compartir"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-modal p-4 text-ink"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">Compartir</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Cerrar vista previa"
            className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 ease-out hover:bg-surface-2 hover:text-ink"
          >
            <CrossIcon />
          </button>
        </div>
        {image && <img src={image.url} alt="Tarjeta de VYROX lista para compartir" className="mt-3 w-full rounded-2xl" />}
        {image && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={copy} className={`${ACTION} border border-line bg-surface text-ink hover:bg-surface-2`}>
              <CopyIcon />
              Copiar al portapapeles
            </button>
            <a href={image.url} download={filename} className={`${ACTION} bg-yellow text-forest`}>
              <DownloadIcon />
              Descargar PNG
            </a>
          </div>
        )}
        <p aria-live="polite" className="mt-2 min-h-5 text-center text-sm font-semibold text-gold">
          {note}
        </p>
      </dialog>
    </>
  )
}
