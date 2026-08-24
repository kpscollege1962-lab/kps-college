import { useSelector, useDispatch } from 'react-redux'
import {
  toggleSidebar, openSidebar, closeSidebar,
  openMobileSidebar, closeMobileSidebar, toggleMobileSidebar,
} from './portalLayout.slice'

export default function usePortalLayout() {
  const dispatch = useDispatch()
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state.portalLayout)

  return {
    sidebarOpen,
    mobileSidebarOpen,
    toggleSidebar: () => dispatch(toggleSidebar()),
    openSidebar: () => dispatch(openSidebar()),
    closeSidebar: () => dispatch(closeSidebar()),
    openMobileSidebar: () => dispatch(openMobileSidebar()),
    closeMobileSidebar: () => dispatch(closeMobileSidebar()),
    toggleMobileSidebar: () => dispatch(toggleMobileSidebar()),
  }
}
