import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Wallet, Credential } from '../types';

interface WalletContextType {
  wallet: Wallet | null;
  credentials: Credential[];
  setWallet: (wallet: Wallet | null) => void;
  setCredentials: (credentials: Credential[]) => void;
  addCredential: (credential: Credential) => void;
}

export const WalletContext = createContext<WalletContextType>({
  wallet: null,
  credentials: [],
  setWallet: () => {},
  setCredentials: () => {},
  addCredential: () => {}
});

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  const addCredential = (credential: Credential) => {
    setCredentials((prev) => [...prev, credential]);
  };

  return (
    <WalletContext.Provider value={{ wallet, credentials, setWallet, setCredentials, addCredential }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

