import React from 'react';
import { useAppContext } from '../context/AppContext';
import { pathForState, pageFromPath } from './history';

// Sync app state <-> browser history so back/forward/reload work
const RouteSync = () => {
  const { state, dispatch } = useAppContext();
  const { page, selectedVendor, selectedProduct, vendors = [] } = state;

  // On initial mount, align state with current URL
  React.useEffect(() => {
    const applyFromLocation = () => {
      const { page: urlPage, vendorId, productId } = pageFromPath(window.location.pathname);
      // If URL differs from current state, update state
      if (urlPage && urlPage !== page) {
        dispatch({ type: 'SET_PAGE', payload: urlPage });
      }
      if (vendorId && urlPage === 'VendorDetail') {
        // Try to find vendor by id; else set minimal selected vendor
        const found = vendors.find(v => v.id === vendorId) || selectedVendor;
        if (!found || found?.id !== vendorId) {
          dispatch({ type: 'SELECT_VENDOR', payload: found || { id: vendorId, name: vendorId } });
        }
      }
      // For productId we currently don't have a global catalog to resolve; 
      // rely on in-session navigation to set selectedProduct. If needed, we could set a minimal placeholder.
      if (productId && urlPage === 'ProductDetail' && !state.selectedProduct) {
        // Optionally set a minimal placeholder so the page doesn't look empty.
        dispatch({ type: 'SET_SELECTED_PRODUCT', payload: { id: productId, name: `Product ${productId}` } });
      }
    };
    applyFromLocation();
    // Listen to back/forward
    const onPop = () => applyFromLocation();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When app state changes, push URL if needed
  React.useEffect(() => {
    const targetPath = pathForState(state);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [page, selectedVendor, selectedProduct, vendors, state]);

  return null;
};

export default RouteSync;
