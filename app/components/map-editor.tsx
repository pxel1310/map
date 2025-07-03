"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface MapLayer {
  id: string
  name: string
  visible: boolean
  type: "kml" | "drawing"
  data?: any
  features?: any[]
}

interface GoogleMapEditorProps {
  layers: MapLayer[]
  selectedTool: string
  onToolChange: (tool: string) => void
  onLayersChange: (layers: MapLayer[]) => void
}

// Función para parsear KML y extraer coordenadas
const parseKMLContent = (kmlContent: string) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(kmlContent, "text/xml")
  const features: any[] = []

  // Extraer Placemarks
  const placemarks = xmlDoc.getElementsByTagName("Placemark")

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i]
    const name = placemark.getElementsByTagName("name")[0]?.textContent || `Feature ${i + 1}`
    const description = placemark.getElementsByTagName("description")[0]?.textContent || ""

    // Buscar coordenadas en diferentes tipos de geometría
    const coordinates = placemark.getElementsByTagName("coordinates")[0]?.textContent?.trim()

    if (coordinates) {
      const coords = coordinates
          .split(/\s+/)
          .map((coord) => {
            const [lng, lat, alt] = coord.split(",").map(Number)
            return { lat, lng }
          })
          .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng))

      if (coords.length > 0) {
        // Determinar el tipo de geometría
        let geometryType = "Point"
        if (placemark.getElementsByTagName("Polygon").length > 0) {
          geometryType = "Polygon"
        } else if (placemark.getElementsByTagName("LineString").length > 0) {
          geometryType = "LineString"
        } else if (coords.length > 1) {
          geometryType = "LineString"
        }

        features.push({
          name,
          description,
          coordinates: coords,
          geometryType,
        })
      }
    }
  }

  return features
}

export default function GoogleMapEditor({ layers, selectedTool, onToolChange, onLayersChange }: GoogleMapEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const drawingManagerRef = useRef<any>(null)
  const mapFeaturesRef = useRef<Map<string, any[]>>(new Map())

  // Inicializar Google Maps
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["drawing", "geometry"],
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
                featureType: "all",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
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
                fillColor: "#c6c29a",
                fillOpacity: 1,
                strokeColor: "#344b49",
                strokeWeight: 2,
              },
            },
            polygonOptions: {
              fillColor: "#c6c29a",
              fillOpacity: 0.3,
              strokeColor: "#344b49",
              strokeWeight: 2,
              draggable: true,
              editable: true,
            },
            circleOptions: {
              fillColor: "#c6c29a",
              fillOpacity: 0.3,
              strokeColor: "#344b49",
              strokeWeight: 2,
              draggable: true,
              editable: true,
            },
            polylineOptions: {
              strokeColor: "#344b49",
              strokeOpacity: 1.0,
              strokeWeight: 3,
              map: mapInstance,
            },
          })

          drawingManager.setMap(mapInstance)
          drawingManagerRef.current = drawingManager

          // Event listeners para dibujo
          google.maps.event.addListener(drawingManager, "overlaycomplete", (event: any) => {
            console.log("Overlay created:", event.type)
            onToolChange("select")
          })

          setMap(mapInstance)
          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
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

  // Función para renderizar features en el mapa
  const renderFeatures = (layerId: string, features: any[], visible: boolean) => {
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
      const { coordinates, geometryType, name, description } = feature

      if (coordinates.length === 0) return

      let mapFeature: any = null

      try {
        if (geometryType === "Point" || (geometryType === "Polygon" && coordinates.length === 1)) {
          // Crear marcador
          mapFeature = new window.google.maps.Marker({
            position: coordinates[0],
            map: map,
            title: name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#c6c29a",
              fillOpacity: 1,
              strokeColor: "#344b49",
              strokeWeight: 2,
            },
          })

          bounds.extend(coordinates[0])
        } else if (geometryType === "LineString") {
          // Crear polyline
          mapFeature = new window.google.maps.Polyline({
            path: coordinates,
            geodesic: true,
            strokeColor: "#344b49",
            strokeOpacity: 1.0,
            strokeWeight: 3,
            map: map,
          })

          coordinates.forEach((coord) => bounds.extend(coord))
        } else if (geometryType === "Polygon") {
          // Crear polígono
          mapFeature = new window.google.maps.Polygon({
            paths: coordinates,
            strokeColor: "#344b49",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#c6c29a",
            fillOpacity: 0.35,
            map: map,
          })

          coordinates.forEach((coord) => bounds.extend(coord))
        }

        if (mapFeature) {
          // Agregar info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="font-family: 'Raleway', sans-serif;">
                <h3 style="color: #344b49; margin: 0 0 8px 0; font-family: 'Cormorant Garamond', serif;">${name}</h3>
                ${description ? `<p style="margin: 0; color: #636969; font-size: 14px;">${description}</p>` : ""}
              </div>
            `,
          })

          mapFeature.addListener("click", () => {
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
        const listener = window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
          if (map.getZoom() > 18) {
            map.setZoom(18)
          }
        })
      } catch (error) {
        console.error("Error fitting bounds:", error)
      }
    }
  }

  // Manejar capas KML
  useEffect(() => {
    if (!map || !isLoaded || !window.google) return

    const updatedLayers = layers.map((layer) => {
      if (layer.type === "kml" && layer.data && !layer.features) {
        try {
          console.log("Parsing KML content for layer:", layer.name)
          const features = parseKMLContent(layer.data)
          console.log("Extracted features:", features)

          const updatedLayer = { ...layer, features }
          renderFeatures(layer.id, features, layer.visible)
          return updatedLayer
        } catch (error) {
          console.error("Error parsing KML:", error)
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
      <div className="w-full h-full relative">
        <div ref={mapRef} className="w-full h-full" />
        {!isLoaded && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-lg brand-text">Cargando mapa satelital...</div>
            </div>
        )}
      </div>
  )
}
