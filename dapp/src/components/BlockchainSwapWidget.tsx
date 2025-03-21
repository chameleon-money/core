import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp, Wallet, Settings, RefreshCcw, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";

const tokenList = [
  { symbol: "ETH", name: "Ethereum", balance: 1.245, price: 2356.12 },
  { symbol: "BTC", name: "Bitcoin", balance: 0.0324, price: 41285.73 },
  { symbol: "SOL", name: "Solana", balance: 42.5, price: 128.45 },
  { symbol: "AVAX", name: "Avalanche", balance: 23.7, price: 35.28 },
  { symbol: "DOT", name: "Polkadot", balance: 105.4, price: 7.92 },
];

const BlockchainSwapWidget = () => {
  const [fromToken, setFromToken] = useState(tokenList[0]);
  const [toToken, setToToken] = useState(tokenList[1]);
  const [fromAmount, setFromAmount] = useState("0.0");
  const [toAmount, setToAmount] = useState("0.0");
  const [slippage, setSlippage] = useState(0.5);
  const [isPrivateSwap, setIsPrivateSwap] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (fromToken && toToken && fromAmount && !isNaN(parseFloat(fromAmount))) {
      const fromValue = parseFloat(fromAmount);
      const exchangeRate = fromToken.price / toToken.price;
      const calculatedAmount = (fromValue * exchangeRate).toFixed(6);
      setToAmount(calculatedAmount);
    } else {
      setToAmount("0.0");
    }
  }, [fromToken, toToken, fromAmount]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  const handleSwap = () => {
    if (!isConnected) {
      setIsConnected(true);
      return;
    }

    setTransactionStatus("pending");

    setTimeout(() => {
      const random = Math.random();
      if (random > 0.2) {
        setTransactionStatus("success");
      } else {
        setTransactionStatus("error");
      }

      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    }, 1500);
  };

  const getStatusMessage = () => {
    if (transactionStatus === "pending") {
      return "Transaction pending...";
    } else if (transactionStatus === "success") {
      return "Swap completed successfully!";
    } else if (transactionStatus === "error") {
      return "Transaction failed. Please try again.";
    }
    return null;
  };

  const getStatusColor = () => {
    if (transactionStatus === "pending")
      return "bg-yellow-500/10 text-yellow-500";
    if (transactionStatus === "success")
      return "bg-green-500/10 text-green-500";
    if (transactionStatus === "error") return "bg-red-500/10 text-red-500";
    return "";
  };

  const calculateGasFee = () => {
    return (0.0012 * (isPrivateSwap ? 2.5 : 1)).toFixed(4);
  };

  const insufficientBalance =
    fromToken && parseFloat(fromAmount) > fromToken.balance;
  const validSwap =
    fromToken && toToken && parseFloat(fromAmount) > 0 && !insufficientBalance;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-gray-950 border-gray-800 text-gray-200 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-white">Swap</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {}}
                className="text-gray-400"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-400">
            Trade tokens with instant settlement
          </CardDescription>
        </CardHeader>

        {showSettings && (
          <CardContent className="pb-3 pt-0">
            <div className="p-3 bg-gray-900 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Slippage Tolerance</span>
                <div className="flex items-center space-x-2">
                  <Slider
                    defaultValue={[slippage]}
                    max={5}
                    step={0.1}
                    onValueChange={(values) => setSlippage(values[0])}
                    className="w-24"
                  />
                  <span className="text-sm font-medium">{slippage}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Private Swap</span>
                  <Info className="h-4 w-4 text-gray-500" />
                </div>
                <Switch
                  checked={isPrivateSwap}
                  onCheckedChange={setIsPrivateSwap}
                />
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="space-y-4 pb-0">
          <div className="p-4 bg-gray-900 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">
                Balance: {fromToken?.balance.toFixed(4)} {fromToken?.symbol}
              </span>
            </div>

            <div className="flex space-x-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.0"
              />

              <Select
                value={fromToken?.symbol}
                onValueChange={(value) => {
                  const selected = tokenList.find((t) => t.symbol === value);
                  if (selected) setFromToken(selected);
                }}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {tokenList.map(
                    (token) =>
                      token.symbol !== toToken?.symbol && (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 rounded-full bg-gray-700 flex items-center justify-center">
                              {token.symbol.charAt(0)}
                            </div>
                            {token.symbol}
                          </div>
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
            </div>

            {insufficientBalance && (
              <p className="text-xs text-red-500">Insufficient balance</p>
            )}
          </div>

          <div className="flex justify-center -my-2 z-10 relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-gray-950 border-gray-700 h-8 w-8"
              onClick={handleSwapTokens}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 bg-gray-900 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">
                Balance: {toToken?.balance.toFixed(4)} {toToken?.symbol}
              </span>
            </div>

            <div className="flex space-x-2">
              <Input
                readOnly
                value={toAmount}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.0"
              />

              <Select
                value={toToken?.symbol}
                onValueChange={(value) => {
                  const selected = tokenList.find((t) => t.symbol === value);
                  if (selected) setToToken(selected);
                }}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {tokenList.map(
                    (token) =>
                      token.symbol !== fromToken?.symbol && (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 rounded-full bg-gray-700 flex items-center justify-center">
                              {token.symbol.charAt(0)}
                            </div>
                            {token.symbol}
                          </div>
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-gray-400 p-2 space-y-1">
            <div className="flex justify-between">
              <span>Price</span>
              <span>
                1 {fromToken?.symbol} ={" "}
                {(fromToken?.price / toToken?.price).toFixed(6)}{" "}
                {toToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gas Fee</span>
              <span>
                {calculateGasFee()} ETH {isPrivateSwap && "(+150%)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Slippage Tolerance</span>
              <span>{slippage}%</span>
            </div>
          </div>

          {transactionStatus && (
            <Alert className={`${getStatusColor()} border-0`}>
              <AlertDescription>{getStatusMessage()}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-center p-4">
          <Button
            onClick={handleSwap}
            disabled={!isConnected ? false : !validSwap}
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {!isConnected
              ? "Connect Wallet"
              : insufficientBalance
              ? "Insufficient Balance"
              : "Swap"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BlockchainSwapWidget;
