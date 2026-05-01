import { useState } from 'react';
import { Truck, ShoppingBag, UtensilsCrossed, MapPin, Clock, X, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type OrderType = 'delivery' | 'takeaway' | 'dine-in';
type OrderStatus = 'draft' | 'confirmed' | 'in-preparation' | 'ready' | 'delivered';

const statusSteps: OrderStatus[] = ['draft', 'confirmed', 'in-preparation', 'ready', 'delivered'];

const statusLabels: Record<OrderStatus, string> = {
  draft: 'Created',
  confirmed: 'Order Confirmed',
  'in-preparation': 'In Preparation',
  ready: 'Ready',
  delivered: 'Delivered'
};

export function OrderPage() {
  const { user, orders, cancelOrder, cart, addOrder, clearCart } = useApp();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<OrderType>('delivery');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const orderTypes = [
    { type: 'delivery' as OrderType, icon: Truck, label: 'Delivery', description: 'Get it delivered to your door' },
    { type: 'takeaway' as OrderType, icon: ShoppingBag, label: 'Takeaway', description: 'Pick up from restaurant' },
    { type: 'dine-in' as OrderType, icon: UtensilsCrossed, label: 'Dine-In', description: 'Eat at the restaurant' }
  ];

  const getStatusIndex = (status: OrderStatus) => statusSteps.indexOf(status);
  const clientOrders = orders.filter(order => {
    if (order.origin !== 'client') return false;
    if (!user) return true;
    return !order.createdByUserId || order.createdByUserId === user.id;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    const newErrors: string[] = [];

    if (cart.length === 0) {
      newErrors.push('Your cart is empty. Add items from the Menu before placing an order.');
    }
    if (selectedType === 'delivery' && !address.trim()) {
      newErrors.push('Please enter a delivery address.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors([]);
    addOrder({
      type: selectedType,
      items: cart,
      total: cartTotal,
      status: 'confirmed',
      origin: 'client',
      createdByUserId: user?.id,
      ...(selectedType === 'delivery' && { address: address.trim() })
    });
    clearCart();
    setAddress('');
    setSuccessMsg('🎉 Your order has been placed successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-8">Order Management</h1>

        {/* Success message */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-green-900/30 border border-green-700 text-green-400 px-6 py-4 rounded-2xl">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-900/20 border border-red-800 rounded-2xl px-6 py-4">
            <ul className="space-y-1">
              {errors.map((err, i) => (
                <li key={i} className="text-red-400 text-sm flex items-start gap-2">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Order Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Select Order Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orderTypes.map(({ type, icon: Icon, label, description }) => (
              <Button
                key={type}
                onClick={() => setSelectedType(type)}
                variant="outline"
                className={`h-auto p-6 border-2 transition-all text-left ${selectedType === type
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-[#242424] border-gray-800 hover:border-gray-700'
                  }`}
              >
                <Icon className={`w-12 h-12 mb-4 ${selectedType === type ? 'text-blue-400' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold text-white mb-2">{label}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
              </Button>
            ))}
          </div>

          {/* Delivery Address */}
          {selectedType === 'delivery' && (
            <div className="mt-6 bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <label className="flex items-center gap-2 text-white mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Delivery Address</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Order Summary + Place Order button */}
        <div className="mb-12 bg-[#242424] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Order Summary</h2>
            <span className="text-blue-400 font-bold text-lg">{cartTotal} MDL</span>
          </div>
          {cart.length > 0 ? (
            <>
              <ul className="space-y-2 mb-6">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between text-sm text-gray-300">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{item.price * item.quantity} MDL</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handlePlaceOrder}
                className="w-full h-12"
              >
                Place Order
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">No items in cart yet. Visit the Menu to add items.</p>
              <Button
                onClick={() => navigate('/menu')}
                variant="secondary"
                className="w-full h-12"
              >
                Browse Menu
              </Button>
            </>
          )}
        </div>

        {/* Active Orders */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Orders</h2>

          {clientOrders.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl p-12 border border-gray-800 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {clientOrders.map(order => {
                const currentStatusIndex = getStatusIndex(order.status);
                const canCancel = order.status === 'draft' || order.status === 'confirmed';

                return (
                  <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Order #{order.id}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="capitalize">{order.type}</span>
                          <span className="text-blue-400 font-bold">{order.total} MDL</span>
                        </div>
                      </div>
                      {canCancel && (
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                              cancelOrder(order.id);
                            }
                          }}
                          variant="destructive"
                          className="bg-red-900/30 hover:bg-red-900/50 text-red-400"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      )}
                    </div>

                    {/* Order Status Timeline */}
                    <div className="relative mb-6">
                      <div className="flex justify-between items-center">
                        {statusSteps.map((status, index) => {
                          const isActive = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;

                          return (
                            <div key={status} className="flex-1 relative">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-gray-800 border-gray-700 text-gray-500'
                                    } ${isCurrent ? 'ring-4 ring-blue-600/30' : ''}`}
                                >
                                  {isActive ? '✓' : index + 1}
                                </div>
                                <span className={`text-xs mt-2 text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                  {statusLabels[status]}
                                </span>
                              </div>
                              {index < statusSteps.length - 1 && (
                                <div
                                  className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-all ${isActive ? 'bg-blue-600' : 'bg-gray-800'
                                    }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
                        <MapPin className="w-4 h-4 mt-0.5 text-blue-400" />
                        <span>{order.address}</span>
                      </div>
                    )}

                    {/* Estimated Time */}
                    {order.status !== 'delivered' && (
                      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          Estimated time: {
                            order.status === 'confirmed' ? '30-40 minutes' :
                              order.status === 'draft' ? 'Waiting to be sent to kitchen' :
                              order.status === 'in-preparation' ? '15-20 minutes' :
                                '5 minutes'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
