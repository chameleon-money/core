import { useState, useEffect } from "react";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatEther,
  parseEther,
  type PublicClient,
  type WalletClient,
  type Chain,
  zeroAddress,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Configuration
const chains = {
  l1: {
    // Default to Anvil's default chainId and settings
    id: 31337,
    name: "Local Anvil (L1)",
    network: "anvil",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
      public: {
        http: ["http://localhost:8545"],
      },
    },
  },
  l2: { name: "Aztec (L2)" },
};

// ABIs
const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "function mint(address _to, uint256 _amount)",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function freeForAll() view returns (bool)",
  "function setFreeForAll(bool _freeForAll)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
]);

const tokenPortalAbi = parseAbi([
  "function initialize(address _registry, address _underlying, bytes32 _l2Bridge)",
  "function depositToAztecPublic(bytes32 _to, uint256 _amount, bytes32 _secretHash) returns (bytes32, uint256)",
  "function depositToAztecPrivate(uint256 _amount, bytes32 _secretHashForL2MessageConsumption) returns (bytes32, uint256)",
  "function withdraw(address _recipient, uint256 _amount, bool _withCaller, uint256 _l2BlockNumber, uint256 _leafIndex, bytes32[] _path)",
  "function registry() view returns (address)",
  "function underlying() view returns (address)",
  "function l2Bridge() view returns (bytes32)",
  "event DepositToAztecPublic(bytes32 to, uint256 amount, bytes32 secretHash, bytes32 key, uint256 index)",
  "event DepositToAztecPrivate(uint256 amount, bytes32 secretHashForL2MessageConsumption, bytes32 key, uint256 index)",
]);

const TokenBridgeFrontend = () => {
  // State variables
  const [account, setAccount] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [l1TokenAddress, setL1TokenAddress] = useState("");
  const [l1PortalAddress, setL1PortalAddress] = useState("");
  const [l2BridgeAddress, setL2BridgeAddress] = useState("");
  const [pxeUrl, setPxeUrl] = useState("http://localhost:8080");
  const [l1Balance, setL1Balance] = useState("0");
  const [l2Balance, setL2Balance] = useState("0");
  const [bridgeAmount, setBridgeAmount] = useState("10");
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [l1Client, setL1Client] = useState(null);
  const [l1WalletClient, setL1WalletClient] = useState(null);
  const [pxeClient, setPxeClient] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [l2TokenAddress, setL2TokenAddress] = useState("");
  const [activeTab, setActiveTab] = useState("settings");

  // State for RPC URL
  const [rpcUrl, setRpcUrl] = useState("http://localhost:8545");
  const [debugInfo, setDebugInfo] = useState({});

  // Initialize clients
  useEffect(() => {
    if (!l1TokenAddress) return;

    try {
      // Create custom chain config with current RPC URL
      const chainConfig: Chain = {
        ...chains.l1,
        rpcUrls: {
          default: {
            http: [rpcUrl],
          },
          public: {
            http: [rpcUrl],
          },
        },
      };

      // Create Viem clients
      const publicClient = createPublicClient({
        chain: chainConfig,
        transport: http(rpcUrl),
      });

      setL1Client(publicClient);

      // Add account from MetaMask or private key
      if (window.ethereum && account) {
        const wallet = createWalletClient({
          account,
          chain: chainConfig,
          transport: http(rpcUrl),
        });
        setL1WalletClient(wallet);
      } else if (privateKey) {
        const walletAccount = privateKeyToAccount(privateKey);
        const wallet = createWalletClient({
          account: walletAccount,
          chain: chainConfig,
          transport: http(rpcUrl),
        });
        setL1WalletClient(wallet);
      }

      // Fetch token details
      fetchTokenInfo();
    } catch (err) {
      setError(
        `Client initialization error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, [l1TokenAddress, account, privateKey, rpcUrl]);

  // Fetch balances
  useEffect(() => {
    if (l1Client && account && l1TokenAddress) {
      refreshBalances();
    }
  }, [l1Client, account, l1TokenAddress, l2TokenAddress, pxeClient]);

  const fetchTokenInfo = async () => {
    if (!l1Client || !l1TokenAddress) return;

    try {
      const symbol = await l1Client.readContract({
        address: l1TokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      });

      setTokenSymbol(symbol);

      // Also refresh balances when token info is fetched
      await refreshBalances();
    } catch (err) {
      console.error("Error fetching token info:", err);
    }
  };

  const refreshBalances = async () => {
    setLoading(true);
    setDebugInfo({});

    try {
      // Debug info
      const debugData: Record<string, any> = {
        clientConfigured: !!l1Client,
        accountConnected: !!account,
        tokenAddressSet: !!l1TokenAddress,
      };

      // Add chain ID and block number if client is available
      if (l1Client) {
        try {
          debugData.chainId = await l1Client.getChainId();
          debugData.blockNumber = await l1Client.getBlockNumber();
        } catch (e) {
          debugData.clientError = e instanceof Error ? e.message : String(e);
        }
      }

      // Fetch L1 balance
      if (l1Client && l1TokenAddress) {
        try {
          // First check if the token contract exists and is accessible
          const tokenName = await l1Client
            .readContract({
              address: l1TokenAddress,
              abi: erc20Abi,
              functionName: "name",
            })
            .catch(
              (e) => "Error: " + (e instanceof Error ? e.message : String(e))
            );

          const tokenSymbolValue = await l1Client
            .readContract({
              address: l1TokenAddress,
              abi: erc20Abi,
              functionName: "symbol",
            })
            .catch((e) => "");

          if (tokenSymbolValue && typeof tokenSymbolValue === "string") {
            setTokenSymbol(tokenSymbolValue);
          }

          debugData.tokenName = tokenName;
          debugData.tokenSymbol = tokenSymbolValue;

          // Try to get balance - use the account address if available, otherwise use zero address for testing
          const addressToCheck = account || zeroAddress;

          const balance = await l1Client.readContract({
            address: l1TokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [addressToCheck],
          });

          const formattedBalance = formatEther(balance);
          setL1Balance(formattedBalance);
          debugData.rawBalance = balance.toString();
          debugData.formattedBalance = formattedBalance;
          debugData.addressChecked = addressToCheck;
        } catch (err) {
          debugData.balanceError =
            err instanceof Error ? err.message : String(err);
          console.error("Balance error:", err);
        }
      }

      // Fetch L2 balance - would need integration with PXE client
      if (pxeUrl && l2TokenAddress && account) {
        // For demo purposes, we'll simulate an L2 balance
        setL2Balance("Requires PXE integration");
      }

      setDebugInfo(debugData);
    } catch (err) {
      setError(
        `Error refreshing balances: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setDebugInfo((prev) => ({
        ...prev,
        mainError: err instanceof Error ? err.message : String(err),
      }));
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      // Request MetaMask connection
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);

        // Listen for account changes
        window.ethereum.on("accountsChanged", (newAccounts) => {
          setAccount(newAccounts[0]);
        });
      } else {
        setError("Please install MetaMask to connect a wallet");
      }
    } catch (err) {
      setError(`Wallet connection error: ${err.message}`);
    }
  };

  const bridgeToL2 = async () => {
    if (!l1WalletClient || !l1TokenAddress || !l1PortalAddress) {
      setError("Missing wallet or contract addresses");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const amount = parseEther(bridgeAmount);

      // First approve the portal contract to spend tokens
      const approvalTx = await l1WalletClient.writeContract({
        address: l1TokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [l1PortalAddress, amount],
      });

      addTransaction("Approval", approvalTx);

      // Then bridge tokens
      const bridgeTx = await l1WalletClient.writeContract({
        address: l1PortalAddress,
        abi: tokenPortalAbi,
        functionName: "bridgeToL2",
        args: [account, amount],
      });

      addTransaction("Bridge to L2", bridgeTx);

      // In a real implementation, you would now:
      // 1. Wait for the L1 transaction to be included
      // 2. Get the claim information from the event logs
      // 3. Call the claim_public method on the L2 bridge contract

      refreshBalances();
    } catch (err) {
      setError(`Bridge error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const withdrawFromL2 = async () => {
    if (!l1WalletClient || !l1PortalAddress) {
      setError("Missing wallet or contract addresses");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In a real implementation, this would be connected to Aztec PXE
      // For demonstration purposes, we'll show how the withdrawal would work

      const amount = parseEther(withdrawAmount);
      const recipient = account;

      // These values would come from Aztec events/PXE in a real implementation
      const mockL2BlockNumber = 123n;
      const mockLeafIndex = 0n;
      const mockPath: string[] = ["0x" + "0".repeat(64)]; // Mock merkle path

      // Will fail without proper L2 block proof
      setError(
        "For demo only: This would call withdraw with L2 proof in a real implementation"
      );

      // Example of how the withdraw function would be called with real data
      /*
      const withdrawTx = await l1WalletClient.writeContract({
        address: l1PortalAddress,
        abi: tokenPortalAbi,
        functionName: "withdraw",
        args: [recipient, amount, true, mockL2BlockNumber, mockLeafIndex, mockPath]
      });
      
      addTransaction("Withdraw from L2", withdrawTx);
      */

      // In a real implementation:
      // 1. Exit from L2 using the PXE client
      // 2. Get the L2 to L1 message with proof
      // 3. Call withdraw on the portal contract
    } catch (err) {
      setError(
        `Withdrawal error: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (type, hash) => {
    const newTx = {
      type,
      hash,
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const clearError = () => {
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-6 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Aztec Token Bridge
          </h1>
          <p className="text-gray-400">
            Cross-chain bridge for L1 ↔ L2 token transfers
          </p>
        </div>

        <Tabs
          defaultValue="settings"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Connection Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Connection Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Connect your wallet and set up private key for testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Account
                    </label>
                    {account ? (
                      <div className="flex items-center">
                        <Badge variant="outline" className="font-mono">
                          {account.substring(0, 8)}...{account.substring(36)}
                        </Badge>
                        <Badge
                          variant="success"
                          className="ml-2 bg-green-600 text-white"
                        >
                          Connected
                        </Badge>
                      </div>
                    ) : (
                      <Button onClick={connectWallet} variant="default">
                        Connect Wallet
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Private Key (for testing only)
                    </label>
                    <Input
                      type="password"
                      placeholder="0x..."
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-red-400 mt-1">
                      Never use real private keys here. Testing only!
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    RPC URL (Anvil)
                  </label>
                  <Input
                    type="text"
                    placeholder="http://localhost:8545"
                    value={rpcUrl}
                    onChange={(e) => setRpcUrl(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default Anvil URL is http://localhost:8545
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contract Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Contract Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure addresses for token and bridge contracts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      L1 Token Address
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={l1TokenAddress}
                      onChange={(e) => setL1TokenAddress(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      L1 Portal Address
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={l1PortalAddress}
                      onChange={(e) => setL1PortalAddress(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      L2 Bridge Address
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={l2BridgeAddress}
                      onChange={(e) => setL2BridgeAddress(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      L2 Token Address
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={l2TokenAddress}
                      onChange={(e) => setL2TokenAddress(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      PXE URL
                    </label>
                    <Input
                      type="text"
                      placeholder="http://localhost:8080"
                      value={pxeUrl}
                      onChange={(e) => setPxeUrl(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bridge Tab */}
          <TabsContent value="bridge" className="space-y-4">
            {/* Balances */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Token Balances</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your token balances across chains
                  </CardDescription>
                </div>
                <Button
                  onClick={refreshBalances}
                  variant="outline"
                  disabled={loading}
                  className="border-gray-700 text-gray-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading
                    </>
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-blue-400">
                        {chains.l1.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-white">
                          {parseFloat(l1Balance).toFixed(4)}
                        </span>
                        <span className="ml-2 text-gray-400">
                          {tokenSymbol || "Tokens"}
                        </span>
                      </div>
                      {debugInfo.rawBalance && (
                        <div className="text-xs text-gray-500 mt-1">
                          Raw: {debugInfo.rawBalance}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-purple-400">
                        {chains.l2.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-white">
                          {l2Balance}
                        </span>
                        <span className="ml-2 text-gray-400">
                          {tokenSymbol || "Tokens"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Bridge Operations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* L1 to L2 */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Bridge L1 → L2</CardTitle>
                  <CardDescription className="text-gray-400">
                    Send tokens from Ethereum to Aztec
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Amount
                    </label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={bridgeAmount}
                        onChange={(e) => setBridgeAmount(e.target.value)}
                        className="rounded-r-none bg-gray-800 border-gray-700 text-white"
                      />
                      <div className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                        {tokenSymbol || "Tokens"}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={bridgeToL2}
                    disabled={loading || !account || !l1WalletClient}
                    className="w-full"
                    variant="default"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Bridge to L2"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* L2 to L1 */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Withdraw L2 → L1</CardTitle>
                  <CardDescription className="text-gray-400">
                    Withdraw tokens from Aztec to Ethereum
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Amount
                    </label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="rounded-r-none bg-gray-800 border-gray-700 text-white"
                      />
                      <div className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                        {tokenSymbol || "Tokens"}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={withdrawFromL2}
                    disabled={loading || !account}
                    className="w-full"
                    variant="secondary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Withdraw to L1"
                    )}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Note: Requires PXE integration for full functionality
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Transaction History
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Records of your bridge operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="py-6 text-center text-gray-500">
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">
                          Transaction Hash
                        </TableHead>
                        <TableHead className="text-gray-400">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx, index) => (
                        <TableRow key={index} className="border-gray-800">
                          <TableCell>
                            <Badge
                              variant={
                                tx.type === "Bridge to L2"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            <a
                              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {tx.hash.substring(0, 10)}...
                              {tx.hash.substring(58)}
                            </a>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Debug Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Technical details to help troubleshoot issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Connection Status
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-800 p-2 rounded-md">
                      <span className="text-gray-400 text-sm">Chain ID: </span>
                      <span className="text-white">
                        {debugInfo.chainId || "Not connected"}
                      </span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded-md">
                      <span className="text-gray-400 text-sm">
                        Block Number:{" "}
                      </span>
                      <span className="text-white">
                        {debugInfo.blockNumber || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Token Contract
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-gray-800 p-2 rounded-md">
                      <span className="text-gray-400 text-sm">
                        Contract Address:{" "}
                      </span>
                      <span className="text-white font-mono">
                        {l1TokenAddress || "Not set"}
                      </span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded-md">
                      <span className="text-gray-400 text-sm">
                        Token Name:{" "}
                      </span>
                      <span className="text-white">
                        {debugInfo.tokenName || "Unknown"}
                      </span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded-md">
                      <span className="text-gray-400 text-sm">
                        Raw Balance:{" "}
                      </span>
                      <span className="text-white font-mono">
                        {debugInfo.rawBalance || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Manual Token Minting (For Testing)
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="Recipient address (0x...)"
                        value={account || ""}
                        onChange={(e) => setAccount(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        defaultValue="100"
                        id="mintAmount"
                        className="bg-gray-800 border-gray-700 text-white w-32"
                      />
                      <Button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            if (!l1WalletClient || !l1TokenAddress) {
                              setError("Missing wallet or token address");
                              return;
                            }

                            const mintAmount = parseEther(
                              (
                                document.getElementById(
                                  "mintAmount"
                                ) as HTMLInputElement
                              )?.value || "100"
                            );
                            const recipient = account || zeroAddress;

                            // Try to mint tokens to the account
                            try {
                              const mintTx = await l1WalletClient.writeContract(
                                {
                                  address: l1TokenAddress,
                                  abi: erc20Abi,
                                  functionName: "mint",
                                  args: [recipient, mintAmount],
                                }
                              );

                              addTransaction("Mint Tokens", mintTx);
                              setDebugInfo((prev) => ({ ...prev, mintTx }));

                              // Refresh balances after a short delay to allow transaction to be mined
                              setTimeout(refreshBalances, 2000);
                            } catch (mintErr) {
                              setError(
                                `Mint error: ${
                                  mintErr instanceof Error
                                    ? mintErr.message
                                    : String(mintErr)
                                }`
                              );
                              setDebugInfo((prev) => ({
                                ...prev,
                                mintError: String(mintErr),
                              }));
                            }
                          } catch (err) {
                            setError(
                              `Error: ${
                                err instanceof Error ? err.message : String(err)
                              }`
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        variant="default"
                        className="whitespace-nowrap"
                      >
                        Mint Tokens
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Note: This requires your account to have minting
                      privileges on the token contract
                    </p>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      if (!l1Client) {
                        setError("No L1 client configured");
                        return;
                      }

                      const testAddress = account || zeroAddress;

                      try {
                        // Get the token balance directly with provider
                        const balance = await l1Client.readContract({
                          address: l1TokenAddress,
                          abi: erc20Abi,
                          functionName: "balanceOf",
                          args: [testAddress],
                        });

                        setDebugInfo((prev) => ({
                          ...prev,
                          directBalance: balance.toString(),
                          directBalanceFormatted: formatEther(balance),
                        }));
                      } catch (balanceErr) {
                        setDebugInfo((prev) => ({
                          ...prev,
                          directBalanceError: `Balance check error: ${
                            balanceErr instanceof Error
                              ? balanceErr.message
                              : String(balanceErr)
                          }`,
                        }));
                      }
                    } catch (err) {
                      setDebugInfo((prev) => ({
                        ...prev,
                        directBalanceError: `Unexpected error: ${
                          err instanceof Error ? err.message : String(err)
                        }`,
                      }));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  variant="outline"
                  className="w-full border-gray-700"
                >
                  Direct Balance Check
                </Button>

                {(debugInfo.directBalance || debugInfo.directBalanceError) && (
                  <div className="bg-gray-800 p-2 rounded-md">
                    {debugInfo.directBalance && (
                      <>
                        <div>
                          <span className="text-gray-400 text-sm">
                            Direct Balance:{" "}
                          </span>
                          <span className="text-white font-mono">
                            {debugInfo.directBalance}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">
                            Formatted:{" "}
                          </span>
                          <span className="text-white">
                            {debugInfo.directBalanceFormatted}
                          </span>
                        </div>
                      </>
                    )}
                    {debugInfo.directBalanceError && (
                      <div className="text-red-400 text-sm mt-2">
                        {debugInfo.directBalanceError}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Messages */}
        {error && (
          <Alert
            variant="destructive"
            className="mt-6 bg-red-900 border-red-800"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="border-red-700 text-gray-200"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default TokenBridgeFrontend;
