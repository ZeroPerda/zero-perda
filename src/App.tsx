import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/ui/Header';
import { BottomNav } from './components/nav/BottomNav';
import { CriticalAlertCard } from './components/batches/CriticalAlertCard';

import { BatchActionModal } from './components/batches/BatchActionModal';
import { Login } from './pages/Login';
import { AddBatch } from './pages/AddBatch';
import { batchService } from './services/batchService';
import type { Batch } from './types/database.types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layers, ChevronDown, ChevronRight } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import { ProductGroupCard } from './components/batches/ProductGroupCard';

function SectionGroup({ sectionName, batches, onBatchClick, onAddBatch }: { sectionName: string, batches: Batch[], onBatchClick: (b: Batch) => void, onAddBatch: (pid: string, q: number, d: string) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);



  if (batches.length === 0) return null;

  // Group batches by Product ID
  const groupedByProduct: Record<string, { name: string, batches: Batch[] }> = {};

  batches.forEach(batch => {
    const prodId = batch.product_id;
    if (!groupedByProduct[prodId]) {
      groupedByProduct[prodId] = {
        name: batch.products?.name || 'Item sem nome',
        batches: []
      };
    }
    groupedByProduct[prodId].batches.push(batch);
  });

  // Sort batches within product (Date ASC - FIFO already comes from SQL order usually, but let's ensure)
  // SQL Service does: .order('expiration_date', { ascending: true }); so they are sorted globally.
  // Pushing them in order preserves that.

  const productIds = Object.keys(groupedByProduct);

  return (
    <section className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900/50 p-4 border border-zinc-800 active:bg-zinc-800 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-full bg-black border border-zinc-700 transition-colors ${isOpen ? 'text-industrial-yellow border-industrial-yellow' : 'text-zinc-500'}`}>
            <Layers size={16} />
          </div>
          <h2 className={`font-black text-sm uppercase tracking-wider transition-colors ${isOpen ? 'text-white' : 'text-zinc-400'}`}>
            {sectionName}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-black px-2 py-1 rounded text-zinc-500 font-mono border border-zinc-800">
            {productIds.length} Prods
          </span>
          {isOpen ? <ChevronDown size={18} className="text-zinc-500" /> : <ChevronRight size={18} className="text-zinc-500" />}
        </div>
      </button>

      {isOpen && (
        <div className="space-y-2 mt-2 pl-2 border-l-2 border-zinc-800 ml-4 animate-in slide-in-from-top-2 duration-200">
          {productIds.map(prodId => (
            <ProductGroupCard
              key={prodId}
              productName={groupedByProduct[prodId].name}
              productId={prodId}
              batches={groupedByProduct[prodId].batches}
              onBatchClick={onBatchClick}
              onAddBatch={onAddBatch}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Dashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action Modal State
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true); // Soft loading if needed, or just standard
      const data = await batchService.getAllBatches();
      setBatches(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    window.addEventListener('focus', loadData);
    loadData();
    return () => window.removeEventListener('focus', loadData);
  }, []);

  const handleBatchAction = async (action: 'consumed' | 'discarded' | 'delete_product') => {
    if (!selectedBatch) return;
    setActionLoading(true);
    try {
      if (action === 'delete_product') {
        if (selectedBatch.products?.id) {
          await batchService.deleteProduct(selectedBatch.products.id);
        }
      } else {
        await batchService.updateBatchStatus(selectedBatch.id, action);
      }
      // Close and Refresh
      setSelectedBatch(null);
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert("Erro ao realizar ação");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string, quantity: number, date: string) => {
    await batchService.addBatchToProduct(productId, quantity, date);
    await loadData();
  };

  // Filter critical directly for the header alert
  const criticalBatches = batches.filter(batch => batchService.getDaysRemaining(batch.expiration_date) <= 3);

  // Group by Section
  const groupedBatches: Record<string, Batch[]> = {};
  batches.forEach(batch => {
    const sectionName = batch.products?.sections?.name || 'Sem Sessão';
    if (!groupedBatches[sectionName]) {
      groupedBatches[sectionName] = [];
    }
    groupedBatches[sectionName].push(batch);
  });

  // Sort sections alphabetically
  const sortedSections = Object.keys(groupedBatches).sort();

  // Count unique products
  const uniqueProductIds = new Set(batches.map(b => b.product_id));
  const totalProducts = uniqueProductIds.size;

  if (loading && batches.length === 0) {
    return (
      <AppShell>
        <div className="flex h-screen items-center justify-center">
          <span className="text-white font-mono animate-pulse">CARREGANDO SESSÕES...</span>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Header criticalCount={criticalBatches.length} totalItems={totalProducts} />

      <main className="p-4 pb-24 space-y-6">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 text-xs font-mono mb-4">
            SYSTEM ERROR: {error}
          </div>
        )}

        {/* Global Critical Alerts - Always visible at top */}
        {criticalBatches.length > 0 && (
          <section className="mb-8 p-4 bg-industrial-surface border-2 border-industrial-red shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-industrial-red rounded-full animate-ping" />
              <h2 className="font-black text-sm uppercase tracking-wider text-industrial-red">Aleras Críticos ({criticalBatches.length})</h2>
            </div>
            <div className="space-y-4">
              {criticalBatches.map(batch => (
                <CriticalAlertCard
                  key={'crit-' + batch.id}
                  productName={batch.products?.name || 'Desconhecido'}
                  daysRemaining={batchService.getDaysRemaining(batch.expiration_date)}
                  quantity={batch.quantity}
                  onAction={() => setSelectedBatch(batch)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sections List */}
        {sortedSections.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <p className="mb-2">Nenhuma sessão criada.</p>
            <p className="text-xs">Cadastre um produto para criar sessões.</p>
          </div>
        ) : (
          sortedSections.map(section => (
            <SectionGroup
              key={section}
              sectionName={section}
              batches={groupedBatches[section]}
              onBatchClick={setSelectedBatch}
              onAddBatch={handleQuickAdd}
            />
          ))
        )}
      </main>

      {/* ACTION MODAL */}
      <BatchActionModal
        batch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
        loading={actionLoading}
        onAction={handleBatchAction}
      />

      <BottomNav />
    </AppShell>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute>
              <AddBatch />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
