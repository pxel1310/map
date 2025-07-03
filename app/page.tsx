'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Menu, Upload, Download, Edit3, Globe, Ruler } from 'lucide-react'

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

const MobileDrawingTools = dynamic(
  () => import('./components/mobile-drawing-tools'),
  {
    ssr: false,
  },
)

const MobileLayerManager = dynamic(
  () => import('./components/mobile-layer-manager'),
  {
    ssr: false,
  },
)

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
  const [showBottomPanel, setShowBottomPanel] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState('layers')
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-land-light">
      {/* Header móvil */}
      <div className="z-30 flex items-center justify-between border-b border-land-secondary/30 bg-land-primary/95 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src="/logo_st.png" alt="Logo" className="h-6 w-6 rounded-full" />
          <div>
            <h1 className="brand-title-main text-sm font-bold text-land-light">
              THE LAND BUSINESS
            </h1>
            <p className="brand-subtitle text-xs text-land-secondary">TULUM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-land-light/20 text-land-light transition-all duration-300 hover:bg-land-light/30"
            onClick={() => setShowFileDropZone(true)}
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-land-light/20 text-land-light transition-all duration-300 hover:bg-land-light/30"
            onClick={() => setShowBottomPanel(!showBottomPanel)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Área del mapa */}
      <div className="relative flex-1">
        <MapEditor
          layers={layers}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          onLayersChange={setLayers}
        />
      </div>

      {/* Panel inferior móvil */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transform border-t-2 border-land-secondary/30 bg-white transition-transform duration-300 ease-out ${
          showBottomPanel ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '60vh' }}
      >
        {/* Handle para arrastrar */}
        <div className="flex justify-center bg-land-light/50 py-2">
          <button
            onClick={() => setShowBottomPanel(!showBottomPanel)}
            className="h-1 w-12 rounded-full bg-land-tertiary/50"
          />
        </div>

        {/* Tabs del panel inferior */}
        <div className="flex border-b border-land-secondary/30">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeBottomTab === 'layers'
                ? 'border-b-2 border-land-primary bg-land-light/50 text-land-primary'
                : 'text-land-tertiary'
            }`}
            onClick={() => setActiveBottomTab('layers')}
          >
            Capas
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeBottomTab === 'tools'
                ? 'border-b-2 border-land-primary bg-land-light/50 text-land-primary'
                : 'text-land-tertiary'
            }`}
            onClick={() => setActiveBottomTab('tools')}
          >
            Herramientas
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeBottomTab === 'info'
                ? 'border-b-2 border-land-primary bg-land-light/50 text-land-primary'
                : 'text-land-tertiary'
            }`}
            onClick={() => setActiveBottomTab('info')}
          >
            Info
          </button>
        </div>

        {/* Contenido del panel inferior */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeBottomTab === 'layers' && (
            <MobileLayerManager
              layers={layers}
              folders={folders}
              onToggleLayerVisibility={toggleLayerVisibility}
              onRemoveLayer={removeLayer}
              onOpenLayerProperties={setSelectedLayerForProperties}
              onCreateFolder={createFolder}
              onToggleFolder={toggleFolder}
              onMoveLayerToFolder={moveLayerToFolder}
            />
          )}

          {activeBottomTab === 'tools' && (
            <MobileDrawingTools
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              onCreateFolder={createFolder}
              onMeasureDistance={handleMeasureDistance}
              onMeasureArea={handleMeasureArea}
            />
          )}

          {activeBottomTab === 'info' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-land-light/50 p-4">
                <h4 className="brand-title-main mb-3 font-semibold text-land-primary">
                  Información del Proyecto
                </h4>
                <div className="brand-body space-y-3 text-sm text-land-tertiary">
                  <div className="flex items-center justify-between">
                    <span>Capas totales:</span>
                    <span className="font-medium text-land-primary">
                      {layers.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Carpetas:</span>
                    <span className="font-medium text-land-primary">
                      {folders.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Elementos totales:</span>
                    <span className="font-medium text-land-primary">
                      {layers.reduce(
                        (acc, layer) => acc + (layer.features?.length || 0),
                        0,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowFileDropZone(true)}
                  className="brand-button-secondary flex w-full items-center justify-center gap-3 rounded-xl p-4 text-base"
                >
                  <Upload className="h-5 w-5" />
                  <span className="brand-body">Importar KML/KMZ</span>
                </button>

                <button
                  onClick={exportKML}
                  className="brand-button-primary flex w-full items-center justify-center gap-3 rounded-xl p-4 text-base"
                >
                  <Download className="h-5 w-5" />
                  <span className="brand-body">Exportar Proyecto</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar panel */}
      {showBottomPanel && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setShowBottomPanel(false)}
          style={{ bottom: '60vh' }}
        />
      )}

      {/* Modal de bienvenida móvil */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="space-y-4 text-center">
              {/* Logo y branding */}
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-land-secondary">
                  <div className="h-4 w-4 rounded-full bg-land-primary"></div>
                </div>
                <div className="text-left">
                  <h1 className="brand-title-main text-lg font-bold text-land-primary">
                    THE LAND BUSINESS
                  </h1>
                  <p className="brand-subtitle text-xs text-land-secondary">
                    TULUM
                  </p>
                </div>
              </div>

              <h2 className="brand-title-main text-xl font-bold text-land-primary">
                Map Editor Mobile
              </h2>

              <p className="brand-body text-sm text-land-tertiary">
                Editor profesional de mapas KML optimizado para dispositivos
                móviles
              </p>

              <div className="space-y-3 rounded-xl bg-land-light/50 p-4 text-left">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-xs text-land-primary">
                    Vista satelital táctil
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-xs text-land-primary">
                    Importa archivos KML/KMZ
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Edit3 className="h-5 w-5 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-xs text-land-primary">
                    Herramientas táctiles
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 flex-shrink-0 text-land-primary" />
                  <span className="brand-body text-xs text-land-primary">
                    Medición precisa
                  </span>
                </div>
              </div>

              <p className="brand-body text-xs text-land-tertiary">
                Usa el menú ☰ para acceder a todas las funciones
              </p>

              <button
                onClick={() => setShowWelcome(false)}
                className="brand-button-primary w-full rounded-xl p-4 text-base"
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
