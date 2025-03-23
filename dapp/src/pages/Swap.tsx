import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  Settings,
  RefreshCw,
  Lock,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const Swap = () => {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const assetIdFromUrl = params.get("asset");

  const [fromToken, setFromToken] = useState(assetIdFromUrl || "1");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [usePrivateBalance, setUsePrivateBalance] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const tokens = [
    {
      id: "1",
      name: "ETH",
      balance: { private: 1.75, public: 0.7 },
      price: 3000,
    },
    {
      id: "2",
      name: "BTC",
      balance: { private: 0.1, public: 0.05 },
      price: 63000,
    },
    {
      id: "3",
      name: "USDC",
      balance: { private: 1000, public: 250 },
      price: 1,
    },
    { id: "4", name: "AZTNR", balance: { private: 450, public: 50 }, price: 5 },
  ];

  useEffect(() => {
    if (fromToken && fromAmount && fromAmount !== "") {
      const sourceToken = tokens.find((t) => t.id === fromToken);
      const targetToken = tokens.find((t) => t.id === toToken);

      if (sourceToken && targetToken) {
        const calculatedAmount = (
          (parseFloat(fromAmount) * sourceToken.price) /
          targetToken.price
        ).toFixed(6);
        setToAmount(calculatedAmount);
      }
    } else {
      setToAmount("");
    }
  }, [fromToken, toToken, fromAmount]);

  useEffect(() => {
    if (fromToken && toToken === fromToken) {
      const availableTokens = tokens.filter((t) => t.id !== fromToken);
      if (availableTokens.length > 0) {
        setToToken(availableTokens[0].id);
      }
    }
  }, [fromToken, toToken]);

  useEffect(() => {
    if (fromToken && !toToken && tokens.length > 1) {
      const availableTokens = tokens.filter((t) => t.id !== fromToken);
      if (availableTokens.length > 0) {
        setToToken(availableTokens[0].id);
      }
    }
  }, []);

  const handleFromTokenChange = (value) => {
    setFromToken(value);
    if (value === toToken) {
      const availableTokens = tokens.filter((t) => t.id !== value);
      if (availableTokens.length > 0) {
        setToToken(availableTokens[0].id);
      }
    }
  };

  const handleToTokenChange = (value) => {
    setToToken(value);
    if (value === fromToken) {
      const availableTokens = tokens.filter((t) => t.id !== value);
      if (availableTokens.length > 0) {
        setFromToken(availableTokens[0].id);
      }
    }
  };

  const handleSwitchTokens = () => {
    const tempFromToken = fromToken;
    const tempFromAmount = fromAmount;

    setFromToken(toToken);
    setFromAmount(toAmount);
    setToToken(tempFromToken);
    setToAmount(tempFromAmount);
  };

  const handleMaxAmount = () => {
    const token = tokens.find((t) => t.id === fromToken);
    if (token) {
      const balance = usePrivateBalance
        ? token.balance.private
        : token.balance.public;
      setFromAmount(balance.toString());
    }
  };

  const getSelectedTokenBalance = (tokenId) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return { private: 0, public: 0 };
    return token.balance;
  };

  const canSwap = () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0)
      return false;

    const token = tokens.find((t) => t.id === fromToken);
    if (!token) return false;

    const balance = usePrivateBalance
      ? token.balance.private
      : token.balance.public;
    return parseFloat(fromAmount) <= balance;
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleSwap = () => {
    // In a real app, this would initiate the swap transaction
    alert(
      `Swapping ${fromAmount} ${
        tokens.find((t) => t.id === fromToken)?.name
      } for ${toAmount} ${
        tokens.find((t) => t.id === toToken)?.name
      } with ${slippage}% slippage tolerance`
    );
    // After successful swap, redirect back to portfolio
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md bg-background text-foreground min-h-screen">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Swap Tokens</h1>
        <div className="flex-1"></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Card className="mb-6 border-2 border-primary/10">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base font-medium flex items-center">
            <span>Privacy Mode: </span>
            <Badge variant="outline" className="ml-2 font-mono">
              {usePrivateBalance ? "Private" : "Public"}
            </Badge>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <Switch
                id="privacy-mode"
                checked={usePrivateBalance}
                onCheckedChange={setUsePrivateBalance}
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-0 pb-4 space-y-4">
          {/* From Token */}
          <div className="p-4 rounded-xl bg-muted/40">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-xs text-muted-foreground">
                Balance:{" "}
                {
                  getSelectedTokenBalance(fromToken)[
                    usePrivateBalance ? "private" : "public"
                  ]
                }
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs ml-1"
                  onClick={handleMaxAmount}
                >
                  MAX
                </Button>
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-background border-none text-xl font-medium"
              />

              <Select value={fromToken} onValueChange={handleFromTokenChange}>
                <SelectTrigger className="w-32 bg-background border-none">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwitchTokens}
              className="rounded-full h-10 w-10 bg-muted/60 text-foreground hover:bg-primary/20"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          {/* To Token */}
          <div className="p-4 rounded-xl bg-muted/40">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                To (Estimated)
              </span>
              <span className="text-xs text-muted-foreground">
                Balance:{" "}
                {
                  getSelectedTokenBalance(toToken)[
                    usePrivateBalance ? "private" : "public"
                  ]
                }
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="bg-background border-none text-xl font-medium"
              />

              <Select value={toToken} onValueChange={handleToTokenChange}>
                <SelectTrigger className="w-32 bg-background border-none">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem
                      key={token.id}
                      value={token.id}
                      disabled={token.id === fromToken}
                    >
                      {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 rounded-xl bg-muted/40 space-y-3">
              <h3 className="text-sm font-medium">Swap Settings</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slippage" className="text-sm">
                    Slippage Tolerance: {slippage}%
                  </Label>
                </div>
                <Slider
                  id="slippage"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[slippage]}
                  onValueChange={(value) => setSlippage(value[0])}
                />
                <div className="flex gap-2 mt-2">
                  {[0.5, 1, 2, 3].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span>
                    1 {tokens.find((t) => t.id === fromToken)?.name} ={" "}
                    {tokens.find((t) => t.id === fromToken)?.price &&
                    tokens.find((t) => t.id === toToken)?.price
                      ? (
                          tokens.find((t) => t.id === fromToken).price /
                          tokens.find((t) => t.id === toToken).price
                        ).toFixed(6)
                      : "0"}{" "}
                    {tokens.find((t) => t.id === toToken)?.name}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~0.0012 ETH</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Privacy Fee</span>
                  <span>~0.0005 ETH</span>
                </div>
              </div>
            </div>
          )}

          {/* Show price impact and rate info when not showing settings */}
          {!showSettings && fromAmount && parseFloat(fromAmount) > 0 && (
            <div className="px-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Price Impact</span>
                <span className="text-green-500">~0.05%</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pt-0 pb-4">
          <Button
            className="w-full h-12 text-base"
            disabled={!canSwap()}
            onClick={handleSwap}
          >
            {!fromToken || !toToken
              ? "Select tokens"
              : !fromAmount || parseFloat(fromAmount) <= 0
              ? "Enter amount"
              : !canSwap()
              ? "Insufficient balance"
              : `Swap ${tokens.find((t) => t.id === fromToken)?.name} to ${
                  tokens.find((t) => t.id === toToken)?.name
                }`}
          </Button>
        </CardFooter>
      </Card>

      {/* Recent Transactions Card */}
      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base font-medium">Recent Swaps</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent swaps found</p>
            <p className="text-sm">Your swap history will appear here</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div>
              <h3 className="text-lg font-medium text-blue-300 flex items-center">
                <Lock className="h-4 w-4 mr-2" /> Privacy Layer Protection
              </h3>
              <p className="text-gray-300 mt-2 text-sm">
                All transactions are shielded through our advanced privacy layer
                built with Aztec and Noir ZK proof technology.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-950 p-3 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-blue-300">Aztec</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Provide layer-2 privacy infrastructure that shields
                    transaction sender.
                  </p>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-blue-300">
                    Noir ZK Proofs
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Enable verification of transactions without revealing
                    sensitive information to third parties.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-400">
                <Info className="h-3 w-3 mr-2" />
                Private transactions may incur additional gas fees for
                zero-knowledge proof generation.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Swap;
