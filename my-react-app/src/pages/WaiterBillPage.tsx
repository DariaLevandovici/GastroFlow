import { useState } from 'react';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';

export function WaiterBillPage() {
  const navigate = useNavigate();
  const { orders, tables } = useApp();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Filter orders for dine-in that are ready or delivered
  const tableOrders = orders.filter(o => o.type === 'dine-in' && (o.status === 'ready' || o.status === 'delivered'));

  const selectedTableOrders = selectedTable 
    ? tableOrders.filter((_, idx) => tables[idx % tables.length]?.number === selectedTable)
    : [];

  const totalBill = selectedTableOrders.reduce((sum, order) => sum + order.total, 0);
  const tax = totalBill * 0.1;
  const grandTotal = totalBill + tax;

  const handlePrintBill = () => {
    window.print();
  };

  const handleGenerateBill = () => {
    if (!selectedTable) {
      alert('Please select a table');
      return;
    }
    alert(`Bill generated for Table ${selectedTable}\nTotal: ${grandTotal.toFixed(2)} MDL`);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard/waiter')}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <h1 className="text-4xl font-bold text-white">Generate Bill</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Selection */}
          <div className="lg:col-span-1">
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Select Table</h3>
              <div className="grid grid-cols-3 gap-3">
                {tables.filter(t => t.status === 'occupied').map(table => (
                  <Button
                    key={table.id}
                    onClick={() => setSelectedTable(table.number)}
                    variant="outline"
                    className={`h-auto p-4 border-2 transition-all ${
                      selectedTable === table.number
                        ? 'bg-blue-900/30 border-blue-600'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-white font-bold text-center text-lg">{table.number}</p>
                    <p className="text-gray-400 text-xs text-center mt-1">Occupied</p>
                  </Button>
                ))}
              </div>

              {tables.filter(t => t.status === 'occupied').length === 0 && (
                <p className="text-gray-400 text-center py-4 text-sm">No occupied tables</p>
              )}
            </div>
          </div>

          {/* Bill Details */}
          <div className="lg:col-span-2">
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
              {selectedTable ? (
                <>
                  {/* Bill Header */}
                  <div className="text-center mb-8 pb-6 border-b border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-2">GastroFlow</h2>
                    <p className="text-gray-400">Restaurant & Bar</p>
                    <p className="text-gray-500 text-sm mt-2">Str. Stefan cel Mare 123, Chisinau</p>
                  </div>

                  {/* Table Info */}
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-blue-400 font-bold text-lg">Table {selectedTable}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Server: Waiter #{Math.floor(Math.random() * 10) + 1}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">Items</h3>
                    <div className="space-y-3">
                      {selectedTableOrders.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No orders for this table</p>
                      ) : (
                        // Mock items based on order total
                        <>
                          <div className="flex justify-between py-3 border-b border-gray-700">
                            <div className="flex-1">
                              <p className="text-white font-semibold">Ribeye Steak</p>
                              <p className="text-gray-400 text-sm">Premium 350g ribeye, grilled vegetables</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-white">1x</p>
                              <p className="text-blue-400 font-bold">385 MDL</p>
                            </div>
                          </div>
                          <div className="flex justify-between py-3 border-b border-gray-700">
                            <div className="flex-1">
                              <p className="text-white font-semibold">House Wine</p>
                              <p className="text-gray-400 text-sm">Red wine selection</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-white">1x</p>
                              <p className="text-blue-400 font-bold">55 MDL</p>
                            </div>
                          </div>
                          <div className="flex justify-between py-3 border-b border-gray-700">
                            <div className="flex-1">
                              <p className="text-white font-semibold">Tiramisu</p>
                              <p className="text-gray-400 text-sm">Classic Italian dessert</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-white">1x</p>
                              <p className="text-blue-400 font-bold">75 MDL</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bill Summary */}
                  <div className="space-y-3 mb-8 pt-6 border-t border-gray-700">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white">515 MDL</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Tax (10%)</span>
                      <span className="text-white">51.50 MDL</span>
                    </div>
                    <div className="h-px bg-gray-700" />
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-blue-400">566.50 MDL</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handlePrintBill}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Printer className="w-4 h-4" />
                      Print Bill
                    </Button>
                    <Button
                      onClick={handleGenerateBill}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Finalize & Close
                    </Button>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-6">
                    Thank you for dining with us!
                  </p>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">Please select a table to generate bill</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
