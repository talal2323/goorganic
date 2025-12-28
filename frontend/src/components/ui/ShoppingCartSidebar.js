'use client'

import React from 'react'; import Image from 'next/image'; import { useRouter } from 'next/navigation';
import { useCart } from '@/context/AppContext';
import { Icon, Button } from '@/components/common/UIComponents';
import { showToast } from '@/utils/toast';

const ShoppingCartSidebar = () => {
  const router = useRouter();
  const { cartItems, isCartOpen, cartLoading, updateCartItem, removeItemFromCart, closeCart } = useCart();

  // Normalize price to a number even if it comes as a string like "Rs. 120 / kg"
  const toNumber = (price) => {
    if (typeof price === 'number' && !isNaN(price)) return price;
    const str = String(price || '').replace(/,/g, '');
    const match = str.match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeItemFromCart(productId);
      showToast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast.error('Failed to remove item');
    }
  };

  const handleUpdateQty = async (productId, newQty) => {
    const q = Number(newQty);
    if (q <= 0) return;

    try {
      await updateCartItem(productId, q);
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast.error('Failed to update quantity');
    }
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
            <button onClick={closeCart} aria-label="Close cart" className="p-2 hover:bg-gray-100 rounded">
              <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {cartLoading ? (
            <div className="text-center text-gray-500 mt-12">
              <p className="font-medium">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <Icon path="M3 3h18v14a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm">Add products to see them here.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map(item => (
                <li key={item.productId || item.id} className="flex items-start space-x-3">
                  <div className="relative w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <span className="text-sm text-gray-600">{(item.name || '').charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{`Rs. ${toNumber(item.price).toLocaleString()}`}</div>
                        {item.stock !== undefined && item.stock < 5 && (
                          <div className="text-xs text-orange-500 mt-1">Only {item.stock} left</div>
                        )}
                      </div>
                      <div className="text-sm font-medium">{`Rs. ${(toNumber(item.price) * (item.qty || 1)).toLocaleString()}`}</div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQty(item.productId || item.id, (item.qty || 1) - 1)}
                        className="px-2 py-1 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
                        aria-label={`Decrease quantity for ${item.name}`}
                        disabled={cartLoading || (item.qty || 1) <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border rounded text-sm font-medium">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId || item.id, (item.qty || 1) + 1)}
                        className="px-2 py-1 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
                        aria-label={`Increase quantity for ${item.name}`}
                        disabled={cartLoading || (item.stock !== undefined && (item.qty || 1) >= item.stock)}
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.productId || item.id)}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        disabled={cartLoading}
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
            <Button
              onClick={() => { router.push('/checkout'); closeCart(); }}
              primary
              disabled={cartItems.length === 0 || cartLoading}
            >
              Go to Checkout
            </Button>
            <Button
              onClick={() => { router.push('/shop'); closeCart(); }}
              primary={false}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ShoppingCartSidebar;
