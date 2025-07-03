'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Menu, Upload, Download, Edit3, Globe, X, Ruler } from 'lucide-react'

// Importar componentes dinámicamente
const MapEditor = dynamic(() => import('./components/map-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-lg text-white">Cargando mapa satelital...</div>
    </div>
  ),
})

const FileDropZone = dynamic(() => import('./components/file-drop-zone'), {
  ssr: false,
})

const LayerPropertiesPanel = dynamic(
  () => import('./components/layer-properties-panel'),
  {
    ssr: false,
  },
)

const AdvancedDrawingTools = dynamic(
  () => import('./components/advanced-drawing-tools'),
  {
    ssr: false,
  },
)

const LayerManager = dynamic(() => import('./components/layer-manager'), {
  ssr: false,
})

interface MapLayer {
  id: string
  name: string
  visible: boolean
  type: 'kml' | 'drawing'
  data?: any
  kmlLayer?: any
  features?: any[]
  opacity?: number
  description?: string
}

interface LayerFolder {
  id: string
  name: string
  expanded: boolean
  layers: string[]
}

export default function KMLMapEditor() {
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [folders, setFolders] = useState<LayerFolder[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showSidebar, setShowSidebar] = useState(false)
  const [showFileDropZone, setShowFileDropZone] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [selectedLayerForProperties, setSelectedLayerForProperties] =
    useState<MapLayer | null>(null)
  const [measurementMode, setMeasurementMode] = useState<string | null>(null)

  const handleFileLoad = useCallback((file: File, content: string) => {
    const newLayer: MapLayer = {
      id: Date.now().toString(),
      name: file.name,
      visible: true,
      type: 'kml',
      data: content,
      opacity: 100,
      description: `Importado desde ${file.name}`,
    }
    setLayers((prev) => [...prev, newLayer])
  }, [])

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer,
      ),
    )
  }

  const removeLayer = (layerId: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId))
  }

  const updateLayer = (layerId: string, updates: Partial<MapLayer>) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, ...updates } : layer,
      ),
    )
  }

  const createFolder = () => {
    const newFolder: LayerFolder = {
      id: Date.now().toString(),
      name: `Nueva Carpeta ${folders.length + 1}`,
      expanded: true,
      layers: [],
    }
    setFolders((prev) => [...prev, newFolder])
  }

  const toggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, expanded: !folder.expanded }
          : folder,
      ),
    )
  }

  const moveLayerToFolder = (layerId: string, folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id === folderId) {
          return { ...folder, layers: [...folder.layers, layerId] }
        }
        return {
          ...folder,
          layers: folder.layers.filter((id) => id !== layerId),
        }
      }),
    )
  }

  const handleMeasureDistance = () => {
    setMeasurementMode('distance')
    setSelectedTool('measure-distance')
  }

  const handleMeasureArea = () => {
    setMeasurementMode('area')
    setSelectedTool('measure-area')
  }

  const exportKML = () => {
    console.log('Exporting KML...')
  }

  return (
    <div className="relative flex h-screen bg-land-light">
      {/* Botón de menú hamburguesa con estilo mejorado */}
      <button
        className="fixed left-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-lg border border-land-secondary/30 bg-land-primary/95 text-land-light shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-land-tertiary"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Botón de importar archivo */}
      <button
        className="fixed right-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-lg border border-land-secondary/30 bg-land-primary/95 text-land-light shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-land-tertiary"
        onClick={() => setShowFileDropZone(true)}
      >
        <Upload className="h-5 w-5" />
      </button>

      {/* Panel lateral expandido */}
      <div
        className={`brand-sidebar fixed left-0 top-0 z-30 h-full w-[480px] transform shadow-2xl transition-transform duration-500 ease-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del sidebar con logo */}
        <div className="relative border-b-2 border-land-secondary/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="brand-map-icon"></div>
              <div>
                <h1 className="brand-title-main text-xl font-bold text-land-light">
                  THE LAND BUSINESS
                </h1>
                <p className="brand-subtitle text-sm text-land-secondary">
                  TULUM
                </p>
              </div>
            </div>
            <button
              className="rounded-lg p-2 text-land-light transition-colors hover:bg-land-light/10"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">
            <h2 className="brand-title-main text-lg text-land-secondary">
              Map Editor Pro
            </h2>
            <p className="brand-body text-xs text-land-light/70">
              Editor profesional de mapas KML avanzado
            </p>
          </div>
        </div>

        <div className="h-full space-y-4 overflow-y-auto p-4 pb-20">
          {/* Administrador de capas avanzado */}
          <LayerManager
            layers={layers}
            folders={folders}
            onToggleLayerVisibility={toggleLayerVisibility}
            onRemoveLayer={removeLayer}
            onOpenLayerProperties={setSelectedLayerForProperties}
            onCreateFolder={createFolder}
            onToggleFolder={toggleFolder}
            onMoveLayerToFolder={moveLayerToFolder}
          />

          {/* Herramientas de dibujo avanzadas */}
          <AdvancedDrawingTools
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            onCreateFolder={createFolder}
            onMeasureDistance={handleMeasureDistance}
            onMeasureArea={handleMeasureArea}
          />

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => setShowFileDropZone(true)}
              className="brand-button-secondary flex w-full items-center justify-center gap-3 rounded-lg p-3"
            >
              <Upload className="h-4 w-4" />
              <span className="brand-body">Importar KML/KMZ</span>
            </button>

            <button
              onClick={exportKML}
              className="brand-button-primary flex w-full items-center justify-center gap-3 rounded-lg p-3"
            >
              <Download className="h-4 w-4" />
              <span className="brand-body">Exportar Proyecto</span>
            </button>
          </div>

          {/* Información del proyecto */}
          <div className="brand-card-elegant rounded-xl p-4">
            <h4 className="brand-title-main mb-2 font-semibold text-land-primary">
              Información del Proyecto
            </h4>
            <div className="brand-body space-y-2 text-sm text-land-tertiary">
              <div className="flex justify-between">
                <span>Capas totales:</span>
                <span>{layers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Carpetas:</span>
                <span>{folders.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Elementos totales:</span>
                <span>
                  {layers.reduce(
                    (acc, layer) => acc + (layer.features?.length || 0),
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Área del mapa */}
      <div className="relative flex-1">
        <MapEditor
          layers={layers}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          onLayersChange={setLayers}
        />
      </div>

      {/* Modal de bienvenida mejorado */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="brand-card-elegant w-full max-w-lg rounded-2xl p-8">
            <div className="space-y-6 text-center">
              {/* Logo y branding */}
              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="brand-map-icon scale-75"></div>
                <div className="text-left">
                  <h1 className="brand-title-main text-xl font-bold text-land-primary">
                    THE LAND BUSINESS
                  </h1>
                  <p className="brand-subtitle text-sm text-land-secondary">
                    TULUM
                  </p>
                </div>
              </div>

              <h2 className="brand-title-main text-2xl font-bold text-land-primary">
                Map Editor Pro
              </h2>

              <p className="brand-body text-land-tertiary">
                Editor profesional de mapas KML con herramientas avanzadas
                similares a Google Earth Pro
              </p>

              <div className="space-y-4 rounded-xl bg-land-light/50 p-4 text-left">
                <div className="flex items-center gap-4">
                  <Globe className="h-6 w-6 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-sm text-land-primary">
                    Vista satelital de alta resolución
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Upload className="h-6 w-6 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-sm text-land-primary">
                    Importa y organiza archivos KML/KMZ
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Edit3 className="h-6 w-6 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-sm text-land-primary">
                    Herramientas de dibujo profesionales
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Ruler className="h-6 w-6 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-sm text-land-primary">
                    Medición de distancias y áreas
                  </span>
                </div>
              </div>

              <p className="brand-body text-xs text-land-tertiary">
                Funcionalidades avanzadas: organización en carpetas, propiedades
                de capas, herramientas de medición
              </p>

              <button
                onClick={() => setShowWelcome(false)}
                className="brand-button-primary w-full rounded-xl p-4 text-lg"
              >
                <span className="brand-body font-medium">Comenzar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de propiedades de capa */}
      <LayerPropertiesPanel
        layer={selectedLayerForProperties}
        isVisible={!!selectedLayerForProperties}
        onClose={() => setSelectedLayerForProperties(null)}
        onUpdateLayer={updateLayer}
      />

      {/* Zona de drop de archivos */}
      <FileDropZone
        onFileLoad={handleFileLoad}
        isVisible={showFileDropZone}
        onClose={() => setShowFileDropZone(false)}
      />
    </div>
  )
}
