import type { MenuItem } from '../../../services/menuService';
import { AddToCartButton } from '../../../components/AddToCartButton';
import { useApp } from '../../../context/AppContext';
import { translateProductDescription, translateProductName } from '../../../data/translationHelpers';

interface ProductCardProps {
  item: MenuItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const { t } = useApp();
  const productName = translateProductName(t, item.name);

  return (
    <article className="bg-[#242424] rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-700 hover:scale-[1.02] transition-all duration-300 flex h-full flex-col">
      <div className="h-56 w-full overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-7 flex flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h4 className="text-2xl font-bold text-white leading-tight line-clamp-2 min-h-[4rem]">
            {productName}
          </h4>
          <span className="text-blue-400 font-bold text-xl whitespace-nowrap">{item.price} MDL</span>
        </div>
        <p className="text-gray-400 text-base line-clamp-2 min-h-[3rem]">{translateProductDescription(t, item)}</p>
        <div className="mt-auto pt-5">
          <AddToCartButton item={item} size="large" />
        </div>
      </div>
    </article>
  );
}
