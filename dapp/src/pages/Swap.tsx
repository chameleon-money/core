import React from "react";
import BlockchainSwapWidget from "../components/BlockchainSwapWidget";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  History,
  Wallet,
  ChevronDown,
  Globe,
} from "lucide-react";

const Swap = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-center">
            <Tabs defaultValue="swap" className="w-full max-w-md">
              <TabsList className="grid grid-cols-2 bg-gray-900">
                <TabsTrigger
                  value="swap"
                  className="data-[state=active]:bg-gray-800"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Swap
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-gray-800"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex justify-center w-full">
            <BlockchainSwapWidget />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Swap;
