import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

const Send = () => {
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

  const [token, setToken] = useState(assetIdFromUrl || "1");
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [memo, setMemo] = useState("");
  const [gasLevel, setGasLevel] = useState("standard");
  const [usePrivateBalance, setUsePrivateBalance] = useState(true);
  const [enablePrivacy, setEnablePrivacy] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);

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

  const presets = [
    {
      address: "aztec:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      name: "Savings Vault",
    },
    {
      address: "aztec:0x1A0F37462583B5b23d1505A884F8bD554BD40264",
      name: "Hot Wallet",
    },
  ];

  const gasFees = {
    slow: { fee: "0.0005", time: "~5 min" },
    standard: { fee: "0.001", time: "~1 min" },
    fast: { fee: "0.002", time: "~30 sec" },
  };

  const handleMaxAmount = () => {
    const tokenObj = tokens.find((t) => t.id === token);
    if (tokenObj) {
      const balance = usePrivateBalance
        ? tokenObj.balance.private
        : tokenObj.balance.public;

      // Account for gas if sending ETH
      if (tokenObj.name === "ETH") {
        // Deduct gas fee from max amount
        const gasFee = parseFloat(gasFees[gasLevel].fee);
        const privacyFee = enablePrivacy ? 0.0005 : 0;
        const maxAmount = Math.max(0, balance - gasFee - privacyFee).toFixed(6);
        setAmount(maxAmount);
      } else {
        setAmount(balance.toString());
      }
    }
  };

  const handleSelectPreset = (address, name) => {
    setReceiver(address);
    setSelectedPreset(address);
  };

  const getSelectedTokenBalance = () => {
    const tokenObj = tokens.find((t) => t.id === token);
    if (!tokenObj) return { private: 0, public: 0 };
    return tokenObj.balance;
  };

  const canSend = () => {
    if (!token || !amount || parseFloat(amount) <= 0 || !receiver) return false;

    const tokenObj = tokens.find((t) => t.id === token);
    if (!tokenObj) return false;

    const balance = usePrivateBalance
      ? tokenObj.balance.private
      : tokenObj.balance.public;

    if (tokenObj.name === "ETH") {
      const gasFee = parseFloat(gasFees[gasLevel].fee);
      const privacyFee = enablePrivacy ? 0.0005 : 0;
      return parseFloat(amount) + gasFee + privacyFee <= balance;
    }

    return parseFloat(amount) <= balance;
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleSend = () => {
    const tokenObj = tokens.find((t) => t.id === token);
    const txType = usePrivateBalance
      ? enablePrivacy
        ? "private-to-private"
        : "private-to-public"
      : "public";

    toast({
      title: "Transaction initiated",
      description: `Sending ${amount} ${tokenObj?.name} to ${receiver} using ${txType} mode`,
    });

    setTimeout(() => navigate("/"), 1500);
  };

  const calculateTotalCost = () => {
    if (!token || !amount || parseFloat(amount) <= 0) return null;

    const tokenObj = tokens.find((t) => t.id === token);
    if (!tokenObj) return null;

    if (tokenObj.name === "ETH") {
      const gasFee = parseFloat(gasFees[gasLevel].fee);
      const privacyFee = enablePrivacy ? 0.0005 : 0;
      const totalAmount = parseFloat(amount) + gasFee + privacyFee;
      return {
        amount: parseFloat(amount),
        gasFee,
        privacyFee,
        total: totalAmount,
        usdValue: totalAmount * tokenObj.price,
      };
    }

    return {
      amount: parseFloat(amount),
      gasFee: 0,
      privacyFee: 0,
      total: parseFloat(amount),
      usdValue: parseFloat(amount) * tokenObj.price,
    };
  };

  const totalCost = calculateTotalCost();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md bg-background text-foreground min-h-screen">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Send Tokens</h1>
      </div>

      <Card className="mb-6 border-2 border-primary/10">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base font-medium flex items-center">
            <span>Send from: </span>
            <Badge variant="outline" className="ml-2 font-mono">
              {usePrivateBalance ? "Private" : "Public"} Balance
            </Badge>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <Switch
                id="balance-mode"
                checked={usePrivateBalance}
                onCheckedChange={setUsePrivateBalance}
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-0 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receiver" className="text-sm">
              Recipient Address
            </Label>
            <Input
              id="receiver"
              placeholder="aztec:0x..."
              value={receiver}
              onChange={(e) => {
                setReceiver(e.target.value);
                setSelectedPreset(
                  presets.find((p) => p.address === e.target.value)?.address ||
                    null
                );
              }}
              className="font-mono text-sm"
            />

            {presets.length > 0 && (
              <div className="pt-1">
                <div className="text-xs text-muted-foreground mb-2">
                  Saved Addresses
                </div>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.address}
                      variant={
                        selectedPreset === preset.address
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleSelectPreset(preset.address, preset.name)
                      }
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label htmlFor="token" className="text-sm">
                Token
              </Label>
              <Select id="token" value={token} onValueChange={setToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <div className="flex justify-between">
                <Label htmlFor="amount" className="text-sm">
                  Amount
                </Label>
                <span className="text-xs text-muted-foreground">
                  Balance:{" "}
                  {
                    getSelectedTokenBalance()[
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
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memo" className="text-sm">
              Memo (Optional)
            </Label>
            <Textarea
              id="memo"
              placeholder="Add a note to this transaction"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="resize-none h-20"
            />
          </div>

          {totalCost && (
            <div className="p-3 rounded-lg bg-muted/30 space-y-2">
              <div className="text-sm font-medium">Transaction Summary</div>

              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span>
                  {totalCost.amount} {tokens.find((t) => t.id === token)?.name}
                </span>
              </div>

              {tokens.find((t) => t.id === token)?.name === "ETH" && (
                <>
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Gas Fee</span>
                    <span>{totalCost.gasFee} ETH</span>
                  </div>

                  {enablePrivacy && usePrivateBalance && (
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Privacy Fee</span>
                      <span>{totalCost.privacyFee} ETH</span>
                    </div>
                  )}

                  <Separator className="my-1" />

                  <div className="text-sm flex justify-between font-medium">
                    <span>Total</span>
                    <span>{totalCost.total.toFixed(6)} ETH</span>
                  </div>
                </>
              )}

              <div className="text-xs flex justify-between text-muted-foreground">
                <span>USD Value</span>
                <span>${totalCost.usdValue.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pt-0 pb-4">
          <Button
            className="w-full h-12 text-base"
            disabled={!canSend()}
            onClick={handleSend}
          >
            {!token
              ? "Select token"
              : !amount || parseFloat(amount) <= 0
              ? "Enter amount"
              : !receiver
              ? "Enter recipient address"
              : !canSend()
              ? "Insufficient balance"
              : `Send ${amount} ${tokens.find((t) => t.id === token)?.name}`}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base font-medium">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent transactions found</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Send;
