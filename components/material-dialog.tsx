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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaterial, updateMaterial, type Material } from "@/lib/storage";

interface MaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export function MaterialDialog({ isOpen, onClose, material }: MaterialDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    currentStock: 0,
    minStockLevel: 0,
    unitPrice: 0,
    supplier: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        category: material.category,
        unit: material.unit,
        currentStock: material.currentStock,
        minStockLevel: material.minStockLevel,
        unitPrice: material.unitPrice,
        supplier: material.supplier,
        location: material.location,
      });
    } else {
      setFormData({
        name: "",
        category: "",
        unit: "",
        currentStock: 0,
        minStockLevel: 0,
        unitPrice: 0,
        supplier: "",
        location: "",
      });
    }
    setError("");
  }, [material, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (material) {
        await updateMaterial(material.id, formData);
      } else {
        await createMaterial(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{material ? "Edit Material" : "Add New Material"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Material Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cement">Cement</SelectItem>
                  <SelectItem value="Sand">Sand</SelectItem>
                  <SelectItem value="Aggregates">Aggregates</SelectItem>
                  <SelectItem value="Water">Water</SelectItem>
                  <SelectItem value="Admixtures">Admixtures</SelectItem>
                  <SelectItem value="Supplementary">Supplementary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) => setFormData({ ...formData, unit: v })}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT">MT</SelectItem>
                  <SelectItem value="KL">KL</SelectItem>
                  <SelectItem value="Ltr">Ltr</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                step="0.1"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({ ...formData, currentStock: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level *</Label>
              <Input
                id="minStockLevel"
                type="number"
                step="0.1"
                value={formData.minStockLevel}
                onChange={(e) =>
                  setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Storage Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
