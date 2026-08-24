const TOKEN_KEY = 'access_token'

export const getAccessToken = () => sessionStorage.getItem(TOKEN_KEY)
export const setAccessToken = (token) => sessionStorage.setItem(TOKEN_KEY, token)
export const clearAccessToken = () => sessionStorage.removeItem(TOKEN_KEY)
