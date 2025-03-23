import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Copy, Eye, EyeOff, Send, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const Portfolio = () => {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);
  const navigate = useNavigate();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSigningKey, setShowSigningKey] = useState(false);

  const walletData = {
    publicAddress: "aztec:0x7Fc9a0C166E6B2C045D9e19F9Bb69511FeA14F5b",
    privateKey:
      "0x8a85d840b24f2f9210837f190563e87eb40395c9f95824d0edfee8d6290c25ad",
    signingKey:
      "0x2a63f0c8912d4b5e8a9f6c9e4c8f9e6a4f5b2c1e0d9f8b7a6c5d4e3f2a1b0c9d8",
    assets: [
      {
        id: 1,
        name: "ETH",
        amount: 2.45,
        privateAmount: 1.75,
        publicAmount: 0.7,
        value: 7350,
      },
      {
        id: 2,
        name: "BTC",
        amount: 0.15,
        privateAmount: 0.1,
        publicAmount: 0.05,
        value: 9450,
      },
      {
        id: 3,
        name: "USDC",
        amount: 1250,
        privateAmount: 1000,
        publicAmount: 250,
        value: 1250,
      },
      {
        id: 4,
        name: "AZTNR",
        amount: 500,
        privateAmount: 450,
        publicAmount: 50,
        value: 2500,
      },
    ],
    totalValue: 20550,
  };

  const historyData = [
    { name: "Jan", value: 12000 },
    { name: "Feb", value: 14000 },
    { name: "Mar", value: 11000 },
    { name: "Apr", value: 15000 },
    { name: "May", value: 18000 },
    { name: "Jun", value: 17000 },
    { name: "Jul", value: 20550 },
  ];

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
  };

  const navigateToSend = () => {
    navigate("/send");
  };

  const navigateToSwap = (assetId) => {
    navigate(`/swap?asset=${assetId}`);
  };

  const togglePrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  const toggleSigningKey = () => {
    setShowSigningKey(!showSigningKey);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-foreground">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Aztec Noir Wallet</CardTitle>
                <Badge variant="outline" className="font-mono">
                  Private
                </Badge>
              </div>
              <CardDescription>
                Secure private transactions on Aztec Network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Public Address
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md font-mono text-xs md:text-sm break-all">
                    {walletData.publicAddress}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        copyToClipboard(
                          walletData.publicAddress,
                          "Public address"
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Private Key
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md font-mono text-xs md:text-sm break-all">
                    {showPrivateKey
                      ? walletData.privateKey
                      : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={togglePrivateKey}
                      >
                        {showPrivateKey ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(walletData.privateKey, "Private key")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Signing Key
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md font-mono text-xs md:text-sm break-all">
                    {showSigningKey
                      ? walletData.signingKey
                      : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={toggleSigningKey}
                      >
                        {showSigningKey ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(walletData.signingKey, "Signing key")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Value</CardTitle>
                <div className="text-xl font-bold">
                  ${walletData.totalValue.toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historyData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Portfolio Value"]}
                    labelFormatter={(label) => `${label} 2025`}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assets</CardTitle>
                <Button variant="outline" size="sm" className="h-8">
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="private" className="flex-1">
                    Private
                  </TabsTrigger>
                  <TabsTrigger value="public" className="flex-1">
                    Public
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {walletData.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex flex-col space-y-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <div className="bg-primary text-primary-foreground font-bold text-xs rounded-full h-full w-full flex items-center justify-center dark:bg-violet-600">
                              {asset.name.substring(0, 2)}
                            </div>
                          </Avatar>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${asset.value.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {asset.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Private: {asset.privateAmount.toLocaleString()} |
                            Public: {asset.publicAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigateToSwap(asset.id)}
                        >
                          Swap
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={navigateToSend}
                        >
                          <Send className="h-3 w-3 mr-1" /> Send
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="private" className="space-y-4">
                  {walletData.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex flex-col space-y-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <div className="bg-primary text-primary-foreground font-bold text-xs rounded-full h-full w-full flex items-center justify-center">
                              {asset.name.substring(0, 2)}
                            </div>
                          </Avatar>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Private Balance
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {asset.privateAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigateToSwap(asset.id)}
                        >
                          Swap
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={navigateToSend}
                        >
                          <Send className="h-3 w-3 mr-1" /> Send
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="public" className="space-y-4">
                  {walletData.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex flex-col space-y-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <div className="bg-primary text-primary-foreground font-bold text-xs rounded-full h-full w-full flex items-center justify-center">
                              {asset.name.substring(0, 2)}
                            </div>
                          </Avatar>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Public Balance
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {asset.publicAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigateToSwap(asset.id)}
                        >
                          Swap
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={navigateToSend}
                        >
                          <Send className="h-3 w-3 mr-1" /> Send
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={navigateToSend}>
                <Send className="h-4 w-4 mr-2" /> Send Tokens
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
