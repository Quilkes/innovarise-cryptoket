import { useState, useEffect, useCallback, useContext } from "react";
import { NFTContext } from "../context/NFTContext";

const STORAGE_KEY = "lastConnectedWallet";
const AUTO_CONNECT_KEY = "autoConnect";

export const useWallet = () => {
  const { connectWallet, currentAccount } = useContext(NFTContext);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [lastConnectedWallet, setLastConnectedWallet] = useState(null);

  // Save connection state
  const saveConnectionState = useCallback((connector) => {
    try {
      localStorage.setItem(STORAGE_KEY, connector);
      localStorage.setItem(AUTO_CONNECT_KEY, "true");
    } catch (error) {
      console.error("Error saving connection state:", error);
    }
  }, []);

  // Get last connected wallet
  const getLastConnectedWallet = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error getting last connected wallet:", error);
      return null;
    }
  }, []);

  // Clear connection state
  const clearConnectionState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(AUTO_CONNECT_KEY);
      setLastConnectedWallet(null);
    } catch (error) {
      console.error("Error clearing connection state:", error);
    }
  }, []);

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      try {
        const shouldAutoConnect =
          localStorage.getItem(AUTO_CONNECT_KEY) === "true";
        const lastWallet = getLastConnectedWallet();

        if (shouldAutoConnect && lastWallet && !currentAccount) {
          setIsAutoConnecting(true);
          await connectWallet();
          setLastConnectedWallet(lastWallet);
        }
      } catch (error) {
        console.error("Auto-connect error:", error);
        clearConnectionState();
      } finally {
        setIsAutoConnecting(false);
      }
    };

    autoConnect();
  }, [
    connectWallet,
    currentAccount,
    getLastConnectedWallet,
    clearConnectionState,
  ]);

  // Handle wallet connection
  const handleConnect = async (walletType) => {
    try {
      await connectWallet();
      saveConnectionState(walletType);
      setLastConnectedWallet(walletType);
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      clearConnectionState();
      return false;
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    clearConnectionState();
  };

  // Update connection state when account changes
  useEffect(() => {
    if (!currentAccount) {
      clearConnectionState();
    }
  }, [currentAccount, clearConnectionState]);

  return {
    handleConnect,
    handleDisconnect,
    isAutoConnecting,
    lastConnectedWallet,
    getLastConnectedWallet,
  };
};
