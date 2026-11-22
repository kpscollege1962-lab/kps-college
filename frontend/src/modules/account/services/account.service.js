import { handleApiCall } from '@/lib/apiUtils'
import {
  getMyAccountApi, getMyProfileApi, updateMyContactApi, updateMyPhotoApi, changeMyPasswordApi,
} from '../api/account.api'

export const getMyAccountService = () =>
  handleApiCall(() => getMyAccountApi(), 'Failed to load your account')

export const getMyProfileService = () =>
  handleApiCall(() => getMyProfileApi(), 'Failed to load your profile')

export const updateMyContactService = (data) =>
  handleApiCall(() => updateMyContactApi(data), 'Failed to save your contact details')

export const updateMyPhotoService = (formData) =>
  handleApiCall(() => updateMyPhotoApi(formData), 'Failed to upload your photo')

export const changeMyPasswordService = (data) =>
  handleApiCall(() => changeMyPasswordApi(data), 'Failed to change your password')
