import { useNavigate } from "react-router-dom";
import {
  Shield,
  CreditCard,
  Wallet,
  Settings,
  ArrowUpRight,
  ChevronRight,
  History,
  Lock,
  Layers,
  Rocket,
  MessageSquareText,
  FileCog,
  BadgeHelp,
  ChevronLeft,
  Github,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

const Home = () => {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Add CSS for floating animation
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes float-0 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-15px) translateX(10px); }
        50% { transform: translateY(-5px) translateX(15px); }
        75% { transform: translateY(-10px) translateX(-5px); }
      }
      
      @keyframes float-1 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-10px) translateX(-10px); }
        50% { transform: translateY(-15px) translateX(-5px); }
        75% { transform: translateY(-5px) translateX(10px); }
      }
      
      @keyframes float-2 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(10px) translateX(15px); }
        50% { transform: translateY(5px) translateX(-10px); }
        75% { transform: translateY(15px) translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.documentElement.classList.remove("dark");
      document.head.removeChild(style);
    };
  }, []);

  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-scroll feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Feature carousel data
  const features = [
    {
      id: 1,
      title: "Complete Privacy",
      description:
        "All transactions on default are private while still being verifiable on-chain.",
      icon: Shield,
      img: "detective.jpeg",
    },
    {
      id: 2,
      title: "Hybrid Balances",
      description:
        "Seamlessly manage both private and public balances from a single interface. Convert between them with just a few clicks.",
      icon: Layers,
      img: "mountains.jpeg",
    },
    {
      id: 3,
      title: "Private Transfers",
      description:
        "Send money to your other wallets without leaving any trails or third-parties without revealing your address.",
      icon: Rocket,
      img: "shield.jpeg",
    },
    {
      id: 4,
      title: "Cross-Chain Bridging",
      description:
        "Move assets between different Ethereum and Aztec while preserving privacy with native Aztec token portal.",
      icon: ArrowUpRight,
      img: "bridge.jpeg",
    },
    {
      id: 5,
      title: "Private Swaps",
      description:
        "Securely swap between different assets on Aztec while tapping into L1 Uniswap liquidity.",
      icon: Lock,
      img: "money.jpeg",
    },
  ];

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-foreground">
      <div className="mb-8 rounded-xl overflow-hidden relative">
        {/* <div className="absolute inset-0 bg-gradient-to-br from-violet-800/90 via-indigo-900/90 to-slate-900/95 z-10"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/400?text=Background')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,transparent,white)] mix-blend-overlay"></div> */}

        <div className="relative z-20 px-6 py-16 md:py-24 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-3/5 mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-medium text-white/90">
                  Powered by Aztec + Noir
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                The Future of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Private Finance
                </span>{" "}
                is Here
              </h1>
              <p className="text-lg text-slate-200 mb-8 max-w-lg">
                Chameleon enables fully private transactions and interactions
                thanks to use of Aztec L2 and Noir smart contract while tapping
                into liquidity sources from the Ethereum L1.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigateTo("/portfolio")}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 h-12 px-6 font-medium"
                >
                  View Portfolio
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 h-12 px-6 font-medium"
                  onClick={() => navigateTo("/send")}
                >
                  Send Tokens
                </Button>
              </div>
            </div>

            <div className="md:w-2/5 flex justify-center relative">
              <div className="relative w-96 h-96">
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/chameleon.png')",
                      maskImage:
                        "linear-gradient(to top, transparent, purple 40%)",
                      WebkitMaskImage:
                        "linear-gradient(to top, transparent, purple 40%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800">
        <div className="px-6 pt-6">
          <h2 className="text-2xl font-bold text-white">
            Experience the Future
          </h2>
          <p className="text-slate-400">Chameleon Features</p>
        </div>
        <div
          className="relative mt-4 overflow-hidden"
          style={{ height: "480px" }}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-slate-950 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,80,200,0.1),transparent_60%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(60,100,200,0.1),transparent_60%)]"></div>
          </div>

          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`absolute top-0 left-0 w-full h-full transition-all duration-700 z-10 ${
                index === activeFeature
                  ? "opacity-100 transform-none"
                  : index === (activeFeature + 1) % features.length ||
                    index ===
                      (activeFeature - 1 + features.length) % features.length
                  ? "opacity-0 translate-x-full"
                  : "opacity-0 -translate-x-full"
              }`}
            >
              <div className="h-full flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-2xl transform rotate-3 scale-95"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/30 to-violet-900/30 rounded-2xl transform -rotate-3 scale-95"></div>

                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl shadow-violet-900/20 overflow-hidden border border-slate-700/50">
                    <div className="absolute inset-0 bg-grid-white/5 mix-blend-overlay"></div>
                    <img
                      src={`/${feature.img}`}
                      alt={`Feature ${feature.id}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <h3 className="text-xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 mb-3">
                    {/* <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm text-indigo-300 shadow-lg shadow-indigo-900/20">
                      <feature.icon className="h-7 w-7" />
                    </div> */}
                    <div className="flex flex-col">
                      <div className="text-xs text-indigo-400 uppercase tracking-wider font-medium">
                        Feature {index + 1}/{features.length}
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-8 flex gap-3">
                    {/* <Button
                      size="lg"
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-900/20"
                    >
                      Explore Feature
                    </Button> */}
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/30 border-slate-700 text-slate-300 hover:bg-black/50"
              onClick={() =>
                setActiveFeature(
                  (prev) => (prev - 1 + features.length) % features.length
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`flex items-center justify-center transition-all ${
                    index === activeFeature
                      ? "w-4 h-4 bg-indigo-500"
                      : "w-4 h-4 bg-slate-700"
                  } h-2 rounded-full`}
                  aria-label={`Go to feature ${index + 1}`}
                >
                  {index === activeFeature && (
                    <span className="text-xs text-white font-medium">
                      {index + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/30 border-slate-700 text-slate-300 hover:bg-black/50"
              onClick={() =>
                setActiveFeature((prev) => (prev + 1) % features.length)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => navigateTo("/portfolio")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Wallet className="h-8 w-8 mb-3 text-primary" />
              <span className="font-medium">Portfolio</span>
              <span className="text-xs text-muted-foreground mt-1">
                View your assets
              </span>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => navigateTo("/send")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <ArrowUpRight className="h-8 w-8 mb-3 text-primary" />
              <span className="font-medium">Send</span>
              <span className="text-xs text-muted-foreground mt-1">
                Transfer tokens
              </span>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => navigateTo("/swap")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CreditCard className="h-8 w-8 mb-3 text-primary" />
              <span className="font-medium">Swap</span>
              <span className="text-xs text-muted-foreground mt-1">
                Exchange assets
              </span>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => navigateTo("/settings")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Settings className="h-8 w-8 mb-3 text-primary" />
              <span className="font-medium">Settings</span>
              <span className="text-xs text-muted-foreground mt-1">
                Configure wallet
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Github className="h-8 w-8 mr-4 text-primary" />
            <div>
              <h3 className="font-bold text-lg">
                Built for EthGlobal Triefecta
              </h3>
              <p className="text-sm text-muted-foreground">
                Project is fully Open-Source
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="https://github.com/chameleon-money/core"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                View Github
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground py-4 px-2">
        <p>Chameleon | Secured by zero-knowledge cryptography</p>
      </footer>
    </div>
  );
};

export default Home;
