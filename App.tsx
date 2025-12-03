import React, { useState, useEffect } from 'react';
import { Expense, ViewState } from './types';
import { Dashboard } from './views/Dashboard';
import { AddExpense } from './views/AddExpense';
import { Reports } from './views/Reports';
import { Login } from './views/Login';
import { Home, Plus, PieChart, LogOut } from 'lucide-react';

// Firebase imports
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    onSnapshot,
    orderBy,
    setDoc,
    getDoc
} from 'firebase/firestore';

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bikeName, setBikeName] = useState<string>('Mi Moto');

  // 1. Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Expenses & Settings when User is Logged In
  useEffect(() => {
    if (!user) {
        setExpenses([]);
        return;
    }

    // A. Listen to Expenses Collection
    const q = query(
        collection(db, 'expenses'), 
        where('uid', '==', user.uid),
        orderBy('date', 'desc') // Requires an index in Firestore? Sometimes. If fails, remove orderBy and sort in JS.
    );

    const unsubscribeExpenses = onSnapshot(q, (snapshot) => {
        const fetchedExpenses: Expense[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Expense));
        
        // Ensure client-side sort if firestore index is missing or creating issues
        fetchedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setExpenses(fetchedExpenses);
    });

    // B. Listen to User Settings (Bike Name)
    // We store settings in a separate collection or a user document
    const userSettingsRef = doc(db, 'user_settings', user.uid);
    const unsubscribeSettings = onSnapshot(userSettingsRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.bikeName) setBikeName(data.bikeName);
        }
    });

    return () => {
        unsubscribeExpenses();
        unsubscribeSettings();
    };
  }, [user]);

  // Safety check: Redirect if editing item doesn't exist
  useEffect(() => {
    if (view === 'edit' && editingId) {
      const exists = expenses.some(e => e.id === editingId);
      if (!exists) {
        setEditingId(null);
        setView('dashboard');
      }
    }
  }, [expenses, view, editingId]);

  const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
        if (editingId) {
            // Update in Firestore
            const expenseRef = doc(db, 'expenses', editingId);
            await updateDoc(expenseRef, {
                part: expenseData.part,
                cost: expenseData.cost,
                date: expenseData.date,
                description: expenseData.description
            });
            setEditingId(null);
        } else {
            // Create in Firestore
            await addDoc(collection(db, 'expenses'), {
                uid: user.uid,
                ...expenseData,
                createdAt: Date.now()
            });
        }
        setView('dashboard');
    } catch (e) {
        console.error("Error saving document: ", e);
        alert("Error al guardar. Revisa tu conexión.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro permanentemente?')) {
      try {
          await deleteDoc(doc(db, 'expenses', id));
          if (editingId === id) {
            setEditingId(null);
            setView('dashboard');
          }
      } catch (e) {
          console.error("Error deleting document: ", e);
          alert("Error al eliminar.");
      }
    }
  };

  const handleUpdateBikeName = async (name: string) => {
    if (!user) return;
    setBikeName(name); // Optimistic update
    try {
        const userSettingsRef = doc(db, 'user_settings', user.uid);
        await setDoc(userSettingsRef, { bikeName: name }, { merge: true });
    } catch (e) {
        console.error("Error updating settings", e);
    }
  };

  const handleEditClick = (id: string) => {
    setEditingId(id);
    setView('edit');
  };

  const handleCancel = () => {
    setView('dashboard');
    setEditingId(null);
  };

  const handleLogout = () => {
    if(window.confirm("¿Cerrar sesión?")) {
        signOut(auth);
    }
  };

  // Loading State
  if (loadingAuth) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <Login />;
  }

  // Render View
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            expenses={expenses} 
            bikeName={bikeName}
            onUpdateBikeName={handleUpdateBikeName}
            onDelete={handleDelete} 
            onEdit={handleEditClick} 
          />
        );
      
      case 'add':
      case 'edit':
        const expenseToEdit = editingId ? expenses.find(e => e.id === editingId) : undefined;
        
        // If editing but ID not found, return null (useEffect will redirect)
        if (editingId && !expenseToEdit) {
            return null;
        }

        return (
          <div className="fixed inset-0 bg-white z-50 animate-in slide-in-from-bottom-10 duration-200">
            <AddExpense 
              onSave={handleSaveExpense} 
              onCancel={handleCancel}
              onDelete={editingId ? () => handleDelete(editingId) : undefined}
              existingExpenses={expenses}
              initialData={expenseToEdit}
            />
          </div>
        );
      
      case 'reports':
        return <Reports expenses={expenses} />;
      
      default:
        return (
          <Dashboard 
            expenses={expenses} 
            bikeName={bikeName}
            onUpdateBikeName={handleUpdateBikeName}
            onDelete={handleDelete} 
            onEdit={handleEditClick} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      
      {/* Top Bar for Logout (Only visible on dashboard/reports) */}
      {(view === 'dashboard' || view === 'reports') && (
        <div className="absolute top-0 right-0 z-20 p-4">
             <button 
                onClick={handleLogout}
                className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors shadow-sm"
                title="Cerrar Sesión"
             >
                <LogOut size={18} />
             </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {renderView()}
      </main>

      {/* Bottom Navigation (Only visible if not in Add/Edit mode) */}
      {(view !== 'add' && view !== 'edit') && (
        <nav className="bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex justify-between items-center sticky bottom-0 z-40 pb-safe">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-violet-600' : 'text-slate-400'}`}
          >
            <Home size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          {/* Floating Action Button Style Center */}
          <button 
            onClick={() => {
              setEditingId(null);
              setView('add');
            }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-300 -mt-8 border-4 border-slate-50 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>

          <button 
            onClick={() => setView('reports')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'reports' ? 'text-violet-600' : 'text-slate-400'}`}
          >
            <PieChart size={24} strokeWidth={view === 'reports' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Reportes</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
