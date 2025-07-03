'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapLayer {
  id: string
  name: string
  visible: boolean
  type: 'kml' | 'drawing'
  data?: any
  features?: any[]
}

interface GoogleMapEditorProps {
  layers: MapLayer[]
  selectedTool: string
  onToolChange: (tool: string) => void
  onLayersChange: (layers: MapLayer[]) => void
}

// Función para convertir color KML a formato Google Maps
const parseKMLColor = (
  kmlColor: string,
): { color: string; opacity: number } => {
  if (!kmlColor || kmlColor.length !== 8) {
    return { color: '#ffffff', opacity: 1 }
  }

  // KML usa formato AABBGGRR (Alpha, Blue, Green, Red)
  const alpha = Number.parseInt(kmlColor.substring(0, 2), 16) / 255
  const blue = kmlColor.substring(2, 4)
  const green = kmlColor.substring(4, 6)
  const red = kmlColor.substring(6, 8)

  return {
    color: `#${red}${green}${blue}`,
    opacity: alpha,
  }
}

// Función para extraer estilos del KML
const extractKMLStyles = (kmlContent: string) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(kmlContent, 'text/xml')
  const styles: { [key: string]: any } = {}

  // Extraer estilos definidos
  const styleElements = xmlDoc.getElementsByTagName('Style')
  for (let i = 0; i < styleElements.length; i++) {
    const style = styleElements[i]
    const id = style.getAttribute('id')
    if (!id) continue

    const styleData: any = {}

    // LineStyle
    const lineStyle = style.getElementsByTagName('LineStyle')[0]
    if (lineStyle) {
      const color = lineStyle.getElementsByTagName('color')[0]?.textContent
      const width = lineStyle.getElementsByTagName('width')[0]?.textContent
      if (color) {
        const parsedColor = parseKMLColor(color)
        styleData.lineColor = parsedColor.color
        styleData.lineOpacity = parsedColor.opacity
      }
      if (width) {
        styleData.lineWidth = Number.parseFloat(width)
      }
    }

    // PolyStyle
    const polyStyle = style.getElementsByTagName('PolyStyle')[0]
    if (polyStyle) {
      const color = polyStyle.getElementsByTagName('color')[0]?.textContent
      const fill = polyStyle.getElementsByTagName('fill')[0]?.textContent
      const outline = polyStyle.getElementsByTagName('outline')[0]?.textContent
      if (color) {
        const parsedColor = parseKMLColor(color)
        styleData.fillColor = parsedColor.color
        styleData.fillOpacity = parsedColor.opacity
      }
      styleData.fill = fill !== '0'
      styleData.outline = outline !== '0'
    }

    // IconStyle
    const iconStyle = style.getElementsByTagName('IconStyle')[0]
    if (iconStyle) {
      const color = iconStyle.getElementsByTagName('color')[0]?.textContent
      const scale = iconStyle.getElementsByTagName('scale')[0]?.textContent
      const icon = iconStyle.getElementsByTagName('Icon')[0]
      if (color) {
        const parsedColor = parseKMLColor(color)
        styleData.iconColor = parsedColor.color
        styleData.iconOpacity = parsedColor.opacity
      }
      if (scale) {
        styleData.iconScale = Number.parseFloat(scale)
      }
      if (icon) {
        const href = icon.getElementsByTagName('href')[0]?.textContent
        if (href) {
          styleData.iconHref = href
        }
      }
    }

    styles[id] = styleData
  }

  return styles
}

// Función mejorada para parsear KML y extraer coordenadas con estilos
const parseKMLContent = (kmlContent: string) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(kmlContent, 'text/xml')
  const features: any[] = []
  const styles = extractKMLStyles(kmlContent)

  // Extraer Placemarks
  const placemarks = xmlDoc.getElementsByTagName('Placemark')

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i]
    const name =
      placemark.getElementsByTagName('name')[0]?.textContent ||
      `Feature ${i + 1}`
    const description =
      placemark.getElementsByTagName('description')[0]?.textContent || ''

    // Extraer referencia de estilo
    const styleUrl = placemark.getElementsByTagName('styleUrl')[0]?.textContent
    let style = {}
    if (styleUrl && styleUrl.startsWith('#')) {
      const styleId = styleUrl.substring(1)
      style = styles[styleId] || {}
    }

    // Buscar coordenadas en diferentes tipos de geometría
    const coordinates = placemark
      .getElementsByTagName('coordinates')[0]
      ?.textContent?.trim()

    if (coordinates) {
      const coords = coordinates
        .split(/\s+/)
        .map((coord) => {
          const [lng, lat, alt] = coord.split(',').map(Number)
          return { lat, lng }
        })
        .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng))

      if (coords.length > 0) {
        // Determinar el tipo de geometría
        let geometryType = 'Point'
        if (placemark.getElementsByTagName('Polygon').length > 0) {
          geometryType = 'Polygon'
        } else if (placemark.getElementsByTagName('LineString').length > 0) {
          geometryType = 'LineString'
        } else if (coords.length > 1) {
          geometryType = 'LineString'
        }

        features.push({
          name,
          description,
          coordinates: coords,
          geometryType,
          style,
        })
      }
    }
  }

  return features
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
  const mapFeaturesRef = useRef<Map<string, any[]>>(new Map())

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

          // Inicializar Drawing Manager
          const drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            markerOptions: {
              draggable: true,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#FFFF00',
                fillOpacity: 1,
                strokeColor: '#000000',
                strokeWeight: 1,
              },
            },
            polygonOptions: {
              fillColor: '#FFFFFF',
              fillOpacity: 0.3,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              draggable: true,
              editable: true,
            },
            circleOptions: {
              fillColor: '#FFFFFF',
              fillOpacity: 0.3,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              draggable: true,
              editable: true,
            },
            polylineOptions: {
              strokeColor: '#FFFFFF',
              strokeOpacity: 1.0,
              strokeWeight: 3,
              map: mapInstance,
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

  // Función para renderizar features en el mapa con estilos originales
  const renderFeatures = (
    layerId: string,
    features: any[],
    visible: boolean,
  ) => {
    if (!map || !window.google) return

    // Limpiar features existentes de esta capa
    const existingFeatures = mapFeaturesRef.current.get(layerId) || []
    existingFeatures.forEach((feature) => {
      if (feature.setMap) {
        feature.setMap(null)
      }
    })

    if (!visible) {
      mapFeaturesRef.current.set(layerId, [])
      return
    }

    const newFeatures: any[] = []
    const bounds = new window.google.maps.LatLngBounds()

    features.forEach((feature, index) => {
      const { coordinates, geometryType, name, description, style } = feature

      if (coordinates.length === 0) return

      let mapFeature: any = null

      try {
        if (
          geometryType === 'Point' ||
          (geometryType === 'Polygon' && coordinates.length === 1)
        ) {
          // Crear marcador con estilo original
          const markerOptions: any = {
            position: coordinates[0],
            map: map,
            title: name,
          }

          // Aplicar estilo de icono si existe
          if (style.iconColor || style.iconScale) {
            markerOptions.icon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: (style.iconScale || 1) * 8,
              fillColor: style.iconColor || '#FFFF00', // Amarillo por defecto como Google Earth
              fillOpacity: style.iconOpacity || 1,
              strokeColor: '#000000',
              strokeWeight: 1,
            }
          } else {
            // Usar estilo por defecto similar a Google Earth
            markerOptions.icon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#FFFF00',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 1,
            }
          }

          mapFeature = new window.google.maps.Marker(markerOptions)
          bounds.extend(coordinates[0])
        } else if (geometryType === 'LineString') {
          // Crear polyline con estilo original
          mapFeature = new window.google.maps.Polyline({
            path: coordinates,
            geodesic: true,
            strokeColor: style.lineColor || '#FFFFFF', // Blanco por defecto como Google Earth
            strokeOpacity: style.lineOpacity || 1.0,
            strokeWeight: style.lineWidth || 2,
            map: map,
          })

          coordinates.forEach((coord) => bounds.extend(coord))
        } else if (geometryType === 'Polygon') {
          // Crear polígono con estilo original
          const polygonOptions: any = {
            paths: coordinates,
            strokeColor: style.lineColor || '#FFFFFF', // Blanco por defecto
            strokeOpacity: style.lineOpacity || 1.0,
            strokeWeight: style.lineWidth || 2,
            map: map,
          }

          // Aplicar relleno si está definido
          if (style.fill !== false) {
            polygonOptions.fillColor = style.fillColor || '#FFFFFF'
            polygonOptions.fillOpacity = style.fillOpacity || 0.3
          } else {
            polygonOptions.fillOpacity = 0
          }

          mapFeature = new window.google.maps.Polygon(polygonOptions)
          coordinates.forEach((coord) => bounds.extend(coord))
        }

        if (mapFeature) {
          // Agregar info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="font-family: 'Raleway', sans-serif;">
                <h3 style="color: #344b49; margin: 0 0 8px 0; font-family: 'Cormorant Garamond', serif;">${name}</h3>
                ${description ? `<p style="margin: 0; color: #636969; font-size: 14px;">${description}</p>` : ''}
              </div>
            `,
          })

          mapFeature.addListener('click', () => {
            infoWindow.open(map, mapFeature)
          })

          newFeatures.push(mapFeature)
        }
      } catch (error) {
        console.error(`Error rendering feature ${index}:`, error)
      }
    })

    mapFeaturesRef.current.set(layerId, newFeatures)

    // Ajustar vista si es la primera capa y tiene contenido
    if (newFeatures.length > 0 && !bounds.isEmpty()) {
      try {
        map.fitBounds(bounds)
        // Limitar el zoom máximo
        const listener = window.google.maps.event.addListenerOnce(
          map,
          'bounds_changed',
          () => {
            if (map.getZoom() > 18) {
              map.setZoom(18)
            }
          },
        )
      } catch (error) {
        console.error('Error fitting bounds:', error)
      }
    }
  }

  // Manejar capas KML
  useEffect(() => {
    if (!map || !isLoaded || !window.google) return

    const updatedLayers = layers.map((layer) => {
      if (layer.type === 'kml' && layer.data && !layer.features) {
        try {
          console.log('Parsing KML content for layer:', layer.name)
          const features = parseKMLContent(layer.data)
          console.log('Extracted features with styles:', features)

          const updatedLayer = { ...layer, features }
          renderFeatures(layer.id, features, layer.visible)
          return updatedLayer
        } catch (error) {
          console.error('Error parsing KML:', error)
          return layer
        }
      }

      if (layer.features) {
        renderFeatures(layer.id, layer.features, layer.visible)
      }

      return layer
    })

    // Verificar si hay cambios reales
    const hasChanges = updatedLayers.some((updatedLayer, index) => {
      const originalLayer = layers[index]
      if (!originalLayer) return true

      return (
        updatedLayer.id !== originalLayer.id ||
        updatedLayer.name !== originalLayer.name ||
        updatedLayer.visible !== originalLayer.visible ||
        updatedLayer.type !== originalLayer.type ||
        (!originalLayer.features && updatedLayer.features)
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
