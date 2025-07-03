"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import {
  Menu,
  Upload,
  Download,
  Layers,
  Edit3,
  MapPin,
  Square,
  Circle,
  Trash2,
  Eye,
  EyeOff,
  Satellite,
  Globe,
  X,
} from "lucide-react"

// Importar componentes dinámicamente
const MapEditor = dynamic(() => import("./components/map-editor"), {
  ssr: false,
  loading: () => (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando mapa satelital...</div>
      </div>
  ),
})

const FileDropZone = dynamic(() => import("./components/file-drop-zone"), {
  ssr: false,
})

interface MapLayer {
  id: string
  name: string
  visible: boolean
  type: "kml" | "drawing"
  data?: any
  kmlLayer?: any
}

export default function KMLMapEditor() {
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [selectedTool, setSelectedTool] = useState<string>("select")
  const [showSidebar, setShowSidebar] = useState(false)
  const [showFileDropZone, setShowFileDropZone] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  const handleFileLoad = useCallback((file: File, content: string) => {
    const newLayer: MapLayer = {
      id: Date.now().toString(),
      name: file.name,
      visible: true,
      type: "kml",
      data: content,
    }
    setLayers((prev) => [...prev, newLayer])
  }, [])

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  const removeLayer = (layerId: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId))
  }

  const exportKML = () => {
    console.log("Exporting KML...")
  }

  return (
      <div className="flex h-screen bg-land-light relative">
        {/* Botón de menú hamburguesa con estilo mejorado */}
        <button
            className="fixed top-6 left-6 z-40 w-12 h-12 bg-land-primary/95 hover:bg-land-tertiary text-land-light rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-land-secondary/30"
            onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Botón de importar archivo */}
        <button
            className="fixed top-6 right-6 z-40 w-12 h-12 bg-land-primary/95 hover:bg-land-tertiary text-land-light rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-land-secondary/30"
            onClick={() => setShowFileDropZone(true)}
        >
          <Upload className="w-5 h-5" />
        </button>

        {/* Panel lateral con diseño mejorado */}
        <div
            className={`fixed left-0 top-0 h-full w-96 brand-sidebar shadow-2xl transform transition-transform duration-500 ease-out z-30 ${
                showSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Header del sidebar con logo */}
          <div className="p-6 border-b-2 border-land-secondary/30 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="brand-map-icon"></div>
                <div>
                  <h1 className="text-xl font-bold text-land-light brand-title-main">THE LAND BUSINESS</h1>
                  <p className="text-sm text-land-secondary brand-subtitle">TULUM</p>
                </div>
              </div>
              <button
                  className="text-land-light hover:bg-land-light/10 p-2 rounded-lg transition-colors"
                  onClick={() => setShowSidebar(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4">
              <h2 className="text-lg text-land-secondary brand-title-main">Map Editor</h2>
              <p className="text-xs text-land-light/70 brand-body">Editor profesional de mapas KML</p>
            </div>
          </div>

          <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Sección de capas con diseño elegante */}
            <div className="brand-card-elegant rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-5 h-5 text-land-primary" />
                <h3 className="font-semibold brand-title-main text-land-primary">Capas del Mapa</h3>
              </div>

              {layers.length === 0 ? (
                  <div className="text-center py-6">
                    <Satellite className="w-12 h-12 text-land-tertiary mx-auto mb-3" />
                    <p className="text-sm text-land-tertiary brand-body mb-4">No hay capas cargadas</p>
                    <button
                        className="px-4 py-2 brand-button-secondary rounded-lg text-sm"
                        onClick={() => setShowFileDropZone(true)}
                    >
                      <Upload className="w-4 h-4 mr-2 inline" />
                      Importar KML
                    </button>
                  </div>
              ) : (
                  <div className="space-y-3">
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            className="flex items-center justify-between p-3 rounded-lg border-2 border-land-secondary/30 bg-land-light/50 hover:bg-land-light/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-land-secondary/20 transition-colors"
                                onClick={() => toggleLayerVisibility(layer.id)}
                            >
                              {layer.visible ? (
                                  <Eye className="w-4 h-4 text-land-primary" />
                              ) : (
                                  <EyeOff className="w-4 h-4 text-land-tertiary" />
                              )}
                            </button>
                            <span className="text-sm brand-body text-land-primary truncate max-w-[180px]">{layer.name}</span>
                          </div>
                          <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => removeLayer(layer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            {/* Herramientas de dibujo */}
            <div className="brand-card-elegant rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Edit3 className="w-5 h-5 text-land-primary" />
                <h3 className="font-semibold brand-title-main text-land-primary">Herramientas</h3>
              </div>

              <div className="space-y-3">
                <button
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedTool === "marker" ? "brand-button-primary" : "brand-button-secondary"
                    }`}
                    onClick={() => setSelectedTool("marker")}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="brand-body">Marcador</span>
                </button>

                <button
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedTool === "polygon" ? "brand-button-primary" : "brand-button-secondary"
                    }`}
                    onClick={() => setSelectedTool("polygon")}
                >
                  <Square className="w-4 h-4" />
                  <span className="brand-body">Polígono</span>
                </button>

                <button
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedTool === "circle" ? "brand-button-primary" : "brand-button-secondary"
                    }`}
                    onClick={() => setSelectedTool("circle")}
                >
                  <Circle className="w-4 h-4" />
                  <span className="brand-body">Círculo</span>
                </button>

                <div className="border-t-2 border-land-secondary/30 pt-3 mt-3">
                  <button
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          selectedTool === "select" ? "brand-button-primary" : "brand-button-secondary"
                      }`}
                      onClick={() => setSelectedTool("select")}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="brand-body">Seleccionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de exportar */}
            <button
                onClick={exportKML}
                className="w-full brand-button-secondary p-3 rounded-lg flex items-center justify-center gap-3"
            >
              <Download className="w-4 h-4" />
              <span className="brand-body">Exportar KML</span>
            </button>
          </div>
        </div>

        {/* Overlay para cerrar sidebar */}
        {showSidebar && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20" onClick={() => setShowSidebar(false)} />
        )}

        {/* Área del mapa */}
        <div className="flex-1 relative">
          <MapEditor
              layers={layers}
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              onLayersChange={setLayers}
          />
        </div>

        {/* Modal de bienvenida mejorado */}
        {showWelcome && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg brand-card-elegant rounded-2xl p-8">
                <div className="text-center space-y-6">
                  {/* Logo y branding */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="brand-map-icon scale-75"></div>
                    <div className="text-left">
                      <h1 className="text-xl font-bold text-land-primary brand-title-main">THE LAND BUSINESS</h1>
                      <p className="text-sm text-land-secondary brand-subtitle">TULUM</p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-land-primary brand-title-main">Editor de Mapas KML</h2>

                  <p className="text-land-tertiary brand-body">
                    Visualiza y edita archivos KML con vista satelital de alta resolución para proyectos inmobiliarios en
                    Tulum
                  </p>

                  <div className="space-y-4 text-left bg-land-light/50 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <Globe className="w-6 h-6 text-land-primary flex-shrink-0" />
                      <span className="text-sm brand-body text-land-primary">Vista satelital de Google Maps</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Upload className="w-6 h-6 text-land-primary flex-shrink-0" />
                      <span className="text-sm brand-body text-land-primary">Importa archivos KML/KMZ</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Edit3 className="w-6 h-6 text-land-primary flex-shrink-0" />
                      <span className="text-sm brand-body text-land-primary">Herramientas de dibujo profesionales</span>
                    </div>
                  </div>

                  <p className="text-xs text-land-tertiary brand-body">
                    Para comenzar, usa el menú ☰ o arrastra un archivo KML al mapa
                  </p>

                  <button
                      onClick={() => setShowWelcome(false)}
                      className="w-full brand-button-primary p-4 rounded-xl text-lg"
                  >
                    <span className="brand-body font-medium">Comenzar</span>
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Zona de drop de archivos */}
        <FileDropZone
            onFileLoad={handleFileLoad}
            isVisible={showFileDropZone}
            onClose={() => setShowFileDropZone(false)}
        />
      </div>
  )
}
