import { useMapEditorStore } from '@/stores/mapEditor'

export function useMapExport() {
  const store = useMapEditorStore()

  async function exportToPng(): Promise<Blob | null> {
    const stage = document.querySelector('.konva-stage') as any
    if (!stage) return null

    const konvaStage = stage.stage || stage
    if (!konvaStage || !konvaStage.toDataURL) return null

    const dataUrl = konvaStage.toDataURL({ pixelRatio: 2 })

    const response = await fetch(dataUrl)
    return response.blob()
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function exportAndDownload() {
    const blob = await exportToPng()
    if (blob) {
      const mapData = store.currentMapData
      const filename = `${mapData?.name || 'map'}-${Date.now()}.png`
      downloadBlob(blob, filename)
    }
  }

  function exportToJson() {
    const mapData = store.currentMapData
    if (!mapData) return

    const json = JSON.stringify(mapData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, `${mapData.name || 'map'}-${Date.now()}.json`)
  }

  function importFromJson(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          resolve(json)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  return {
    exportToPng,
    exportAndDownload,
    exportToJson,
    importFromJson,
  }
}
