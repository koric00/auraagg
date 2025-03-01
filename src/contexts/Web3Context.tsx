import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';
import { injected, switchNetwork } from '../utils/connectors';
import { ethers } from 'ethers';

interface Web3ContextProps {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<boolean>;
  account: string | null;
  chainId: number | undefined;
  active: boolean;
  library: EthersWeb3Provider | undefined;
  error: Error | undefined;
  balance: string;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextProps>({
  connect: async () => {},
  disconnect: () => {},
  switchChain: async () => false,
  account: null,
  chainId: undefined,
  active: false,
  library: undefined,
  error: undefined,
  balance: '0',
  isConnecting: false,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activate, deactivate, account, chainId, active, library, error } = useWeb3React<EthersWeb3Provider>();
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);

  // 连接钱包
  const connect = async () => {
    setIsConnecting(true);
    try {
      await activate(injected, undefined, true);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开连接
  const disconnect = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  // 切换链
  const switchChain = async (chainId: number) => {
    return switchNetwork(chainId);
  };

  // 获取余额
  useEffect(() => {
    if (library && account) {
      let isMounted = true;
      library.getBalance(account).then((balance: ethers.BigNumber) => {
        if (isMounted) {
          setBalance(ethers.utils.formatEther(balance));
        }
      }).catch((error: Error) => {
        console.error('Error fetching balance:', error);
      });

      return () => {
        isMounted = false;
      };
    } else {
      setBalance('0');
    }
  }, [library, account, chainId]);

  // 尝试自动连接
  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        connect();
      }
    }).catch((error: Error) => {
      console.error('Error checking authorization:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        switchChain,
        account: account || null,
        chainId,
        active,
        library,
        error: error as Error | undefined,
        balance,
        isConnecting,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}; 