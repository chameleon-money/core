"use client";

import type React from "react";

import { useState } from "react";
import {
  Check,
  Github,
  Home,
  Lock,
  RefreshCw,
  Send,
  Shield,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Here you would typically send the email to your backend
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* Hero Section */}
      <header className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img
                  src="/images/chameleon-hero.png"
                  alt="Chameleon Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white">Chameleon</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-white/80 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-white/80 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#faq"
                className="text-white/80 hover:text-white transition-colors"
              >
                FAQ
              </a>
            </div>
            <Button
              onClick={() => {
                window.open(
                  "https://github.com/chameleon-money/core",
                  "_blank"
                );
              }}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Documentation
            </Button>
          </nav>

          <div className="mt-20 md:mt-32 flex flex-col md:flex-row items-center gap-12 pb-24">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Powered by Aztec + Noir
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                The Future of <span className="text-purple-500">Private</span>{" "}
                <span className="text-blue-400">Finance</span> is Here
              </h1>
              <p className="text-xl text-white/80">
                Chameleon enables fully private transactions and interactions
                thanks to use of Aztec L2 and Noir smart contract while tapping
                into liquidity sources from the Ethereum L1.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Button
                  onClick={() => {
                    window.location.replace("/#waitlist");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <img
                  src="/images/chameleon-hero.png"
                  alt="Chameleon Digital Art"
                  className="w-full h-auto max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Experience the Future Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-[#0f1429] rounded-xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Experience the Future
                </h2>
                <p className="text-white/70 text-xl mb-6">
                  Discover what sets Aztec Noir apart
                </p>
                <p className="text-white/70 mb-6">
                  Aztec is a groundbreaking Layer 2 solution that brings
                  unparalleled privacy to Ethereum. Combined with Noir, a
                  powerful zero-knowledge programming language, it enables truly
                  private financial applications without sacrificing security or
                  usability.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Learn More
                </Button>
              </div>
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden h-64 bg-gradient-to-r from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                  <img
                    src="/images/chameleon-interface.png"
                    alt="Chameleon Interface"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key Features
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Chameleon combines cutting-edge privacy technology with
              user-friendly design to protect your financial sovereignty.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Wallet className="h-8 w-8 text-purple-500" />,
                title: "Private Web Wallet",
                description:
                  "Generate and securely store your Aztec wallet directly in the dapp with persistent storage.",
              },
              {
                icon: <RefreshCw className="h-8 w-8 text-blue-400" />,
                title: "Private Swaps",
                description:
                  "Execute private swaps from Aztec through Uniswap on Ethereum using our token portal.",
              },
              {
                icon: <Home className="h-8 w-8 text-green-500" />,
                title: "Portfolio Management",
                description:
                  "Manage all your private assets with an intuitive interface designed for privacy.",
              },
              {
                icon: <Lock className="h-8 w-8 text-purple-500" />,
                title: "ZK Lending",
                description:
                  "Access lending protocols while maintaining complete privacy through zero-knowledge proofs.",
              },
              {
                icon: <Send className="h-8 w-8 text-blue-400" />,
                title: "Private Transfers",
                description:
                  "Transfer tokens privately from Aztec network to Ethereum with complete confidentiality.",
              },
              {
                icon: <Shield className="h-8 w-8 text-green-500" />,
                title: "Private Bridging",
                description:
                  "Bridge assets between networks while maintaining privacy using our token portal.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-white"
              >
                <CardContent className="pt-6">
                  <div className="rounded-full bg-black/50 p-3 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Chameleon Works
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Chameleon leverages Aztec and Noir technologies to create a
              seamless privacy layer for your crypto assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-8">
                {[
                  {
                    number: "01",
                    title: "Generate Your Private Wallet",
                    description:
                      "Create an Aztec wallet directly in your browser with our easy-to-use interface.",
                  },
                  {
                    number: "02",
                    title: "Manage Your Assets Privately",
                    description:
                      "View and manage your portfolio with complete privacy, for both public and private tokens.",
                  },
                  {
                    number: "03",
                    title: "Execute Private Transactions",
                    description:
                      "Perform swaps, transfers, and bridging operations without revealing your financial information.",
                  },
                  {
                    number: "04",
                    title: "Access DeFi Privately",
                    description:
                      "Use lending protocols and other DeFi services while maintaining your privacy through zero-knowledge proofs.",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 flex items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {step.title}
                      </h3>
                      <p className="text-white/70">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-400/10 rounded-xl blur-xl"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Chameleon Architecture
                  </h3>
                  <div className="bg-black/50 p-4 rounded-lg">
                    <pre className="text-xs text-white/80 overflow-x-auto">
                      {`flowchart TD
    User["🧑‍💻 User"] --> AztecLayer["🔐 Aztec Layer"]
    AztecLayer --> NoirContracts["🧩 Noir Contracts"]
    NoirContracts --> TokenPortal["🌉 Token Portal"]
    TokenPortal --> EthLayer["⛓️ Ethereum Layer"]
    EthLayer --> DEX["💱 Uniswap"]`}
                    </pre>
                  </div>
                  <p className="mt-4 text-sm text-white/70">
                    Chameleon connects the Aztec privacy layer with Ethereum
                    through our token portal, enabling private interactions with
                    public DeFi protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Learn more about how Chameleon works and what makes it different
              from other privacy solutions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "What is Chameleon?",
                  answer:
                    "Chameleon is the first private web-based wallet and privacy layer built with Aztec and Noir technologies. It allows you to manage your crypto assets and interact with DeFi protocols while maintaining complete privacy.",
                },
                {
                  question: "How does Chameleon ensure privacy?",
                  answer:
                    "Chameleon leverages zero-knowledge proofs through Aztec and Noir to ensure that your transactions and asset holdings remain private. This means you can interact with public blockchains without revealing your financial information.",
                },
                {
                  question: "What blockchains does Chameleon support?",
                  answer:
                    "Chameleon is built on aztec network with support for bridging to Ethereum. We plan to expand support to additional networks in the future.",
                },
                {
                  question: "How can I start using Chameleon?",
                  answer:
                    "Chameleon is currently in development. Join our waitlist to be notified when we launch and to get early access to the platform.",
                },
              ].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-white/10 rounded-lg px-6 bg-white/5"
                >
                  <AccordionTrigger className="text-left font-medium py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/70 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20" id="waitlist">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-purple-900/50 rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Control of Your Privacy?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Join our waitlist to be the first to experience the future of
              private crypto transactions.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Join Waitlist
              </Button>
            </form>
            {submitted && (
              <p className="mt-2 text-green-400 flex items-center justify-center gap-1">
                <Check size={16} /> Thanks! We'll notify you when we launch.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img
                  src="/images/chameleon-hero.png"
                  alt="Chameleon Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-lg font-bold">Chameleon</span>
            </div>
            <div className="flex flex-wrap gap-8 mb-6 md:mb-0 justify-center">
              <a
                href="#features"
                className="text-white/60 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-white/60 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#faq"
                className="text-white/60 hover:text-white transition-colors"
              >
                FAQ
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                Documentation
              </a>
            </div>
            <div className="flex gap-4">
              <a
                href="https://github.com/chameleon-money/core"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
            <p>
              © {new Date().getFullYear()} Chameleon. Some rights reserved.
              Powered by Cryptography
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
