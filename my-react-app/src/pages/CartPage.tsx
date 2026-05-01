import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';

export function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/order');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-700 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some delicious items to get started!</p>
            <Button
              onClick={() => navigate('/menu')}
              className="px-8"
            >
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-[#242424] rounded-2xl p-6 border border-gray-800 flex gap-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-blue-400 font-bold">{item.price} MDL</p>
                    </div>
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 h-9 w-9"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-800 rounded-full px-4 py-2">
                      <Button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white h-7 w-7"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                      <Button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white h-7 w-7"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-gray-400">
                      Subtotal: <span className="text-white font-bold">{item.price * item.quantity} MDL</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={clearCart}
              variant="destructive"
              className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400"
            >
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">{subtotal.toFixed(2)} MDL</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (10%)</span>
                  <span className="text-white">{tax.toFixed(2)} MDL</span>
                </div>
                <div className="h-px bg-gray-700" />
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-blue-400">{total.toFixed(2)} MDL</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-3 block">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full h-12"
              >
                Proceed to Checkout
              </Button>

              <Button
                onClick={() => navigate('/menu')}
                variant="secondary"
                className="w-full mt-3"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
