import { useEffect, useMemo, useState } from 'react';
import { Truck, ShoppingBag, UtensilsCrossed, MapPin, Clock, X, CheckCircle, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { createOrder } from '../services/orderService';
import { getReservationTableBlocks, type ApiReservationTableBlock } from '../services/reservationService';
import { getTables, type ApiTable } from '../services/tableService';
import { translateProductName } from '../data/translationHelpers';

type OrderType = 'delivery' | 'takeaway' | 'dine-in';
type OrderStatus = 'draft' | 'confirmed' | 'sent-to-kitchen' | 'in-preparation' | 'preparing' | 'ready' | 'delivered' | 'closed';

const statusSteps: OrderStatus[] = ['draft', 'sent-to-kitchen', 'preparing', 'ready', 'delivered'];

const reservationWindowMs = 2 * 60 * 60 * 1000;

function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReservationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' });
}

export function OrderPage() {
  const { user, orders, cancelOrder, cart, addOrder, clearCart, updateTableStatus, t } = useApp();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<OrderType>('delivery');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [reservationBlocks, setReservationBlocks] = useState<ApiReservationTableBlock[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [tableError, setTableError] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [cardDetails, setCardDetails] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const orderTypes = [
    { type: 'delivery' as OrderType, icon: Truck, label: t.order.orderTypes.delivery.label, description: t.order.orderTypes.delivery.description },
    { type: 'takeaway' as OrderType, icon: ShoppingBag, label: t.order.orderTypes.takeaway.label, description: t.order.orderTypes.takeaway.description },
    { type: 'dine-in' as OrderType, icon: UtensilsCrossed, label: t.order.orderTypes.dineIn.label, description: t.order.orderTypes.dineIn.description }
  ];

  const getStatusIndex = (status: OrderStatus) => statusSteps.indexOf(status);
  const clientOrders = orders.filter(order => {
    if (order.origin !== 'client') return false;
    if (!user) return true;
    return !order.createdByUserId || order.createdByUserId === user.id;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isStaffUser = user?.role === 'admin' || user?.role === 'waiter' || user?.role === 'manager';

  useEffect(() => {
    if (selectedType !== 'dine-in') {
      setSelectedTableId(null);
      setSelectedTableNumber(null);
      return;
    }

    let isMounted = true;

    async function loadTableOptions() {
      try {
        setIsLoadingTables(true);
        setTableError('');
        const today = toDateInputValue();
        const [tableRows, blockRows] = await Promise.all([
          getTables(),
          getReservationTableBlocks(today)
        ]);

        if (!isMounted) return;
        setTables(tableRows);
        setReservationBlocks(blockRows);
      } catch (error) {
        if (!isMounted) return;
        setTableError(error instanceof Error ? error.message : t.order.tableLoadError);
      } finally {
        if (isMounted) {
          setIsLoadingTables(false);
        }
      }
    }

    loadTableOptions();

    return () => {
      isMounted = false;
    };
  }, [selectedType]);

  const activeReservationBlocks = useMemo(() => (
    reservationBlocks.filter((block) => {
      const status = block.status.toLowerCase();
      if (status !== 'pending' && status !== 'confirmed') return false;
      const reservationStart = new Date(block.reservationDate).getTime();
      if (Number.isNaN(reservationStart)) return false;
      return reservationStart + reservationWindowMs >= Date.now();
    })
  ), [reservationBlocks]);

  const tableOptions = useMemo(() => (
    tables.map((table) => {
      const reservation = activeReservationBlocks.find((block) =>
        block.tableId === table.id || block.tableNumber === table.tableNumber
      );
      const status = table.isOccupied ? 'occupied' : reservation ? 'reserved' : 'free';
      const canSelect = !table.isOccupied && (!reservation || reservation.isMine || isStaffUser);

      return {
        ...table,
        reservation,
        status,
        canSelect
      };
    })
  ), [activeReservationBlocks, isStaffUser, tables]);

  useEffect(() => {
    if (selectedType !== 'dine-in' || selectedTableId) return;

    const mine = tableOptions.find((table) => table.reservation?.isMine && table.canSelect);
    if (mine) {
      setSelectedTableId(mine.id);
      setSelectedTableNumber(mine.tableNumber);
    }
  }, [selectedTableId, selectedType, tableOptions]);

  const selectableTableCount = tableOptions.filter((table) => table.canSelect).length;

  const getEstimatedTime = (status: OrderStatus) => {
    if (status === 'draft') return t.order.estimatedTimes.draft;
    if (status === 'confirmed') return t.order.estimatedTimes.confirmed;
    if (status === 'sent-to-kitchen') return t.order.estimatedTimes['sent-to-kitchen'];
    if (status === 'in-preparation') return t.order.estimatedTimes['in-preparation'];
    if (status === 'preparing') return t.order.estimatedTimes.preparing;
    return t.order.estimatedTimes.other;
  };

  const handlePlaceOrder = async () => {
    const newErrors: string[] = [];

    if (cart.length === 0) {
      newErrors.push(t.order.errorCart);
    }
    if (selectedType === 'delivery' && !address.trim()) {
      newErrors.push(t.order.errorAddress);
    }
    if (selectedType === 'delivery') {
      const cardNumberDigits = cardDetails.number.replace(/\D/g, '');
      const cvvDigits = cardDetails.cvv.replace(/\D/g, '');

      if (!cardDetails.holder.trim()) {
        newErrors.push(t.order.cardHolderRequired);
      }
      if (cardNumberDigits.length !== 16) {
        newErrors.push(t.order.cardNumberInvalid);
      }
      if (!cardDetails.expiry.trim()) {
        newErrors.push(t.order.expiryRequired);
      }
      if (cvvDigits.length !== 3) {
        newErrors.push(t.order.cvvInvalid);
      }
    }
    if (selectedType === 'dine-in' && !selectedTableId) {
      newErrors.push(t.order.pleaseSelectTable);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      if (selectedType === 'delivery' && address.trim()) {
        const token = localStorage.getItem('token');
        const parts = address.trim().split(',');
        await fetch('http://localhost:5224/api/Address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            street: parts[0]?.trim() || address.trim(),
            city: parts[1]?.trim() || 'Chisinau',
            postalCode: parts[2]?.trim() || '2000',
            country: 'Moldova',
            additionalInfo: ''
          })
        }).catch(() => undefined);
      }

      const createdOrder = await createOrder({
        orderType:
          selectedType === 'delivery' ? 'Delivery' :
            selectedType === 'takeaway' ? 'Takeaway' :
              'DineIn',
        deliveryAddress: selectedType === 'delivery' ? address.trim() : null,
        tableId: selectedType === 'dine-in' ? selectedTableId : null,
        isPaid: selectedType === 'delivery',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      }, user?.role);

      addOrder({
        apiId: createdOrder.id,
        type: selectedType,
        items: cart,
        total: createdOrder.totalAmount || cartTotal,
        status: 'draft',
        origin: 'client',
        createdByUserId: user?.id,
        ...(selectedType === 'dine-in' && { tableNumber: createdOrder.tableNumber || selectedTableNumber || undefined }),
        ...(selectedType === 'delivery' && { address: address.trim() })
      });
      if (selectedType === 'dine-in' && selectedTableId) {
        updateTableStatus(selectedTableId, 'occupied');
      }
      clearCart();
      setAddress('');
      setCardDetails({ holder: '', number: '', expiry: '', cvv: '' });
      setSelectedTableId(null);
      setSelectedTableNumber(null);
      setSuccessMsg(selectedType === 'delivery' ? t.order.paymentSuccessfulDelivery : t.order.successMsg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : t.order.errorPlaceOrder]);
      setSuccessMsg('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-8">{t.order.title}</h1>

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-green-900/30 border border-green-700 text-green-400 px-6 py-4 rounded-2xl">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

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

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">{t.order.selectType}</h2>
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

          {selectedType === 'delivery' && (
            <div className="mt-6 bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <label className="flex items-center gap-2 text-white mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>{t.order.deliveryAddress}</span>
              </label>
              <Input
                type="text"
                placeholder={t.order.deliveryPlaceholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-2">{t.order.deliveryFormatHint}</p>

              <div className="mt-6 rounded-2xl border border-blue-900/50 bg-blue-950/20 p-5">
                <label className="mb-4 flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <span>{t.order.onlinePayment}</span>
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder={t.order.cardHolder}
                      value={cardDetails.holder}
                      onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.order.cardNumber}
                      value={cardDetails.number}
                      maxLength={19}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder={t.order.expiry}
                    value={cardDetails.expiry}
                    maxLength={7}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  />
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder={t.order.cvv}
                    value={cardDetails.cvv}
                    maxLength={3}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedType === 'dine-in' && (
            <div className="mt-6 bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{t.order.selectTable}</h3>
                  <p className="text-sm text-gray-400">{t.order.reservedTableHint}</p>
                </div>
                {selectedTableNumber && (
                  <span className="rounded-full border border-blue-700 bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-200">
                    {t.order.selectedTable} #{selectedTableNumber}
                  </span>
                )}
              </div>

              {isLoadingTables && (
                <p className="text-sm text-gray-400">{t.order.loadingTables}</p>
              )}

              {tableError && (
                <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                  {tableError}
                </div>
              )}

              {!isLoadingTables && !tableError && tableOptions.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {tableOptions.map((table) => (
                    <Button
                      key={table.id}
                      type="button"
                      variant="outline"
                      disabled={!table.canSelect}
                      onClick={() => {
                        setSelectedTableId(table.id);
                        setSelectedTableNumber(table.tableNumber);
                      }}
                      className={`h-auto min-h-[120px] border-2 p-4 text-left ${
                        selectedTableId === table.id
                          ? 'border-blue-500 bg-blue-900/40'
                          : table.status === 'occupied'
                            ? 'border-red-700 bg-red-900/20 opacity-70'
                            : table.status === 'reserved'
                              ? 'border-yellow-700 bg-yellow-900/20'
                              : 'border-green-700 bg-green-900/20'
                      }`}
                    >
                      <div className="w-full">
                        <p className="text-lg font-bold text-white">{t.common.table} #{table.tableNumber}</p>
                        <p className="text-sm text-gray-300">{table.capacity} {t.common.seats}</p>
                        <p className={`mt-2 text-xs font-semibold ${
                          table.status === 'occupied'
                            ? 'text-red-300'
                            : table.status === 'reserved'
                              ? 'text-yellow-300'
                              : 'text-green-300'
                        }`}>
                          {table.status === 'occupied' ? t.common.occupied : table.status === 'reserved' ? t.common.reserved : t.common.free}
                        </p>
                        {table.reservation && (
                          <p className="mt-1 text-xs text-yellow-100">
                            {formatReservationTime(table.reservation.reservationDate)} - {table.reservation.numberOfGuests} {t.common.guests}
                          </p>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {!isLoadingTables && !tableError && tableOptions.length > 0 && selectableTableCount === 0 && (
                <p className="mt-4 rounded-xl border border-yellow-900/60 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-200">
                  {t.order.noAvailableTables}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-12 bg-[#242424] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{t.order.orderSummary}</h2>
            <span className="text-blue-400 font-bold text-lg">{cartTotal} MDL</span>
          </div>
          {cart.length > 0 ? (
            <>
              <ul className="space-y-2 mb-6">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between text-sm text-gray-300">
                    <span>{translateProductName(t, item.name)} x {item.quantity}</span>
                    <span>{item.price * item.quantity} MDL</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handlePlaceOrder} className="w-full h-12" disabled={isSubmitting}>
                {isSubmitting ? t.order.placingOrder : t.order.placeOrder}
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">{t.order.noCartItems}</p>
              <Button onClick={() => navigate('/menu')} variant="secondary" className="w-full h-12">
                {t.order.browseMenu}
              </Button>
            </>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">{t.order.yourOrders}</h2>
          {clientOrders.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl p-12 border border-gray-800 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">{t.order.noOrders}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {clientOrders.map(order => {
                const currentStatusIndex = getStatusIndex(order.status);
                const canCancel = order.status === 'draft';

                return (
                  <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
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
                            if (confirm(t.order.cancelConfirm)) {
                              cancelOrder(order.id);
                            }
                          }}
                          variant="destructive"
                          className="bg-red-900/30 hover:bg-red-900/50 text-red-400"
                        >
                          <X className="w-4 h-4" />
                          {t.order.cancel}
                        </Button>
                      )}
                    </div>

                    <div className="relative mb-6">
                      <div className="flex justify-between items-center">
                        {statusSteps.map((status, index) => {
                          const isActive = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;
                          return (
                            <div key={status} className="flex-1 relative">
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'} ${isCurrent ? 'ring-4 ring-blue-600/30' : ''}`}>
                                  {isActive ? 'OK' : index + 1}
                                </div>
                                <span className={`text-xs mt-2 text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                  {t.order.statusLabels[status]}
                                </span>
                              </div>
                              {index < statusSteps.length - 1 && (
                                <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-all ${isActive ? 'bg-blue-600' : 'bg-gray-800'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {order.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
                        <MapPin className="w-4 h-4 mt-0.5 text-blue-400" />
                        <span>{order.address}</span>
                      </div>
                    )}

                    {order.status !== 'delivered' && (
                      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          {t.order.estimatedTime} {getEstimatedTime(order.status)}
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
