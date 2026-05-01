import { Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';

interface AddToCartButtonProps {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  size?: 'default' | 'large';
}

export function AddToCartButton({ item, size = 'default' }: AddToCartButtonProps) {
  const { cart, addToCart, updateCartQuantity } = useApp();
  const isLarge = size === 'large';

  const cartItem = cart.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  if (quantity === 0) {
    return (
      <Button
        onClick={() => addToCart(item)}
        className={isLarge ? 'h-14 w-full text-base' : 'h-12 w-full'}
      >
        <Plus className="w-4 h-4" />
        Add to Cart
      </Button>
    );
  }

  return (
    <div className={`w-full bg-[#1e1e1e] border border-gray-700 text-white rounded-xl flex items-center justify-between px-1 transition-all overflow-hidden ${
      isLarge ? 'h-14' : 'h-12'
    }`}>
      <Button
        onClick={() => updateCartQuantity(item.id, quantity - 1)}
        variant="ghost"
        size="icon"
        className={`${isLarge ? 'h-12 w-12' : 'h-10 w-10'} rounded-xl text-gray-300 hover:bg-gray-800 flex-shrink-0`}
      >
        <Minus className="w-4 h-4 text-gray-300" />
      </Button>

      <span className="font-bold flex-1 text-center select-none text-lg text-white">{quantity}</span>

      <Button
        onClick={() => updateCartQuantity(item.id, quantity + 1)}
        variant="ghost"
        size="icon"
        className={`${isLarge ? 'h-12 w-12' : 'h-10 w-10'} rounded-xl text-gray-300 hover:bg-gray-800 flex-shrink-0`}
      >
        <Plus className="w-4 h-4 text-gray-300" />
      </Button>
    </div>
  );
}
