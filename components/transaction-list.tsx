"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { getTransactions, getMaterials, type Transaction, type Material } from "@/lib/storage";
import { format } from "date-fns";
import { TransactionDialog } from "@/components/transaction-dialog";

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [txnsData, matsData] = await Promise.all([
      getTransactions(),
      getMaterials(),
    ]);
    setTransactions(txnsData);
    setMaterials(matsData);
    setLoading(false);
  };

  const getMaterialUnit = (materialId: string) => {
    return materials.find((m) => m.id === materialId)?.unit || "unit";
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    loadData();
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Record Transaction
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions found.
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === "in" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {transaction.type === "in" ? (
                        <ArrowDown className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{transaction.materialName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === "in" ? "Stock In" : "Stock Out"} • Ref:{" "}
                        {transaction.referenceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className={`font-medium ${
                      transaction.type === "in" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "in" ? "+" : "-"} {transaction.quantity}{" "}
                      {getMaterialUnit(transaction.materialId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">By: {transaction.createdBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog isOpen={isDialogOpen} onClose={handleDialogClose} />
    </>
  );
}
