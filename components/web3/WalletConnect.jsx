import { useContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3Modal from "web3modal";
import { NFTContext } from "../../context/NFTContext";
import { useWallet } from "../../hooks/useWallet";

const WalletConnect = () => {
  const { currentAccount } = useContext(NFTContext);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const MAX_RETRIES = 3;

  const {
    handleConnect,
    handleDisconnect,
    isAutoConnecting,
    lastConnectedWallet,
  } = useWallet();

  const handleWalletError = (error, walletType) => {
    const errorMessages = {
      metamask: "Please install MetaMask extension or check if it's unlocked",
      token_pocket: "Please install TokenPocket or check if it's unlocked",
      bitget_wallet: "Please install Bitget Wallet or check if it's unlocked",
      particle_network: "Particle Network connection failed. Please try again.",
      wallet_connect: "WalletConnect connection failed. Please try again.",
    };

    const message =
      errorMessages[walletType] || "Connection failed. Please try again.";
    toast.error(message);
    console.error("Wallet connection error:", error);
  };

  const detectWalletType = () => {
    if (window.ethereum?.isMetaMask) return "metamask";
    if (window.ethereum?.isTokenPocket) return "token_pocket";
    if (window.ethereum?.isBitKeep) return "bitget_wallet";
    return "wallet_connect";
  };

  const updateConnectionProgress = (progress) => {
    setConnectionProgress(progress);
  };

  const handleConnectClick = async () => {
    if (isAutoConnecting) return;

    setConnectionProgress(10);

    try {
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      const walletType = detectWalletType();
      updateConnectionProgress(30);

      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setConnectionProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const success = await handleConnect(walletType);
      clearInterval(progressInterval);
      updateConnectionProgress(100);

      if (success) {
        toast.success("Wallet connected successfully!");
        setRetryCount(0);
      }
    } catch (error) {
      const walletType = detectWalletType();
      handleWalletError(error, walletType);

      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          handleConnectClick();
        }, 5000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setTimeout(() => {
        setConnectionProgress(0);
      }, 500);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleConnectClick}
        disabled={isAutoConnecting}
        className={`nft-gradient text-sm minlg:text-lg py-2 px-6 minlg:px-8 font-poppins font-semibold text-white ${
          isAutoConnecting ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isAutoConnecting
          ? "Connecting..."
          : currentAccount
          ? "Connected"
          : lastConnectedWallet
          ? `Reconnect ${lastConnectedWallet}`
          : "Connect"}
      </button>

      {/* Connection Progress Bar */}
      {(isAutoConnecting || connectionProgress > 0) && (
        <div className="overflow-hidden absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-in-out"
            style={{ width: `${connectionProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
