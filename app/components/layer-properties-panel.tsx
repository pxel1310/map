'use client'

import { useState } from 'react'
import { X, Palette, Eye, Info, Ruler } from 'lucide-react'

interface LayerPropertiesPanelProps {
  layer: any
  isVisible: boolean
  onClose: () => void
  onUpdateLayer: (layerId: string, updates: any) => void
}

export default function LayerPropertiesPanel({
  layer,
  isVisible,
  onClose,
  onUpdateLayer,
}: LayerPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [layerName, setLayerName] = useState(layer?.name || '')
  const [layerDescription, setLayerDescription] = useState(
    layer?.description || '',
  )
  const [layerOpacity, setLayerOpacity] = useState(layer?.opacity || 100)

  if (!isVisible || !layer) return null

  const handleSave = () => {
    onUpdateLayer(layer.id, {
      name: layerName,
      description: layerDescription,
      opacity: layerOpacity,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="brand-card-elegant max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="border-b-2 border-land-secondary/30 p-6">
          <div className="flex items-center justify-between">
            <h3 className="brand-title-main text-xl font-semibold text-land-primary">
              Propiedades de Capa
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-land-secondary/20"
            >
              <X className="h-5 w-5 text-land-primary" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Tabs laterales */}
          <div className="w-48 border-r-2 border-land-secondary/30 bg-land-light/50">
            <div className="space-y-2 p-4">
              <button
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                  activeTab === 'general'
                    ? 'brand-button-primary'
                    : 'brand-button-secondary'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <Info className="h-4 w-4" />
                <span className="brand-body text-sm">General</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                  activeTab === 'style'
                    ? 'brand-button-primary'
                    : 'brand-button-secondary'
                }`}
                onClick={() => setActiveTab('style')}
              >
                <Palette className="h-4 w-4" />
                <span className="brand-body text-sm">Estilo</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                  activeTab === 'view'
                    ? 'brand-button-primary'
                    : 'brand-button-secondary'
                }`}
                onClick={() => setActiveTab('view')}
              >
                <Eye className="h-4 w-4" />
                <span className="brand-body text-sm">Vista</span>
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                  activeTab === 'measure'
                    ? 'brand-button-primary'
                    : 'brand-button-secondary'
                }`}
                onClick={() => setActiveTab('measure')}
              >
                <Ruler className="h-4 w-4" />
                <span className="brand-body text-sm">Medición</span>
              </button>
            </div>
          </div>

          {/* Contenido de tabs */}
          <div className="max-h-[60vh] flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Nombre de la capa
                  </label>
                  <input
                    type="text"
                    value={layerName}
                    onChange={(e) => setLayerName(e.target.value)}
                    className="brand-body w-full rounded-lg border-2 border-land-secondary/30 p-3 focus:border-land-primary focus:outline-none"
                    placeholder="Ingresa el nombre de la capa"
                  />
                </div>

                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Descripción
                  </label>
                  <textarea
                    value={layerDescription}
                    onChange={(e) => setLayerDescription(e.target.value)}
                    rows={4}
                    className="brand-body w-full resize-none rounded-lg border-2 border-land-secondary/30 p-3 focus:border-land-primary focus:outline-none"
                    placeholder="Descripción de la capa..."
                  />
                </div>

                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Tipo de capa: {layer.type?.toUpperCase()}
                  </label>
                  <div className="rounded-lg border-2 border-land-secondary/30 bg-land-light/50 p-3">
                    <p className="brand-body text-sm text-land-tertiary">
                      {layer.features?.length || 0} elementos en esta capa
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Opacidad: {layerOpacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layerOpacity}
                    onChange={(e) => setLayerOpacity(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-land-secondary/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                      Color de línea
                    </label>
                    <input
                      type="color"
                      defaultValue="#FFFFFF"
                      className="h-12 w-full cursor-pointer rounded-lg border-2 border-land-secondary/30"
                    />
                  </div>
                  <div>
                    <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                      Color de relleno
                    </label>
                    <input
                      type="color"
                      defaultValue="#FFFFFF"
                      className="h-12 w-full cursor-pointer rounded-lg border-2 border-land-secondary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Grosor de línea
                  </label>
                  <select className="brand-body w-full rounded-lg border-2 border-land-secondary/30 p-3 focus:border-land-primary focus:outline-none">
                    <option value="1">1 px</option>
                    <option value="2">2 px</option>
                    <option value="3">3 px</option>
                    <option value="4">4 px</option>
                    <option value="5">5 px</option>
                  </select>
                </div>

                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Estilo de línea
                  </label>
                  <select className="brand-body w-full rounded-lg border-2 border-land-secondary/30 p-3 focus:border-land-primary focus:outline-none">
                    <option value="solid">Sólida</option>
                    <option value="dashed">Discontinua</option>
                    <option value="dotted">Punteada</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'view' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border-2 border-land-secondary/30 bg-land-light/50 p-4">
                  <div>
                    <h4 className="brand-body font-medium text-land-primary">
                      Visibilidad
                    </h4>
                    <p className="brand-body text-sm text-land-tertiary">
                      Mostrar/ocultar capa en el mapa
                    </p>
                  </div>
                  <button className="relative h-6 w-12 rounded-full bg-land-primary transition-colors">
                    <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"></div>
                  </button>
                </div>

                <div>
                  <label className="brand-body mb-2 block text-sm font-medium text-land-primary">
                    Rango de zoom
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="brand-body text-xs text-land-tertiary">
                        Zoom mínimo
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        defaultValue="1"
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-land-secondary/30"
                      />
                    </div>
                    <div>
                      <label className="brand-body text-xs text-land-tertiary">
                        Zoom máximo
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        defaultValue="20"
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-land-secondary/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="brand-body mb-3 font-medium text-land-primary">
                    Opciones de etiquetas
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-land-primary"
                      />
                      <span className="brand-body text-sm text-land-primary">
                        Mostrar nombres
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-land-primary"
                      />
                      <span className="brand-body text-sm text-land-primary">
                        Mostrar descripciones
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-land-primary"
                      />
                      <span className="brand-body text-sm text-land-primary">
                        Etiquetas siempre visibles
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'measure' && (
              <div className="space-y-6">
                <div className="rounded-lg border-2 border-land-secondary/30 bg-land-light/50 p-4">
                  <h4 className="brand-body mb-2 font-medium text-land-primary">
                    Información de la capa
                  </h4>
                  <div className="brand-body space-y-2 text-sm text-land-tertiary">
                    <p>Elementos totales: {layer.features?.length || 0}</p>
                    <p>Tipo de geometría: {layer.type}</p>
                    <p>Sistema de coordenadas: WGS84</p>
                  </div>
                </div>

                <div>
                  <h4 className="brand-body mb-3 font-medium text-land-primary">
                    Herramientas de medición
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="brand-button-secondary rounded-lg p-3 text-sm">
                      Medir distancia
                    </button>
                    <button className="brand-button-secondary rounded-lg p-3 text-sm">
                      Medir área
                    </button>
                    <button className="brand-button-secondary rounded-lg p-3 text-sm">
                      Calcular perímetro
                    </button>
                    <button className="brand-button-secondary rounded-lg p-3 text-sm">
                      Obtener coordenadas
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="brand-body mb-3 font-medium text-land-primary">
                    Estadísticas
                  </h4>
                  <div className="brand-body space-y-2 text-sm text-land-tertiary">
                    <div className="flex justify-between">
                      <span>Puntos:</span>
                      <span>
                        {layer.features?.filter(
                          (f: any) => f.geometryType === 'Point',
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Líneas:</span>
                      <span>
                        {layer.features?.filter(
                          (f: any) => f.geometryType === 'LineString',
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Polígonos:</span>
                      <span>
                        {layer.features?.filter(
                          (f: any) => f.geometryType === 'Polygon',
                        ).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t-2 border-land-secondary/30 p-6">
          <button
            onClick={onClose}
            className="brand-button-secondary rounded-lg px-6 py-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="brand-button-primary rounded-lg px-6 py-2"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
