import { Scan, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function BottomNav() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-md mx-auto px-4 pointer-events-auto">
                <nav className="bg-industrial text-white border-2 border-black shadow-industrial p-2 flex justify-between items-center rounded-lg">
                    <div className="p-3 flex flex-col items-center gap-1 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">2026 - Zero Perda</span>
                    </div>

                    <button
                        onClick={() => navigate('/add')}
                        className="bg-industrial-yellow text-black p-4 rounded-full border-2 border-black shadow-none -mt-8 hover:-translate-y-9 transition-all active:translate-y-0 active:shadow-inner flex items-center justify-center cursor-pointer"
                    >
                        <Scan size={28} strokeWidth={3} />
                    </button>

                    <button
                        onClick={signOut}
                        className="p-3 hover:bg-white/10 rounded-md transition-colors flex flex-col items-center gap-1 active:scale-95 text-red-400"
                    >
                        <LogOut size={20} strokeWidth={2} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sair</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
