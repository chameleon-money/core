import React from "react";
import BlockchainSwapWidget from "../components/BlockchainSwapWidget";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, History, Lock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Swap = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-center">
            <Tabs defaultValue="swap" className="w-full max-w-md">
              <TabsList className="grid grid-cols-2 bg-gray-900 border border-gray-800">
                <TabsTrigger
                  value="swap"
                  className="text-gray-300 data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-300 hover:text-white"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Swap
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="text-gray-300 data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-300 hover:text-white"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swap">
                <div className="flex justify-center w-full mb-6">
                  <BlockchainSwapWidget />
                </div>

                <Card className="mt-6 bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div>
                        <h3 className="text-lg font-medium text-blue-300 flex items-center">
                          <Lock className="h-4 w-4 mr-2" /> Privacy Layer
                          Protection
                        </h3>
                        <p className="text-gray-300 mt-2 text-sm">
                          All transactions are shielded through our advanced
                          privacy layer built with Aztec and Noir ZK proof
                          technology.
                        </p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-300">
                              Aztec
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              Provide layer-2 privacy infrastructure that
                              shields transaction sender.
                            </p>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-300">
                              Noir ZK Proofs
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              Enable verification of transactions without
                              revealing sensitive information to third parties.
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-gray-400">
                          <Info className="h-3 w-3 mr-1" />
                          Private transactions may incur additional gas fees for
                          zero-knowledge proof generation.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex justify-center items-center py-12 flex-col">
                      <History className="h-12 w-12 text-gray-700 mb-4" />
                      <p className="text-gray-400">
                        Connect your wallet to view transaction history
                      </p>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        Connect Wallet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Swap;
