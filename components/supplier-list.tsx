"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Star } from "lucide-react";
import { getSuppliers, deleteSupplier, getMaterials, type Supplier, type Material } from "@/lib/storage";
import { SupplierDialog } from "@/components/supplier-dialog";

interface SupplierListProps {
  userRole: "admin" | "operator";
}

export function SupplierList({ userRole }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [suppliersData, materialsData] = await Promise.all([
      getSuppliers(),
      getMaterials(),
    ]);
    setSuppliers(suppliersData);
    setMaterials(materialsData);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier(id);
      await loadData();
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSupplier(null);
    loadData();
  };

  const getMaterialNames = (materialIds: string[]) => {
    return materialIds.map((id) => materials.find((m) => m.id === id)?.name || id).join(", ");
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (filter === "active") return s.isActive;
    if (filter === "inactive") return !s.isActive;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading suppliers...</div>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Suppliers
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("inactive")}
        >
          Inactive
        </Button>
        {userRole === "admin" && (
          <Button onClick={handleAdd} className="ml-auto" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div>
                <CardTitle>{supplier.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {supplier.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              {userRole === "admin" && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(supplier)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{supplier.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{supplier.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Person</p>
                  <p className="text-sm">{supplier.contactPerson}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm">{supplier.address}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Supplied Materials</p>
                <p className="text-sm">{getMaterialNames(supplier.materials) || "None"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No suppliers found.
          </CardContent>
        </Card>
      )}

      <SupplierDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        supplier={selectedSupplier}
      />
    </>
  );
}
