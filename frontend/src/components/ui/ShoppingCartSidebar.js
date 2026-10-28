'use client'

import React from 'react'; import Image from 'next/image'; import { useRouter } from 'next/navigation';
import { useCart } from '@/context/AppContext';
import { Icon, Button } from '@/components/common/UIComponents';
import { showToast } from '@/utils/toast';
import { getFrequentlyBoughtTogether } from '@/utils/productApi';

const ShoppingCartSidebar = () => {
  const router = useRouter();
  const { cartItems, isCartOpen, cartLoading, updateCartItem, removeItemFromCart, closeCart, addItemToCart } = useCart();
  const [fbtItems, setFbtItems] = React.useState([]);
  const [fbtLoading, setFbtLoading] = React.useState(false);

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

  React.useEffect(() => {
    const fetchFrequentlyBoughtTogether = async () => {
      if (!isCartOpen || cartItems.length === 0) {
        setFbtItems([]);
        return;
      }

      const seedProductIds = [...new Set(cartItems.map(item => item.productId || item.id).filter(Boolean))].slice(0, 3);
      if (seedProductIds.length === 0) {
        setFbtItems([]);
        return;
      }

      setFbtLoading(true);
      try {
        const responses = await Promise.all(
          seedProductIds.map((id) => getFrequentlyBoughtTogether(id).catch(() => ({ suggestions: [] })))
        );

        const cartProductIds = new Set(cartItems.map(item => String(item.productId || item.id)));
        const scored = new Map();

        responses.forEach((payload) => {
          (payload?.suggestions || []).forEach((product, index) => {
            const productId = String(product?._id || '');
            if (!productId || cartProductIds.has(productId) || Number(product?.stock || 0) <= 0) return;

            const existing = scored.get(productId) || { ...product, score: 0 };
            const rankScore = Math.max(1, 6 - index);
            const frequencyScore = Number(product.frequency) || 0;
            existing.score += rankScore + frequencyScore;
            scored.set(productId, existing);
          });
        });

        const sorted = [...scored.values()]
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        setFbtItems(sorted);
      } catch {
        setFbtItems([]);
      } finally {
        setFbtLoading(false);
      }
    };

    fetchFrequentlyBoughtTogether();
  }, [cartItems, isCartOpen]);

  const handleAddSuggestedItem = async (productId, name) => {
    try {
      await addItemToCart(productId, 1);
      showToast.success(`${name} added to cart`);
    } catch (error) {
      console.error('Error adding suggested product:', error);
      showToast.error('Failed to add suggested item');
    }
  };

  // Group items by vendor
  const groupedByVendor = React.useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      const vendorId = item.vendorId || 'unknown';
      const vendorName = item.vendorName || item.shopName || 'Unknown Vendor';

      if (!groups[vendorId]) {
        groups[vendorId] = {
          vendorId,
          vendorName,
          items: []
        };
      }
      groups[vendorId].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={closeCart} />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[28rem] flex-col bg-white shadow-xl sm:w-[28rem]">
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
            <div className="space-y-6">
              {groupedByVendor.map(group => (
                <div key={group.vendorId} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm text-gray-700">{group.vendorName}</h4>
                  </div>
                  <ul className="space-y-3">
                    {group.items.map(item => (
                      <li key={item.productId || item.id} className="flex items-start space-x-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
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
                </div>
              ))}

              <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-amber-50 via-white to-lime-50 p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Frequently Bought Together</h4>
                    <p className="text-xs text-gray-600 mt-1">Curated from products commonly purchased with your cart items.</p>
                  </div>
                  <span className="inline-flex items-center whitespace-nowrap rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold leading-none text-orange-700">Top picks</span>
                </div>

                {fbtLoading ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2, 3].map((skeleton) => (
                      <div key={skeleton} className="h-20 animate-pulse rounded-xl bg-white/70 border border-orange-100" />
                    ))}
                  </div>
                ) : fbtItems.length === 0 ? (
                  <p className="text-xs text-gray-500">No suggestions yet. Add more products to unlock smarter bundles.</p>
                ) : (
                  <div className="space-y-3">
                    {fbtItems.map((product) => (
                      <div key={product._id} className="group rounded-xl border border-orange-100 bg-white/80 p-2 transition hover:bg-white hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => { router.push(`/products/${product._id}`); closeCart(); }}
                            className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100"
                            aria-label={`View ${product.name}`}
                          >
                            {product.images?.[0]?.url ? (
                              <Image src={product.images[0].url} alt={product.name} fill sizes="64px" className="object-cover" />
                            ) : (
                              <span className="text-xs text-gray-500">No image</span>
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => { router.push(`/products/${product._id}`); closeCart(); }}
                              className="block truncate text-left text-sm font-semibold text-gray-900 hover:text-orange-700"
                            >
                              {product.name}
                            </button>
                            <p className="truncate text-xs text-gray-500 mt-0.5">{product.vendor?.shopName || product.vendor?.name || 'Selected for you'}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-bold text-orange-700">Rs. {toNumber(product.price).toLocaleString()}</span>
                              {product.frequency ? (
                                <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-700">{product.frequency}x together</span>
                              ) : null}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddSuggestedItem(product._id, product.name)}
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={cartLoading}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
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
