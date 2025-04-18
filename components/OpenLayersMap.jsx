'use client'
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useHazardData } from '@/hooks/useHazardData'
import 'ol/ol.css'

// OpenLayers imports
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke } from 'ol/style'
import { fromLonLat, transformExtent } from 'ol/proj'
import Overlay from 'ol/Overlay'
import { toStringHDMS } from 'ol/coordinate'

// Style helper function
const createVectorStyle = (options) => {
  return new Style({
    fill: new Fill({
      color: options.fillColor || 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: options.color || '#3399CC',
      width: options.weight || 1,
    }),
  })
}

export default function HazardMap() {
  // Refs
  const mapElementRef = useRef(null)
  const mapRef = useRef(null)
  const popupElementRef = useRef(null)
  const popupOverlayRef = useRef(null)
  const regionLayerRef = useRef(null)
  const rainfallLayersRef = useRef({})
  const hasLoadedRegions = useRef(false)

  // State from hook
  const {
    regions,
    activeLayers,
    loading,
    error,
    mapBounds,
    loadRegions,
    rainfallStyle,
  } = useHazardData()

  // Memoized styles
  const defaultRegionStyle = useMemo(() => createVectorStyle({
    fillColor: 'rgba(69, 48, 61, 0.3)',
    weight: 1,
    color: 'white'
  }), [])

  // Initial data load - runs only once
  useEffect(() => {
    if (hasLoadedRegions.current) return
    
    const fetchData = async () => {
      try {
        console.log('Initial regions fetch')
        await loadRegions()
        hasLoadedRegions.current = true
      } catch (err) {
        console.error('Failed to load regions:', err)
      }
    }
    
    fetchData()
  }, [loadRegions])

  // Map initialization - runs once on mount
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return

    console.log('Initializing map')
    
    const initialMap = new Map({
      target: mapElementRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([40.7153, 9.1021]),
        zoom: 6,
        projection: 'EPSG:3857'
      }),
      overlays: [
        new Overlay({
          element: popupElementRef.current,
          autoPan: {
            animation: {
              duration: 250,
            },
          },
          offset: [0, -10]
        })
      ]
    })

    mapRef.current = initialMap

    // Click handler for popups
    initialMap.on('click', (evt) => {
      if (!popupOverlayRef.current || !popupElementRef.current) return

      const coordinate = evt.coordinate
      let content = ''
      let featureFound = false

      initialMap.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        if (featureFound) return

        const properties = feature.getProperties()
        const layerId = layer.get('layerId')

        if (layer === regionLayerRef.current) {
          content = `
            <div class="p-2">
              <h3 class="font-bold">${properties?.name || 'Unnamed Region'}</h3>
              <p><small>Lon/Lat: ${toStringHDMS(feature.getGeometry().getFirstCoordinate(), 4)}</small></p>
            </div>`
          featureFound = true
        } else if (layerId && rainfallLayersRef.current[layerId]) {
          content = `
            <div class="p-2">
              <h3 class="font-bold">Rainfall Data</h3>
              <p>Value: ${properties?.value || 'N/A'}</p>
              <p><small>Lon/Lat: ${toStringHDMS(feature.getGeometry().getClosestPoint(coordinate), 4)}</small></p>
            </div>`
          featureFound = true
        }
      })

      popupElementRef.current.innerHTML = content
      popupOverlayRef.current.setPosition(featureFound ? coordinate : undefined)
    })

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
        mapRef.current = null
      }
    }
  }, [])

  // Handle regions layer updates
  useEffect(() => {
    if (!mapRef.current || !regions || !hasLoadedRegions.current) return

    console.log('Updating regions layer')
    
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(regions, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: defaultRegionStyle,
      layerId: 'regions'
    })

    // Cleanup previous layer
    if (regionLayerRef.current) {
      mapRef.current.removeLayer(regionLayerRef.current)
    }

    mapRef.current.addLayer(vectorLayer)
    regionLayerRef.current = vectorLayer

    return () => {
      if (mapRef.current && vectorLayer) {
        mapRef.current.removeLayer(vectorLayer)
      }
    }
  }, [regions, defaultRegionStyle])

  // Handle rainfall layers
  useEffect(() => {
    if (!mapRef.current) return

    console.log('Updating rainfall layers')
    
    // Add new layers
    activeLayers.forEach(layer => {
      if (layer.type === 'rainfall' && layer.data && !rainfallLayersRef.current[layer.id]) {
        try {
          const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(layer.data, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857'
            })
          })

          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: rainfallStyle,
            layerId: layer.id
          })

          mapRef.current.addLayer(vectorLayer)
          rainfallLayersRef.current[layer.id] = vectorLayer
        } catch (e) {
          console.error('Error processing rainfall layer:', layer.id, e)
        }
      }
    })

    // Remove old layers
    Object.keys(rainfallLayersRef.current).forEach(layerId => {
      if (!activeLayers.some(l => l.id === layerId)) {
        mapRef.current.removeLayer(rainfallLayersRef.current[layerId])
        delete rainfallLayersRef.current[layerId]
      }
    })
  }, [activeLayers, rainfallStyle])

  // Fit map to bounds
  useEffect(() => {
    if (!mapRef.current || !mapBounds) return

    try {
      const extent = transformExtent(
        [mapBounds[0][1], mapBounds[0][0], mapBounds[1][1], mapBounds[1][0]],
        'EPSG:4326',
        'EPSG:3857'
      )
      mapRef.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 500
      })
    } catch (e) {
      console.error("Error fitting map bounds:", e)
    }
  }, [mapBounds])

  // Handle resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.updateSize()
      }
    })

    if (mapElementRef.current) {
      resizeObserver.observe(mapElementRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div
        ref={mapElementRef}
        className="absolute inset-0"
      />
      
      {/* Popup element */}
      <div
        ref={popupElementRef}
        className="ol-popup bg-white p-2 rounded shadow-md min-w-[150px] text-xs"
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-[1000]">
          Loading...
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 text-red-700 p-2 rounded shadow z-[1000]">
          Error: {error}
        </div>
      )}
    </div>
  )
}