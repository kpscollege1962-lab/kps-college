import { handleApiCall } from '@/lib/apiUtils'
import { getRotaApi, saveRotaApi, deleteRotaApi } from '../api/rota.api'

export const getRotaService = (campusId, date) =>
  handleApiCall(() => getRotaApi(campusId, date), 'Failed to load the rota')

export const saveRotaService = (campusId, date, data) =>
  handleApiCall(() => saveRotaApi(campusId, date, data), 'Failed to save the rota')

export const deleteRotaService = (campusId, date) =>
  handleApiCall(() => deleteRotaApi(campusId, date), 'Failed to delete the rota')
