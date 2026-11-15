import { createContext, useContext, useState } from 'react';
import { accounts, createSeed, dateOffset } from './data';

const Context = createContext(null);
const DATA_KEY = 'vereda.demo.data.v1';
const AUTH_KEY = 'vereda.demo.auth.v1';
function loadData() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(DATA_KEY));
    if (
      cached?.version === 1 &&
      ['requests', 'invoices', 'documents', 'works', 'leads', 'tickets', 'notifications'].every(
        (key) => Array.isArray(cached[key]),
      ) &&
      cached.company &&
      cached.subscription
    )
      return cached;
  } catch {
    /* Uma sessão indisponível começa com os dados de demonstração. */
  }
  return createSeed();
}
function loadAuth() {
  try {
    const role = sessionStorage.getItem(AUTH_KEY);
    return accounts[role] ? role : null;
  } catch {
    return null;
  }
}
export function StoreProvider({ children }) {
  const [data, setData] = useState(loadData);
  const [role, setRole] = useState(loadAuth);
  const [toast, setToast] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const notify = (message, type = 'success') => {
    setToast({ message, type, id: crypto.randomUUID() });
  };
  function update(change) {
    setData((current) => {
      const next = typeof change === 'function' ? change(current) : { ...current, ...change };
      try {
        sessionStorage.setItem(DATA_KEY, JSON.stringify(next));
        setStorageWarning(false);
      } catch {
        setStorageWarning(true);
      }
      return next;
    });
  }
  const login = (email, password) => {
    const match = Object.entries(accounts).find(
      ([, account]) =>
        account.email === email.trim().toLowerCase() && account.password === password,
    );
    if (!match) return false;
    setRole(match[0]);
    try {
      sessionStorage.setItem(AUTH_KEY, match[0]);
    } catch {
      setStorageWarning(true);
    }
    return true;
  };
  const logout = () => {
    setRole(null);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      /* A navegação continua em memória. */
    }
  };
  const reset = () => {
    update(createSeed());
    notify('Demonstração restaurada. Tudo pronto para recomeçar.');
  };
  const user = accounts[role];
  const visibleRequests = data.requests.filter(
    (item) =>
      role === 'admin' ||
      (role === 'prestador' ? item.specialist === user.specialist : item.company === user?.company),
  );
  const patchRequest = (id, patch, event) =>
    update((current) => ({
      ...current,
      requests: current.requests.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              history: event
                ? [...item.history, { id: crypto.randomUUID(), text: event, date: dateOffset() }]
                : item.history,
            }
          : item,
      ),
    }));
  return (
    <Context.Provider
      value={{
        data,
        update,
        role,
        user,
        login,
        logout,
        reset,
        visibleRequests,
        patchRequest,
        notify,
        toast,
        setToast,
        storageWarning,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
