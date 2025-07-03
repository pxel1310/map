"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import JSZip from "jszip"

interface FileDropZoneProps {
  onFileLoad: (file: File, content: string) => void
  isVisible: boolean
  onClose: () => void
}

export default function FileDropZone({ onFileLoad, isVisible, onClose }: FileDropZoneProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processKMZFile = async (file: File): Promise<string> => {
    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)

      // Buscar el archivo KML principal (usualmente doc.kml)
      let kmlContent = ""
      const kmlFiles = Object.keys(zipContent.files).filter(
          (name) => name.toLowerCase().endsWith(".kml") && !zipContent.files[name].dir,
      )

      if (kmlFiles.length === 0) {
        throw new Error("No se encontró archivo KML dentro del KMZ")
      }

      // Usar el primer archivo KML encontrado, preferiblemente doc.kml
      const mainKmlFile = kmlFiles.find((name) => name.toLowerCase().includes("doc.kml")) || kmlFiles[0]

      const kmlFile = zipContent.files[mainKmlFile]
      if (!kmlFile) {
        throw new Error("No se pudo acceder al archivo KML")
      }

      kmlContent = await kmlFile.async("text")

      if (!kmlContent || kmlContent.trim().length === 0) {
        throw new Error("El archivo KML dentro del KMZ está vacío")
      }

      return kmlContent
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Error al procesar el archivo KMZ")
    }
  }

  const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setIsLoading(true)
        setError(null)

        try {
          let content: string

          // Validar tamaño del archivo
          if (file.size > 50 * 1024 * 1024) {
            throw new Error("El archivo es demasiado grande. Máximo 50MB permitido.")
          }

          if (file.name.toLowerCase().endsWith(".kmz")) {
            content = await processKMZFile(file)
          } else if (file.name.toLowerCase().endsWith(".kml")) {
            content = await file.text()
          } else {
            throw new Error("Formato de archivo no soportado. Use archivos .kml o .kmz")
          }

          // Validar que el contenido no esté vacío
          if (!content || content.trim().length === 0) {
            throw new Error("El archivo está vacío o no se pudo leer correctamente")
          }

          // Validar que el contenido sea XML válido
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(content, "text/xml")
          const parseError = xmlDoc.getElementsByTagName("parsererror")

          if (parseError.length > 0) {
            throw new Error("El archivo no contiene XML válido")
          }

          // Verificar que sea un archivo KML válido
          if (!content.toLowerCase().includes("<kml") && !content.toLowerCase().includes("<?xml")) {
            throw new Error("El archivo no es un KML válido")
          }

          onFileLoad(file, content)
          onClose()
        } catch (error) {
          console.error("Error reading file:", error)
          setError(error instanceof Error ? error.message : "Error desconocido al procesar el archivo")
        } finally {
          setIsLoading(false)
        }
      },
      [onFileLoad, onClose],
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.google-earth.kml+xml": [".kml"],
      "application/vnd.google-earth.kmz": [".kmz"],
      "application/xml": [".kml"],
      "text/xml": [".kml"],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB máximo
  })

  if (!isVisible) return null

  const getDropZoneClassName = () => {
    const baseClass = "border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 "

    if (isDragReject) {
      return baseClass + "border-red-500 bg-red-50"
    }
    if (isDragAccept) {
      return baseClass + "border-land-primary bg-land-primary/10"
    }
    if (isDragActive) {
      return baseClass + "border-land-primary bg-land-primary/5"
    }

    return baseClass + "border-land-secondary hover:border-land-primary hover:bg-land-primary/5"
  }

  return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg brand-card-elegant rounded-2xl">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-land-primary brand-title-main">Importar Archivo KML/KMZ</h3>
              <button onClick={onClose} className="hover:bg-land-secondary/20 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5 text-land-primary" />
              </button>
            </div>

            <div {...getRootProps()} className={getDropZoneClassName()}>
              <input {...getInputProps()} />

              <div className="flex flex-col items-center gap-6 py-8">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-land-primary"></div>
                ) : (
                    <Upload className="w-16 h-16 text-land-primary" />
                )}

                <div className="text-center">
                  <p className="text-xl font-medium text-land-primary mb-2 brand-title-main">
                    {isLoading
                        ? "Procesando archivo..."
                        : isDragActive
                            ? "Suelta el archivo aquí"
                            : "Arrastra tu archivo aquí"}
                  </p>
                  <p className="text-sm text-land-tertiary brand-body">o haz clic para seleccionar un archivo</p>
                </div>

                <div className="flex items-center gap-3 text-sm text-land-tertiary brand-body bg-land-light/50 px-4 py-2 rounded-lg">
                  <FileText className="w-5 h-5" />
                  Formatos: .kml, .kmz (máx. 50MB)
                </div>
              </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl">
                  <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium brand-body">Error</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-2 brand-body">{error}</p>
                </div>
            )}

            <div className="mt-6 text-sm text-land-tertiary brand-body space-y-2 bg-land-light/30 p-4 rounded-xl">
              <p>• Los archivos KML se visualizarán en el mapa satelital</p>
              <p>• Los archivos KMZ se descomprimen automáticamente</p>
              <p>• Compatible con archivos de Google Earth</p>
              <p>• Soporte para múltiples capas y elementos</p>
            </div>
          </div>
        </div>
      </div>
  )
}
