import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { NFTContext } from "../../context/NFTContext";
import { shortenAddress } from "../../utils/shortenAddress";
import { supportedNetworks, switchNetwork } from "../../context/networks";

const Web3Status = () => {
  const { currentAccount } = useContext(NFTContext);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [isNetworkSupported, setIsNetworkSupported] = useState(false);
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          const chainIdDecimal = parseInt(chainId, 16);
          setCurrentChainId(chainIdDecimal);
          setIsNetworkSupported(
            supportedNetworks.some((network) => network.id === chainIdDecimal)
          );
        } catch (error) {
          console.error("Error checking network:", error);
        }
      }
    };

    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (chainId) => {
        const chainIdDecimal = parseInt(chainId, 16);
        setCurrentChainId(chainIdDecimal);
        setIsNetworkSupported(
          supportedNetworks.some((network) => network.id === chainIdDecimal)
        );
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", () => {
          console.log("Network change listener removed");
        });
      }
    };
  }, []);

  const getCurrentNetwork = () => {
    return (
      supportedNetworks.find((network) => network.id === currentChainId) || null
    );
  };

  const handleNetworkSwitch = async (networkId) => {
    setIsChangingNetwork(true);
    try {
      await switchNetwork(networkId);
      toast.success("Network switched successfully!");
    } catch (error) {
      toast.error("Failed to switch network. Please try again.");
      console.error("Network switch error:", error);
    } finally {
      setIsChangingNetwork(false);
    }
  };

  return (
    <div className="flex items-center">
      {currentAccount && (
        <div className="flex items-center">
          {/* Network Status */}
          <div className="flex items-center mr-4">
            <div className="relative group">
              <button
                className={`flex items-center px-3 py-1 rounded-lg border ${
                  isNetworkSupported
                    ? "border-green-500 bg-green-500 bg-opacity-10"
                    : "border-red-500 bg-red-500 bg-opacity-10"
                }`}
                disabled={isChangingNetwork}
              >
                <span className="mr-2">
                  {getCurrentNetwork()?.icon || "⚠️"}
                </span>
                <span className="text-sm dark:text-white text-nft-black-1">
                  {getCurrentNetwork()?.name || "Unsupported Network"}
                </span>
              </button>

              {/* Network Switcher Dropdown */}
              <div className="hidden group-hover:block absolute top-full left-0 mt-2 w-48 bg-white dark:bg-nft-black-1 rounded-lg shadow-lg border dark:border-nft-black-1 border-nft-gray-1 z-50">
                {supportedNetworks.map((network) => (
                  <button
                    key={network.id}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-nft-black-2 ${
                      currentChainId === network.id
                        ? "bg-gray-50 dark:bg-nft-black-2"
                        : ""
                    }`}
                    onClick={() => handleNetworkSwitch(network.id)}
                    disabled={isChangingNetwork}
                  >
                    <span className="mr-2">{network.icon}</span>
                    {network.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Status and Address */}
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isNetworkSupported ? "bg-green-500" : "bg-red-500"
                } animate-pulse`}
              />
              <span className="text-sm dark:text-white text-nft-black-1">
                {isNetworkSupported ? "Connected" : "Wrong Network"}
              </span>
            </div>

            <div className="px-2 py-1 text-sm dark:text-white text-nft-black-1 bg-gray-100 dark:bg-nft-black-1 rounded-md">
              {shortenAddress(currentAccount)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3Status;
