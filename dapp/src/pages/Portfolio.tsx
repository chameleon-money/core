import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Lock,
  RefreshCw,
  Diamond,
  Layers,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mocked for now
const mockEVMWallet = {
  address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  balance: 1.245,
  tokens: [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 1.245,
      usdValue: 2933.76,
      isPrivate: false,
      layer: "L1",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: 420.69,
      usdValue: 420.69,
      isPrivate: false,
      layer: "L1",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      balance: 25.5,
      usdValue: 382.5,
      isPrivate: false,
      layer: "L1",
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      balance: 12.3,
      usdValue: 73.8,
      isPrivate: false,
      layer: "L1",
    },
  ],
};

const mockAztecWallet = {
  address: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
  privateKey: "******************************************************",
  balance: 0.75,
  tokens: [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 0.75,
      usdValue: 1762.5,
      isPrivate: true,
      layer: "L2",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: 150,
      usdValue: 150,
      isPrivate: true,
      layer: "L2",
    },
    {
      symbol: "DAI",
      name: "Dai",
      balance: 200,
      usdValue: 200,
      isPrivate: true,
      layer: "L2",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 0.25,
      usdValue: 587.5,
      isPrivate: false,
      layer: "L2",
    },
  ],
};

const Portfolio = () => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copyAddressStatus, setCopyAddressStatus] = useState(false);
  const [copyPrivateKeyStatus, setCopyPrivateKeyStatus] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isAztecInitialized, setIsAztecInitialized] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalPortfolioValue = [
    ...mockEVMWallet.tokens,
    ...mockAztecWallet.tokens,
  ].reduce((sum, token) => sum + token.usdValue, 0);

  const privateAssetsValue = [
    ...mockEVMWallet.tokens,
    ...mockAztecWallet.tokens,
  ]
    .filter((token) => token.isPrivate)
    .reduce((sum, token) => sum + token.usdValue, 0);

  const privatePercentage = Math.round(
    (privateAssetsValue / totalPortfolioValue) * 100
  );

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  const togglePrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  const refreshBalances = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Portfolio</h1>
              <p className="text-gray-400">
                Manage your assets across L1 and private L2 wallets
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={refreshBalances}
                className="bg-gray-800 hover:bg-gray-700 text-white"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-100">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100">
                  ${totalPortfolioValue.toFixed(2)}
                </div>
                <p className="text-sm text-gray-400 mt-1">Across all wallets</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-100">Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-gray-100">
                    {privatePercentage}%
                  </span>
                </div>
                <Progress
                  value={privatePercentage}
                  className="h-2 bg-gray-800 text-gray-100"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {privateAssetsValue.toFixed(2)} USD in private assets
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-100">
                  Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                      <span className="text-sm text-gray-300">Ethereum L1</span>
                    </div>
                    <span className="text-xl font-medium mt-1 text-gray-200">
                      $
                      {mockEVMWallet.tokens
                        .reduce((sum, token) => sum + token.usdValue, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-300">Aztec L2</span>
                    </div>
                    <span className="text-xl font-medium mt-1 text-gray-200">
                      $
                      {mockAztecWallet.tokens
                        .reduce((sum, token) => sum + token.usdValue, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-800 bg-opacity-80 p-2 rounded-full mr-3 border border-gray-700 shadow-inner">
                      <Diamond className="h-5 w-5 text-blue-200" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-100">
                        EVM Wallet
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Public Ethereum Wallet
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={isConnected ? "outline" : "destructive"}
                    className={
                      isConnected
                        ? "bg-green-900/30 text-green-300 border-green-700 shadow-sm"
                        : "shadow-sm"
                    }
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-gray-700/50 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300 font-medium">
                      Address
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            mockEVMWallet.address,
                            setCopyAddressStatus
                          )
                        }
                        className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        {copyAddressStatus ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/address/${mockEVMWallet.address}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all text-blue-100 bg-gray-850 p-2 rounded border border-gray-700/50">
                    {mockEVMWallet.address}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Assets
                  </h3>
                  <div className="bg-gray-850 rounded-lg border border-gray-800/80 overflow-hidden shadow-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-800">
                          <TableHead className="text-gray-300 bg-gray-850">
                            Token
                          </TableHead>
                          <TableHead className="text-gray-300 text-right bg-gray-850">
                            Balance
                          </TableHead>
                          <TableHead className="text-gray-300 text-right bg-gray-850">
                            Value (USD)
                          </TableHead>
                          <TableHead className="text-gray-300 text-right bg-gray-850">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEVMWallet.tokens.map((token, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-gray-800 border-gray-800/50"
                          >
                            <TableCell className="font-medium text-gray-200">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 shadow-sm flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-gray-100">
                                    {token.symbol.charAt(0)}
                                  </span>
                                </div>
                                <span>{token.symbol}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-gray-100">
                              {token.balance}
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-100">
                              ${token.usdValue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className="bg-gray-800 text-gray-300 border-gray-700 shadow-sm"
                              >
                                <Layers className="h-3 w-3 mr-1" />
                                {token.layer}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Total Balance</span>
                  <span className="font-medium">
                    $
                    {mockEVMWallet.tokens
                      .reduce((sum, token) => sum + token.usdValue, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-blue-900/40 p-2 rounded-full mr-3 border border-blue-700/50 shadow-inner">
                      <Shield className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-100">
                        Aztec Wallet
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Private L2 Wallet
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={isAztecInitialized ? "outline" : "destructive"}
                    className={
                      isAztecInitialized
                        ? "bg-blue-900/20 text-blue-300 border-blue-800"
                        : ""
                    }
                  >
                    {isAztecInitialized ? "Initialized" : "Requires Setup"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-gray-700/50 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300 font-medium">
                      Address
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            mockAztecWallet.address,
                            setCopyAddressStatus
                          )
                        }
                        className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        {copyAddressStatus ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() =>
                          window.open(
                            `https://aztec-explorer.com/address/${mockAztecWallet.address.substring(
                              3
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all text-blue-100 bg-gray-850 p-2 rounded border border-gray-700/50">
                    {mockAztecWallet.address}
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-blue-800/30 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-300 font-medium flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Private Key
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePrivateKey}
                        className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        {showPrivateKey ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          showPrivateKey &&
                          copyToClipboard(
                            "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
                            setCopyPrivateKeyStatus
                          )
                        }
                        disabled={!showPrivateKey}
                        className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        {copyPrivateKeyStatus ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`font-mono text-sm break-all p-2 rounded border ${
                      showPrivateKey
                        ? "bg-blue-900/20 text-blue-100 border-blue-800/50"
                        : "bg-gray-850 text-gray-500 border-gray-700/50"
                    }`}
                  >
                    {showPrivateKey
                      ? "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z"
                      : mockAztecWallet.privateKey}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Assets
                  </h3>
                  <div className="bg-gray-850 rounded-lg border border-gray-800/80 overflow-hidden shadow-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-800">
                          <TableHead className="text-gray-300 bg-gray-850">
                            Token
                          </TableHead>
                          <TableHead className="text-gray-300 text-right bg-gray-850">
                            Balance
                          </TableHead>
                          <TableHead className="text-gray-300 text-right bg-gray-850">
                            Value (USD)
                          </TableHead>
                          <TableHead className="text-gray-300 text-right bg-gray-850">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAztecWallet.tokens.map((token, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-gray-800 border-gray-800/50"
                          >
                            <TableCell className="font-medium text-gray-200">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 shadow-sm flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-gray-100">
                                    {token.symbol.charAt(0)}
                                  </span>
                                </div>
                                <span>{token.symbol}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-gray-100">
                              {token.balance}
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-100">
                              ${token.usdValue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {token.isPrivate ? (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-900/30 text-blue-300 border-blue-700/70 shadow-sm"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-gray-800 text-gray-300 border-gray-700 shadow-sm"
                                >
                                  Public
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Total Balance</span>
                  <span className="font-medium">
                    $
                    {mockAztecWallet.tokens
                      .reduce((sum, token) => sum + token.usdValue, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
