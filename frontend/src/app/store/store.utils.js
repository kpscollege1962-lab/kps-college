/**
 * Maps pending / fulfilled / rejected cases for an async thunk onto a
 * status object in state: { loading, success, message }
 */
export const mapAsyncReducers = (builder, thunk, statusKey, { onFulfilled, onRejected } = {}) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[statusKey].loading = true
      state[statusKey].success = null
      state[statusKey].message = ''
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[statusKey].loading = false
      state[statusKey].success = true
      state[statusKey].message = action.payload?.message || ''
      onFulfilled?.(state, action)
    })
    .addCase(thunk.rejected, (state, action) => {
      state[statusKey].loading = false
      state[statusKey].success = false
      state[statusKey].message = action.payload?.message || 'Something went wrong'
      onRejected?.(state, action)
    })
}
