'use client'

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icon, Button } from '@/components/common/UIComponents';

const ShoppingCartSidebar = () => {
  const { state, dispatch } = useAppContext();
  const { cartItems, isCartOpen } = state;

  // Normalize price to a number even if it comes as a string like "Rs. 120 / kg"
  const toNumber = (price) => {
    if (typeof price === 'number' && !isNaN(price)) return price;
    const str = String(price || '').replace(/,/g, '');
    const match = str.match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const close = () => dispatch({ type: 'SET_CART_OPEN', payload: false });
  const removeItem = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const updateQty = (id, qty) => {
    const q = Number(qty);
    if (q <= 0) return;
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { id, qty: q } });
  };

  const subtotal = cartItems.reduce((s, it) => s + (toNumber(it.price) * (it.qty || 1)), 0);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={close} />

      <aside className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Shopping Cart</h3>
          <div className="flex items-center space-x-2">
            <button onClick={clearCart} className="text-sm text-gray-600 hover:text-red-600">Clear</button>
            <button onClick={close} aria-label="Close cart" className="p-2 hover:bg-gray-100 rounded">
              <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <Icon path="M3 3h18v14a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm">Add products to see them here.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    {/* Placeholder image / initials */}
                    <span className="text-sm text-gray-600">{(item.name || '').charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{`Rs. ${toNumber(item.price).toLocaleString()}`}</div>
                      </div>
                      <div className="text-sm font-medium">{`Rs. ${(toNumber(item.price) * (item.qty || 1)).toLocaleString()}`}</div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                        className="px-2 py-1 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border rounded text-sm font-medium">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                        className="px-2 py-1 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600">Subtotal</div>
            <div className="font-semibold">{`Rs. ${subtotal.toLocaleString()}`}</div>
          </div>
          <div className="space-y-2">
            <Button onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'Checkout' }); dispatch({ type: 'SET_CART_OPEN', payload: false }); }} primary>
              Go to Checkout
            </Button>
            <Button onClick={close} primary={false} className="w-full">Continue Shopping</Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ShoppingCartSidebar;
