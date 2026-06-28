import { apiClient } from "../api/client"

export interface AutocompleteTerm {
  offset: number
  value: string
}

export interface AutocompletePrediction {
  description: string
  place_id: string
  reference: string
  terms: AutocompleteTerm[]
  types: string[]
}

export interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
}

export interface StructuredAddress {
  house?: string
  floor?: string
  building?: string
  street: string
  area: string
  landmark?: string
  city: string
  state: string
  pincode: string
}

export interface ReverseGeocodeResponse {
  formattedAddress: string
  address: StructuredAddress
  coordinates: {
    latitude: number
    longitude: number
  }
}

export interface GeocodeResponse {
  coordinates: {
    latitude: number
    longitude: number
  }
  formattedAddress: string
  address?: StructuredAddress
}

export const mapsService = {
  autocomplete: async (input: string) => {
    const response = await apiClient.get<AutocompleteResponse>("/maps/autocomplete", {
      params: { input },
    })
    return response.data
  },

  reverseGeocode: async (lat: number, lng: number) => {
    const response = await apiClient.get<ReverseGeocodeResponse>("/maps/reverse-geocode", {
      params: { lat, lng },
    })
    return response.data
  },

  geocode: async (address: string) => {
    const response = await apiClient.get<GeocodeResponse>("/maps/geocode", {
      params: { address },
    })
    return response.data
  },

  details: async (placeId: string) => {
    const response = await apiClient.get<ReverseGeocodeResponse>("/maps/details", {
      params: { place_id: placeId },
    })
    return response.data
  },
}
