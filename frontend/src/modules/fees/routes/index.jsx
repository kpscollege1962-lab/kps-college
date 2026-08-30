import FeeClassesPage from '../pages/FeeClassesPage'
import FeeHeadsPage from '../pages/FeeHeadsPage'

export const feeRoutes = [
  { index: true, element: <FeeClassesPage /> },
  { path: 'fee-heads', element: <FeeHeadsPage /> },
]