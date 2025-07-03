'use client'

import { useState } from 'react'
import {
  Layers,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreVertical,
} from 'lucide-react'

interface LayerFolder {
  id: string
  name: string
  expanded: boolean
  layers: string[]
}

interface MobileLayerManagerProps {
  layers: any[]
  folders: LayerFolder[]
  onToggleLayerVisibility: (layerId: string) => void
  onRemoveLayer: (layerId: string) => void
  onOpenLayerProperties: (layer: any) => void
  onCreateFolder: () => void
  onToggleFolder: (folderId: string) => void
  onMoveLayerToFolder: (layerId: string, folderId: string) => void
}

export default function MobileLayerManager({
  layers,
  folders,
  onToggleLayerVisibility,
  onRemoveLayer,
  onOpenLayerProperties,
  onCreateFolder,
  onToggleFolder,
  onMoveLayerToFolder,
}: MobileLayerManagerProps) {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [showLayerMenu, setShowLayerMenu] = useState<string | null>(null)

  const getLayersInFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    if (!folder) return []
    return layers.filter((layer) => folder.layers.includes(layer.id))
  }

  const getUnorganizedLayers = () => {
    const organizedLayerIds = folders.flatMap((folder) => folder.layers)
    return layers.filter((layer) => !organizedLayerIds.includes(layer.id))
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de nueva carpeta */}
      <div className="flex items-center justify-between">
        <h3 className="brand-title-main font-semibold text-land-primary">
          Administrador de Capas
        </h3>
        <button
          onClick={onCreateFolder}
          className="rounded-lg bg-land-secondary/20 p-2 transition-colors hover:bg-land-secondary/30"
          title="Nueva carpeta"
        >
          <FolderPlus className="h-5 w-5 text-land-primary" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Carpetas */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="overflow-hidden rounded-xl bg-land-light/50"
          >
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => onToggleFolder(folder.id)} className="p-1">
                {folder.expanded ? (
                  <ChevronDown className="h-5 w-5 text-land-tertiary" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-land-tertiary" />
                )}
              </button>
              {folder.expanded ? (
                <FolderOpen className="h-5 w-5 text-land-primary" />
              ) : (
                <Folder className="h-5 w-5 text-land-primary" />
              )}
              <div className="flex-1">
                <span className="brand-body text-base font-medium text-land-primary">
                  {folder.name}
                </span>
                <p className="brand-body text-xs text-land-tertiary">
                  ({folder.layers.length} capas)
                </p>
              </div>
            </div>

            {folder.expanded && (
              <div className="border-t border-land-secondary/30">
                {getLayersInFolder(folder.id).map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-3 border-b border-land-secondary/20 p-4 last:border-b-0 ${
                      selectedLayer === layer.id ? 'bg-land-primary/10' : ''
                    }`}
                  >
                    <button
                      className="rounded-lg p-2 transition-colors hover:bg-land-secondary/20"
                      onClick={() => onToggleLayerVisibility(layer.id)}
                    >
                      {layer.visible ? (
                        <Eye className="h-5 w-5 text-land-primary" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-land-tertiary" />
                      )}
                    </button>
                    <div
                      className="min-w-0 flex-1"
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <span className="brand-body block truncate text-sm text-land-primary">
                        {layer.name}
                      </span>
                      <span className="brand-body text-xs text-land-tertiary">
                        {layer.features?.length || 0} elementos
                      </span>
                    </div>
                    <button
                      className="rounded-lg p-2 transition-colors hover:bg-land-secondary/20"
                      onClick={() =>
                        setShowLayerMenu(
                          showLayerMenu === layer.id ? null : layer.id,
                        )
                      }
                    >
                      <MoreVertical className="h-4 w-4 text-land-tertiary" />
                    </button>

                    {/* Menú de opciones de capa */}
                    {showLayerMenu === layer.id && (
                      <div className="absolute right-4 z-10 mt-2 min-w-[160px] rounded-lg border-2 border-land-secondary/30 bg-white py-2 shadow-lg">
                        <button
                          className="brand-body flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-land-primary hover:bg-land-light/50"
                          onClick={() => {
                            onOpenLayerProperties(layer)
                            setShowLayerMenu(null)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          Propiedades
                        </button>
                        <button
                          className="brand-body flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            onRemoveLayer(layer.id)
                            setShowLayerMenu(null)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Capas sin organizar */}
        {getUnorganizedLayers().length > 0 && (
          <div className="overflow-hidden rounded-xl bg-land-light/50">
            <div className="border-b border-land-secondary/30 p-4">
              <span className="brand-body text-sm font-medium text-land-tertiary">
                Capas sin organizar
              </span>
            </div>
            {getUnorganizedLayers().map((layer) => (
              <div
                key={layer.id}
                className={`flex items-center gap-3 border-b border-land-secondary/20 p-4 last:border-b-0 ${
                  selectedLayer === layer.id ? 'bg-land-primary/10' : ''
                }`}
              >
                <button
                  className="rounded-lg p-2 transition-colors hover:bg-land-secondary/20"
                  onClick={() => onToggleLayerVisibility(layer.id)}
                >
                  {layer.visible ? (
                    <Eye className="h-5 w-5 text-land-primary" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-land-tertiary" />
                  )}
                </button>
                <div
                  className="min-w-0 flex-1"
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <span className="brand-body block truncate text-sm text-land-primary">
                    {layer.name}
                  </span>
                  <span className="brand-body text-xs text-land-tertiary">
                    {layer.features?.length || 0} elementos
                  </span>
                </div>
                <button
                  className="rounded-lg p-2 transition-colors hover:bg-land-secondary/20"
                  onClick={() =>
                    setShowLayerMenu(
                      showLayerMenu === layer.id ? null : layer.id,
                    )
                  }
                >
                  <MoreVertical className="h-4 w-4 text-land-tertiary" />
                </button>

                {/* Menú de opciones de capa */}
                {showLayerMenu === layer.id && (
                  <div className="absolute right-4 z-10 mt-2 min-w-[160px] rounded-lg border-2 border-land-secondary/30 bg-white py-2 shadow-lg">
                    <button
                      className="brand-body flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-land-primary hover:bg-land-light/50"
                      onClick={() => {
                        onOpenLayerProperties(layer)
                        setShowLayerMenu(null)
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Propiedades
                    </button>
                    <button
                      className="brand-body flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        onRemoveLayer(layer.id)
                        setShowLayerMenu(null)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {layers.length === 0 && (
          <div className="rounded-xl bg-land-light/50 py-8 text-center">
            <Layers className="mx-auto mb-3 h-12 w-12 text-land-tertiary" />
            <p className="brand-body text-sm text-land-tertiary">
              No hay capas disponibles
            </p>
            <p className="brand-body mt-1 text-xs text-land-tertiary">
              Importa un archivo KML para comenzar
            </p>
          </div>
        )}
      </div>

      {/* Overlay para cerrar menús */}
      {showLayerMenu && (
        <div
          className="z-5 fixed inset-0"
          onClick={() => setShowLayerMenu(null)}
        />
      )}
    </div>
  )
}
