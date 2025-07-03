'use client'

import { useState } from 'react'
import {
  MapPin,
  Square,
  Circle,
  Edit3,
  Router,
  Ruler,
  Move,
  RotateCcw,
  Copy,
  Trash2,
  FolderPlus,
  Settings,
} from 'lucide-react'

interface MobileDrawingToolsProps {
  selectedTool: string
  onToolChange: (tool: string) => void
  onCreateFolder: () => void
  onMeasureDistance: () => void
  onMeasureArea: () => void
}

export default function MobileDrawingTools({
  selectedTool,
  onToolChange,
  onCreateFolder,
  onMeasureDistance,
  onMeasureArea,
}: MobileDrawingToolsProps) {
  const [activeCategory, setActiveCategory] = useState('draw')

  const drawingTools = [
    { id: 'select', label: 'Seleccionar', category: 'draw' },
    { id: 'marker', label: 'Marcador', category: 'draw' },
    { id: 'polygon', label: 'Polígono', category: 'draw' },
    { id: 'circle', label: 'Círculo', category: 'draw' },
    { id: 'polyline', label: 'Línea', category: 'draw' },
    { id: 'rectangle', label: 'Rectángulo', category: 'draw' },
  ]

  const editTools = [
    { id: 'move', label: 'Mover', category: 'edit' },
    { id: 'rotate', label: 'Rotar', category: 'edit' },
    { id: 'copy', label: 'Copiar', category: 'edit' },
    { id: 'delete', label: 'Eliminar', category: 'edit' },
  ]

  const measureTools = [
    { id: 'measure-distance', label: 'Distancia', category: 'measure' },
    { id: 'measure-area', label: 'Área', category: 'measure' },
  ]

  const organizationTools = [
    { id: 'create-folder', label: 'Nueva carpeta', category: 'organize' },
    { id: 'layer-settings', label: 'Configuración', category: 'organize' },
  ]

  const categories = [
    { id: 'draw', label: 'Dibujar', tools: drawingTools },
    { id: 'edit', label: 'Editar', tools: editTools },
    { id: 'measure', label: 'Medir', tools: measureTools },
    { id: 'organize', label: 'Organizar', tools: organizationTools },
  ]

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case 'create-folder':
        onCreateFolder()
        break
      case 'measure-distance':
        onMeasureDistance()
        break
      case 'measure-area':
        onMeasureArea()
        break
      default:
        onToolChange(toolId)
    }
  }

  const getIconForTool = (toolId: string) => {
    switch (toolId) {
      case 'select':
        return <Edit3 className="h-6 w-6" />
      case 'marker':
        return <MapPin className="h-6 w-6" />
      case 'polygon':
        return <Square className="h-6 w-6" />
      case 'circle':
        return <Circle className="h-6 w-6" />
      case 'polyline':
        return <Router className="h-6 w-6" />
      case 'rectangle':
        return <Square className="h-6 w-6" />
      case 'move':
        return <Move className="h-6 w-6" />
      case 'rotate':
        return <RotateCcw className="h-6 w-6" />
      case 'copy':
        return <Copy className="h-6 w-6" />
      case 'delete':
        return <Trash2 className="h-6 w-6" />
      case 'measure-distance':
        return <Ruler className="h-6 w-6" />
      case 'measure-area':
        return <Square className="h-6 w-6" />
      case 'create-folder':
        return <FolderPlus className="h-6 w-6" />
      case 'layer-settings':
        return <Settings className="h-6 w-6" />
      default:
        return <Edit3 className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Categorías en grid móvil */}
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`rounded-xl p-3 text-sm font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-land-primary text-land-light'
                : 'bg-land-light/50 text-land-tertiary hover:text-land-primary'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Herramientas en grid móvil */}
      <div className="grid grid-cols-2 gap-3">
        {categories
          .find((cat) => cat.id === activeCategory)
          ?.tools.map((tool) => (
            <button
              key={tool.id}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                selectedTool === tool.id
                  ? 'bg-land-primary text-land-light'
                  : 'bg-land-light/50 text-land-primary hover:bg-land-secondary/20'
              }`}
              onClick={() => handleToolClick(tool.id)}
            >
              {getIconForTool(tool.id)}
              <span className="brand-body text-center text-xs">
                {tool.label}
              </span>
            </button>
          ))}
      </div>

      {/* Opciones adicionales para herramientas de dibujo */}
      {activeCategory === 'draw' && selectedTool !== 'select' && (
        <div className="rounded-xl bg-land-light/50 p-4">
          <h4 className="brand-body mb-3 text-sm font-medium text-land-primary">
            Opciones de dibujo
          </h4>
          <div className="space-y-4">
            <div>
              <label className="brand-body mb-2 block text-xs text-land-tertiary">
                Color
              </label>
              <input
                type="color"
                defaultValue="#FFFFFF"
                className="h-12 w-full cursor-pointer rounded-lg border-2 border-land-secondary/30"
              />
            </div>
            <div>
              <label className="brand-body mb-2 block text-xs text-land-tertiary">
                Grosor
              </label>
              <select className="brand-body w-full rounded-lg border-2 border-land-secondary/30 p-3 text-base focus:border-land-primary focus:outline-none">
                <option value="1">1 px</option>
                <option value="2">2 px</option>
                <option value="3">3 px</option>
                <option value="4">4 px</option>
                <option value="5">5 px</option>
              </select>
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 text-land-primary" />
              <span className="brand-body text-sm text-land-primary">
                Relleno
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Información de medición */}
      {activeCategory === 'measure' && (
        <div className="rounded-xl bg-land-light/50 p-4">
          <h4 className="brand-body mb-3 text-sm font-medium text-land-primary">
            Unidades
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="units"
                value="metric"
                defaultChecked
                className="h-5 w-5 text-land-primary"
              />
              <span className="brand-body text-sm text-land-primary">
                Métricas (m, km)
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="units"
                value="imperial"
                className="h-5 w-5 text-land-primary"
              />
              <span className="brand-body text-sm text-land-primary">
                Imperiales (ft, mi)
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
