import { Trash2, ShoppingBag } from 'lucide-react';

export interface CriticalAlertCardProps {
    productName: string;
    // sku removed
    daysRemaining: number | string;
    quantity: number;
    onAction: () => void;
}

export function CriticalAlertCard({ productName, daysRemaining, quantity, onAction }: CriticalAlertCardProps) {
    return (
        <div className="bg-industrial-red text-white p-4 border-2 border-black shadow-industrial relative overflow-hidden group">
            {/* Background texture helper */}
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 transform rotate-12 pointer-events-none">
                <ShoppingBag size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-black text-xl leading-tight mt-1 uppercase max-w-[80%]">
                            {productName}
                        </h3>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold opacity-80 uppercase">Vencimento</span>
                        <span className="font-mono text-3xl font-bold tracking-tighter">
                            {daysRemaining}d
                        </span>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-4">
                    <div className="bg-black/20 px-3 py-1 rounded">
                        <span className="text-xs uppercase font-bold block opacity-70">Qtd</span>
                        <span className="font-mono text-lg font-bold">{quantity} un</span>
                    </div>

                    <button
                        onClick={onAction}
                        className="bg-white text-industrial-red border-2 border-black px-4 py-2 font-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                    >
                        <Trash2 size={16} strokeWidth={3} />
                        Dar Baixa
                    </button>
                </div>
            </div>
        </div>
    );
}
