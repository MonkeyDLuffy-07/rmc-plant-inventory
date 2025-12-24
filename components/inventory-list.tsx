"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { getMaterials, deleteMaterial, type Material } from "@/lib/storage";
import { MaterialDialog } from "@/components/material-dialog";

interface InventoryListProps {
  userRole: "admin" | "operator";
}

export function InventoryList({ userRole }: InventoryListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await getMaterials();
    setMaterials(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      await deleteMaterial(id);
      await loadMaterials();
    }
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedMaterial(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMaterial(null);
    loadMaterials();
  };

  const filteredMaterials =
    filterCategory === "all"
      ? materials
      : materials.filter((m) => m.category.toLowerCase() === filterCategory.toLowerCase());

  const categories = [
    { value: "all", label: "All Materials" },
    { value: "cement", label: "Cement" },
    { value: "sand", label: "Sand" },
    { value: "aggregates", label: "Aggregates" },
    { value: "water", label: "Water" },
    { value: "admixtures", label: "Admixtures" },
  ];

  const getStockStatus = (material: Material) => {
    if (material.currentStock === 0) return { label: "Out of Stock", color: "destructive" };
    if (material.currentStock <= material.minStockLevel) return { label: "Low Stock", color: "warning" };
    if (material.currentStock >= material.maxStockLevel) return { label: "Overstocked", color: "info" };
    return { label: "In Stock", color: "success" };
  };

  const getStockPercentage = (material: Material) => {
    return ((material.currentStock / material.maxStockLevel) * 100).toFixed(0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading materials...</div>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={filterCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
        {userRole === "admin" && (
          <Button onClick={handleAdd} className="ml-auto" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredMaterials.map((material) => {
          const status = getStockStatus(material);
          const percentage = getStockPercentage(material);

          return (
            <Card key={material.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardTitle>{material.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{material.category}</p>
                </div>
                {userRole === "admin" && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(material)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Current Stock</p>
                    <p className="text-lg">{material.currentStock.toFixed(1)} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={status.color as any}>{status.label}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Min Stock</p>
                    <p>{material.minStockLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stock Level</p>
                    <p>{percentage}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Unit Price</p>
                    <p>₹{material.unitPrice}/{material.unit}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Total Value</p>
                    <p>₹{(material.currentStock * material.unitPrice).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Supplier</p>
                    <p>{material.supplier}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Location</p>
                    <p>{material.location}</p>
                  </div>
                </div>
                {material.currentStock <= material.minStockLevel && (
                  <div className="flex items-center gap-2 text-warning text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Reorder required
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No materials found in this category.
          </CardContent>
        </Card>
      )}

      <MaterialDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        material={selectedMaterial}
      />
    </>
  );
}
