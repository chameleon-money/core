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
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(124, 58, 237, 0.5)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-6xl text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="mb-8 rounded-xl overflow-hidden relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <div className="relative z-20 px-6 py-16 md:py-24 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-3/5 mb-8 md:mb-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
                variants={itemVariants}
              >
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-medium text-white/90">
                  Powered by Aztec + Noir
                </span>
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
                variants={itemVariants}
              >
                Leave no traces onchain with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Chameleon
                </span>{" "}
                privacy-friendly wallet
              </motion.h1>
              <motion.p
                className="text-lg text-slate-200 mb-8 max-w-lg"
                variants={itemVariants}
              >
                Chameleon enables fully private transactions and interactions
                thanks to use of Aztec L2 and Noir smart contract while tapping
                into liquidity sources from the Ethereum L1.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigateTo("/portfolio")}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 h-12 px-6 font-medium"
                  >
                    View Portfolio
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 h-12 px-6 font-medium"
                    onClick={() => navigateTo("/send")}
                  >
                    Send Tokens
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="md:w-2/5 flex justify-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.6,
              }}
            >
              <motion.div
                className="relative w-96 h-96"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
              >
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mb-8 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="px-6 pt-6">
          <motion.h2
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Experience the Future
          </motion.h2>
          <motion.p
            className="text-slate-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Chameleon Features
          </motion.p>
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

          <AnimatePresence mode="wait">
            {features.map(
              (feature, index) =>
                index === activeFeature && (
                  <motion.div
                    key={feature.id}
                    className="absolute top-0 left-0 w-full h-full z-10"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="h-full flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 p-6 flex items-center justify-center relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-2xl"
                          initial={{ rotate: 0, scale: 0.9 }}
                          animate={{ rotate: 3, scale: 0.95 }}
                          transition={{ duration: 0.5 }}
                        ></motion.div>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-tl from-indigo-900/30 to-violet-900/30 rounded-2xl"
                          initial={{ rotate: 0, scale: 0.9 }}
                          animate={{ rotate: -3, scale: 0.95 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        ></motion.div>

                        <motion.div
                          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl shadow-violet-900/20 overflow-hidden border border-slate-700/50"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className="absolute inset-0 bg-grid-white/5 mix-blend-overlay"></div>
                          <img
                            src={`/${feature.img}`}
                            alt={`Feature ${feature.id}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                          <motion.div
                            className="absolute bottom-0 left-0 w-full p-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            <h3 className="text-xl font-bold text-white">
                              {feature.title}
                            </h3>
                          </motion.div>
                        </motion.div>
                      </div>

                      <motion.div
                        className="w-full md:w-1/2 p-6 flex flex-col justify-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          className="inline-flex items-center gap-2 mb-3"
                          variants={itemVariants}
                        >
                          <div className="flex flex-col">
                            <div className="text-xs text-indigo-400 uppercase tracking-wider font-medium">
                              Feature {index + 1}/{features.length}
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                              {feature.title}
                            </h3>
                          </div>
                        </motion.div>

                        <motion.p
                          className="text-slate-300 text-lg leading-relaxed"
                          variants={itemVariants}
                        >
                          {feature.description}
                        </motion.p>

                        <motion.div
                          className="mt-8 flex gap-3"
                          variants={itemVariants}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="lg"
                              variant="outline"
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              Learn More
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>

          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
            </motion.div>

            <div className="flex gap-2">
              {features.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`flex items-center justify-center transition-all ${
                    index === activeFeature
                      ? "w-4 h-4 bg-indigo-500"
                      : "w-4 h-4 bg-slate-700"
                  } h-2 rounded-full`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to feature ${index + 1}`}
                >
                  {index === activeFeature && (
                    <span className="text-xs text-white font-medium">
                      {index + 1}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.h2
          className="text-xl font-bold mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Quick Actions
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <motion.div whileHover="hover" variants={cardHoverVariants}>
            <Card
              className="hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => navigateTo("/portfolio")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                    delay: 0.1,
                  }}
                >
                  <Wallet className="h-8 w-8 mb-3 text-primary" />
                </motion.div>
                <motion.span
                  className="font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Portfolio
                </motion.span>
                <motion.span
                  className="text-xs text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  View your assets
                </motion.span>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover="hover" variants={cardHoverVariants}>
            <Card
              className="hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => navigateTo("/send")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                    delay: 0.2,
                  }}
                >
                  <ArrowUpRight className="h-8 w-8 mb-3 text-primary" />
                </motion.div>
                <motion.span
                  className="font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Send
                </motion.span>
                <motion.span
                  className="text-xs text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Transfer tokens
                </motion.span>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover="hover" variants={cardHoverVariants}>
            <Card
              className="hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => navigateTo("/swap")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                    delay: 0.3,
                  }}
                >
                  <CreditCard className="h-8 w-8 mb-3 text-primary" />
                </motion.div>
                <motion.span
                  className="font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Swap
                </motion.span>
                <motion.span
                  className="text-xs text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Swap assets
                </motion.span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        whileHover={{ y: -5 }}
      >
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
            <motion.div
              className="flex gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="https://github.com/chameleon-money/core" target="_blank">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  View Github
                </Button>
              </a>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.footer
        className="text-center text-sm text-muted-foreground py-4 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <p>Chameleon | Secured by zero-knowledge cryptography</p>
      </motion.footer>
    </motion.div>
  );
};

export default Home;
