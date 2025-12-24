"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMaterials, createTransaction, type Material } from "@/lib/storage";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDialog({ isOpen, onClose }: TransactionDialogProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState({
    materialId: "",
    type: "in" as "in" | "out",
    quantity: 0,
    referenceNumber: "",
    supplier: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
      const ref = `TXN-${Date.now().toString().slice(-8)}`;
      setFormData({
        materialId: "",
        type: "in",
        quantity: 0,
        referenceNumber: ref,
        supplier: "",
        notes: "",
      });
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    const data = await getMaterials();
    setMaterials(data);
  };

  const selectedMaterial = materials.find((m) => m.id === formData.materialId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!selectedMaterial) {
        throw new Error("Please select a material");
      }

      await createTransaction({
        materialId: formData.materialId,
        materialName: selectedMaterial.name,
        type: formData.type,
        quantity: formData.quantity,
        referenceNumber: formData.referenceNumber,
        supplier: formData.supplier || undefined,
        notes: formData.notes || undefined,
        createdBy: "Operator",
      });

      setFormData({
        materialId: "",
        type: "in",
        quantity: 0,
        referenceNumber: "",
        supplier: "",
        notes: "",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materialId">Material *</Label>
            <Select
              value={formData.materialId}
              onValueChange={(v) => setFormData({ ...formData, materialId: v })}
            >
              <SelectTrigger id="materialId">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as "in" | "out" })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number *</Label>
            <Input
              id="referenceNumber"
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData({ ...formData, referenceNumber: e.target.value })
              }
              placeholder="e.g., INV-001, PO-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (optional)</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          {selectedMaterial && formData.type === "out" &&
            formData.quantity > selectedMaterial.currentStock && (
              <p className="text-sm text-destructive">
                Warning: Requested quantity exceeds available stock (
                {selectedMaterial.currentStock} {selectedMaterial.unit})
              </p>
            )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
