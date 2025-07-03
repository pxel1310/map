'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapLayer {
  id: string
  name: string
  visible: boolean
  type: 'kml' | 'drawing'
  data?: any
  kmlLayer?: any
}

interface GoogleMapEditorProps {
  layers: MapLayer[]
  selectedTool: string
  onToolChange: (tool: string) => void
  onLayersChange: (layers: MapLayer[]) => void
}

export default function GoogleMapEditor({
  layers,
  selectedTool,
  onToolChange,
  onLayersChange,
}: GoogleMapEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const drawingManagerRef = useRef<any>(null)

  // Inicializar Google Maps
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['drawing', 'geometry'],
      })

      try {
        const google = await loader.load()

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 20.2114, lng: -87.4653 }, // Tulum, México
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            styles: [
              {
                featureType: 'all',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }],
              },
            ],
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_RIGHT,
              mapTypeIds: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.SATELLITE,
                google.maps.MapTypeId.HYBRID,
                google.maps.MapTypeId.TERRAIN,
              ],
            },
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER,
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP,
            },
            fullscreenControl: true,
          })

          // Inicializar Drawing Manager con colores de la marca
          const drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            markerOptions: {
              draggable: true,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#668969',
                fillOpacity: 1,
                strokeColor: '#344b49',
                strokeWeight: 2,
              },
            },
            polygonOptions: {
              fillColor: '#668969',
              fillOpacity: 0.3,
              strokeColor: '#344b49',
              strokeWeight: 2,
              draggable: true,
              editable: true,
            },
            circleOptions: {
              fillColor: '#668969',
              fillOpacity: 0.3,
              strokeColor: '#344b49',
              strokeWeight: 2,
              draggable: true,
              editable: true,
            },
            polylineOptions: {
              strokeColor: '#344b49',
              strokeWeight: 3,
              draggable: true,
              editable: true,
            },
          })

          drawingManager.setMap(mapInstance)
          drawingManagerRef.current = drawingManager

          // Event listeners para dibujo
          google.maps.event.addListener(
            drawingManager,
            'overlaycomplete',
            (event: any) => {
              console.log('Overlay created:', event.type)
              onToolChange('select')
            },
          )

          setMap(mapInstance)
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    initMap()
  }, [onToolChange])

  // Manejar cambios en las herramientas de dibujo
  useEffect(() => {
    if (!drawingManagerRef.current || !window.google) return

    const drawingModes: { [key: string]: any } = {
      select: null,
      marker: window.google.maps.drawing.OverlayType.MARKER,
      polygon: window.google.maps.drawing.OverlayType.POLYGON,
      circle: window.google.maps.drawing.OverlayType.CIRCLE,
      polyline: window.google.maps.drawing.OverlayType.POLYLINE,
    }

    drawingManagerRef.current.setDrawingMode(drawingModes[selectedTool] || null)
  }, [selectedTool])

  // Manejar capas KML con mejor soporte
  useEffect(() => {
    if (!map || !isLoaded || !window.google) return

    const updatedLayers = layers.map((layer) => {
      if (layer.type === 'kml' && layer.data && !layer.kmlLayer) {
        try {
          // Crear un blob URL para el contenido KML
          const url = layer.dataUrl // Asegúrate de tener una URL válida y accesible públicamente

          const kmlLayer = new window.google.maps.KmlLayer({
            url: url,
            suppressInfoWindows: false,
            preserveViewport: false,
            clickable: true,
          })

          // Event listener para errores de KML
          window.google.maps.event.addListener(
            kmlLayer,
            'status_changed',
            () => {
              const status = kmlLayer.getStatus()
              if (status !== window.google.maps.KmlLayerStatus.OK) {
                console.error('KML Layer error:', status)
              }
            },
          )

          if (layer.visible) {
            kmlLayer.setMap(map)
          }

          return { ...layer, kmlLayer }
        } catch (error) {
          console.error('Error creating KML layer:', error)
          return layer
        }
      }

      if (layer.kmlLayer) {
        if (layer.visible && !layer.kmlLayer.getMap()) {
          layer.kmlLayer.setMap(map)
        } else if (!layer.visible && layer.kmlLayer.getMap()) {
          layer.kmlLayer.setMap(null)
        }
      }

      return layer
    })

    // Comparar solo las propiedades serializables para evitar referencias circulares
    const hasChanges = updatedLayers.some((updatedLayer, index) => {
      const originalLayer = layers[index]
      if (!originalLayer) return true

      return (
        updatedLayer.id !== originalLayer.id ||
        updatedLayer.name !== originalLayer.name ||
        updatedLayer.visible !== originalLayer.visible ||
        updatedLayer.type !== originalLayer.type ||
        (!originalLayer.kmlLayer && updatedLayer.kmlLayer) // Nueva capa KML creada
      )
    })

    if (hasChanges) {
      onLayersChange(updatedLayers)
    }
  }, [map, layers, isLoaded, onLayersChange])

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="brand-text text-lg text-white">
            Cargando mapa satelital...
          </div>
        </div>
      )}
    </div>
  )
}
