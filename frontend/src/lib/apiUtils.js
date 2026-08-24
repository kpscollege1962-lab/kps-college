export const handleApiCall = async (apiCall, errorMessageFallback) => {
  try {
    const response = await apiCall()
    return response.data // { success, message, data }
  } catch (error) {
    const backendData = error.response?.data?.data ?? null
    const message =
      error.response?.data?.message ||
      error.message ||
      errorMessageFallback

    return { success: false, message, data: backendData }
  }
}
