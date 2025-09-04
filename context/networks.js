export const networks = {
  polygon: {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    icon: "🟣",
  },
  linea: {
    id: 59144,
    name: "Linea",
    rpcUrl: "https://rpc.linea.build",
    currency: "ETH",
    explorerUrl: "https://lineascan.build",
    icon: "🔵",
  },
  bsc: {
    id: 56,
    name: "BSC",
    rpcUrl: "https://bsc-dataseed.binance.org",
    currency: "BNB",
    explorerUrl: "https://bscscan.com",
    icon: "🟡",
  },
  // Add testnet configurations
  polygonMumbai: {
    id: 80001,
    name: "Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    currency: "MATIC",
    explorerUrl: "https://mumbai.polygonscan.com",
    icon: "🟣",
    isTestnet: true,
  },
  lineaTestnet: {
    id: 59140,
    name: "Linea Testnet",
    rpcUrl: "https://rpc.goerli.linea.build",
    currency: "ETH",
    explorerUrl: "https://goerli.lineascan.build",
    icon: "🔵",
    isTestnet: true,
  },
  bscTestnet: {
    id: 97,
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    currency: "tBNB",
    explorerUrl: "https://testnet.bscscan.com",
    icon: "🟡",
    isTestnet: true,
  },
};

export const supportedNetworks = Object.values(networks);
export const mainnetNetworks = supportedNetworks.filter(
  (network) => !network.isTestnet
);
export const testnetNetworks = supportedNetworks.filter(
  (network) => network.isTestnet
);

export const switchNetwork = async (networkId) => {
  try {
    const network = supportedNetworks.find((n) => n.id === networkId);
    if (!network) throw new Error("Network not supported");

    if (!window.ethereum) throw new Error("No crypto wallet found");

    try {
      // Try switching to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${networkId.toString(16)}` }],
      });
    } catch (switchError) {
      // If the network is not added to MetaMask, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${networkId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
    return true;
  } catch (error) {
    console.error("Error switching network:", error);
    throw error;
  }
};
