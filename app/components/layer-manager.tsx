'use client'

import type React from 'react'

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
  Copy,
  Download,
} from 'lucide-react'

interface LayerFolder {
  id: string
  name: string
  expanded: boolean
  layers: string[]
}

interface LayerManagerProps {
  layers: any[]
  folders: LayerFolder[]
  onToggleLayerVisibility: (layerId: string) => void
  onRemoveLayer: (layerId: string) => void
  onOpenLayerProperties: (layer: any) => void
  onCreateFolder: () => void
  onToggleFolder: (folderId: string) => void
  onMoveLayerToFolder: (layerId: string, folderId: string) => void
}

export default function LayerManager({
  layers,
  folders,
  onToggleLayerVisibility,
  onRemoveLayer,
  onOpenLayerProperties,
  onCreateFolder,
  onToggleFolder,
  onMoveLayerToFolder,
}: LayerManagerProps) {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [showContextMenu, setShowContextMenu] = useState<{
    layerId: string
    x: number
    y: number
  } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, layerId: string) => {
    e.preventDefault()
    setShowContextMenu({
      layerId,
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleCloseContextMenu = () => {
    setShowContextMenu(null)
  }

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
    <div className="brand-card-elegant rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-land-primary" />
          <h3 className="brand-title-main font-semibold text-land-primary">
            Administrador de Capas
          </h3>
        </div>
        <button
          onClick={onCreateFolder}
          className="rounded-lg p-2 transition-colors hover:bg-land-secondary/20"
          title="Nueva carpeta"
        >
          <FolderPlus className="h-4 w-4 text-land-primary" />
        </button>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {/* Carpetas */}
        {folders.map((folder) => (
          <div key={folder.id} className="space-y-1">
            <div className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-land-light/50">
              <button onClick={() => onToggleFolder(folder.id)} className="p-1">
                {folder.expanded ? (
                  <ChevronDown className="h-4 w-4 text-land-tertiary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-land-tertiary" />
                )}
              </button>
              {folder.expanded ? (
                <FolderOpen className="h-4 w-4 text-land-primary" />
              ) : (
                <Folder className="h-4 w-4 text-land-primary" />
              )}
              <span className="brand-body flex-1 text-sm font-medium text-land-primary">
                {folder.name}
              </span>
              <span className="brand-body text-xs text-land-tertiary">
                ({folder.layers.length})
              </span>
            </div>

            {folder.expanded && (
              <div className="ml-6 space-y-1">
                {getLayersInFolder(folder.id).map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors ${
                      selectedLayer === layer.id
                        ? 'bg-land-primary/10'
                        : 'hover:bg-land-light/50'
                    }`}
                    onClick={() => setSelectedLayer(layer.id)}
                    onContextMenu={(e) => handleContextMenu(e, layer.id)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-land-secondary/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleLayerVisibility(layer.id)
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="h-4 w-4 text-land-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-land-tertiary" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="brand-body block truncate text-sm text-land-primary">
                          {layer.name}
                        </span>
                        <span className="brand-body text-xs text-land-tertiary">
                          {layer.features?.length || 0} elementos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-land-secondary/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenLayerProperties(layer)
                        }}
                      >
                        <Settings className="h-3 w-3 text-land-tertiary" />
                      </button>
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveLayer(layer.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Capas sin organizar */}
        {getUnorganizedLayers().length > 0 && (
          <div className="space-y-1">
            <div className="brand-body px-2 py-1 text-xs font-medium text-land-tertiary">
              Capas sin organizar
            </div>
            {getUnorganizedLayers().map((layer) => (
              <div
                key={layer.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors ${
                  selectedLayer === layer.id
                    ? 'bg-land-primary/10'
                    : 'hover:bg-land-light/50'
                }`}
                onClick={() => setSelectedLayer(layer.id)}
                onContextMenu={(e) => handleContextMenu(e, layer.id)}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-land-secondary/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLayerVisibility(layer.id)
                    }}
                  >
                    {layer.visible ? (
                      <Eye className="h-4 w-4 text-land-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-land-tertiary" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className="brand-body block truncate text-sm text-land-primary">
                      {layer.name}
                    </span>
                    <span className="brand-body text-xs text-land-tertiary">
                      {layer.features?.length || 0} elementos
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-land-secondary/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenLayerProperties(layer)
                    }}
                  >
                    <Settings className="h-3 w-3 text-land-tertiary" />
                  </button>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-destructive/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveLayer(layer.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {layers.length === 0 && (
          <div className="py-8 text-center">
            <Layers className="mx-auto mb-3 h-12 w-12 text-land-tertiary" />
            <p className="brand-body text-sm text-land-tertiary">
              No hay capas disponibles
            </p>
          </div>
        )}
      </div>

      {/* Menú contextual */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseContextMenu}
          />
          <div
            className="fixed z-50 min-w-[160px] rounded-lg border-2 border-land-secondary/30 bg-white py-2 shadow-lg"
            style={{
              left: showContextMenu.x,
              top: showContextMenu.y,
            }}
          >
            <button
              className="brand-body flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-land-primary hover:bg-land-light/50"
              onClick={() => {
                const layer = layers.find(
                  (l) => l.id === showContextMenu.layerId,
                )
                if (layer) onOpenLayerProperties(layer)
                handleCloseContextMenu()
              }}
            >
              <Settings className="h-4 w-4" />
              Propiedades
            </button>
            <button
              className="brand-body flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-land-primary hover:bg-land-light/50"
              onClick={handleCloseContextMenu}
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </button>
            <button
              className="brand-body flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-land-primary hover:bg-land-light/50"
              onClick={handleCloseContextMenu}
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <hr className="my-1 border-land-secondary/30" />
            <button
              className="brand-body flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                onRemoveLayer(showContextMenu.layerId)
                handleCloseContextMenu()
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
