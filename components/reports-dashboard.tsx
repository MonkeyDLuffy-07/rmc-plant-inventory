"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getMaterials,
  getTransactions,
  getSuppliers,
  type Material,
  type Transaction,
  type Supplier,
} from "@/lib/storage"
import { TrendingUp, TrendingDown, DollarSign, Package, Filter } from "lucide-react"
import { subDays, startOfDay, isAfter, format } from "date-fns"
import { Button } from "@/components/ui/button"

type ReportView =
  | "summary"
  | "material_transactions"
  | "supplier_transactions"
  | "recent_movements"
  | "value_analysis"
  | "consumption_trends"
  | "supplier_comparison"
  | "low_stock_report"
  | "cost_analysis"
  | "procurement_cost"
  | "consumption_cost"

export function ReportsDashboard() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [dateRange, setDateRange] = useState(7) // days
  const [selectedReport, setSelectedReport] = useState<ReportView>("summary")

  useEffect(() => {
    setMaterials(getMaterials())
    setTransactions(getTransactions())
    setSuppliers(getSuppliers())
  }, [])

  // Calculate metrics
  const totalInventoryValue = materials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)

  const lowStockItems = materials.filter((m) => m.currentStock <= m.minStockLevel).length

  const recentTransactions = transactions.filter((t) =>
    isAfter(new Date(t.createdAt), startOfDay(subDays(new Date(), dateRange))),
  )

  const totalStockIn = recentTransactions.filter((t) => t.type === "in").reduce((sum, t) => sum + t.quantity, 0)

  const totalStockOut = recentTransactions.filter((t) => t.type === "out").reduce((sum, t) => sum + t.quantity, 0)

  // Top consumed materials
  const materialConsumption = materials.map((material) => {
    const consumed = transactions
      .filter((t) => t.materialId === material.id && t.type === "out")
      .reduce((sum, t) => sum + t.quantity, 0)
    return { material, consumed }
  })
  const topConsumed = materialConsumption.sort((a, b) => b.consumed - a.consumed).slice(0, 5)

  // Materials by category
  const categoryData = materials.reduce(
    (acc, m) => {
      const category = m.category
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 }
      }
      acc[category].count++
      acc[category].value += m.currentStock * m.unitPrice
      return acc
    },
    {} as Record<string, { count: number; value: number }>,
  )

  // Supplier performance
  const supplierData = suppliers.map((supplier) => {
    const suppliedMaterials = materials.filter((m) => m.supplierId === supplier.id)
    const totalValue = suppliedMaterials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)
    return { supplier, materialCount: suppliedMaterials.length, totalValue }
  })

  // Material-wise transaction details
  const materialTransactionDetails = materials.map((material) => {
    const matTransactions = transactions.filter((t) => t.materialId === material.id)
    const stockIn = matTransactions.filter((t) => t.type === "in").reduce((sum, t) => sum + t.quantity, 0)
    const stockOut = matTransactions.filter((t) => t.type === "out").reduce((sum, t) => sum + t.quantity, 0)
    const totalTransactions = matTransactions.length
    return {
      material,
      stockIn,
      stockOut,
      netMovement: stockIn - stockOut,
      totalTransactions,
      lastTransaction: matTransactions[0]?.createdAt,
    }
  })

  // Supplier-wise transaction details
  const supplierTransactionDetails = suppliers.map((supplier) => {
    const suppliedMaterials = materials.filter((m) => m.supplierId === supplier.id)
    const allTransactions = transactions.filter((t) => suppliedMaterials.some((m) => m.id === t.materialId))
    const stockIn = allTransactions.filter((t) => t.type === "in").reduce((sum, t) => sum + t.quantity, 0)
    const totalValue = suppliedMaterials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)
    return {
      supplier,
      materialCount: suppliedMaterials.length,
      stockIn,
      totalValue,
      transactionCount: allTransactions.length,
    }
  })

  // Recent stock movements
  const recentMovements = transactions.slice(0, 20).map((t) => {
    const material = materials.find((m) => m.id === t.materialId)
    const supplier = t.supplierId ? suppliers.find((s) => s.id === t.supplierId) : null
    return { transaction: t, material, supplier }
  })

  // Value analysis by material
  const valueAnalysis = materials
    .map((material) => {
      const stockValue = material.currentStock * material.unitPrice
      const maxValue = material.maxStockLevel * material.unitPrice
      const consumed = transactions
        .filter((t) => t.materialId === material.id && t.type === "out")
        .reduce((sum, t) => sum + t.quantity, 0)
      const consumedValue = consumed * material.unitPrice
      return {
        material,
        stockValue,
        maxValue,
        valueUtilization: (stockValue / maxValue) * 100,
        consumedValue,
      }
    })
    .sort((a, b) => b.stockValue - a.stockValue)

  // Consumption trends by category
  const categoryConsumption = materials.reduce(
    (acc, material) => {
      const category = material.category
      const consumed = transactions
        .filter((t) => t.materialId === material.id && t.type === "out")
        .reduce((sum, t) => sum + t.quantity, 0)
      const consumedValue = consumed * material.unitPrice

      if (!acc[category]) {
        acc[category] = { consumed: 0, consumedValue: 0, materials: 0 }
      }
      acc[category].consumed += consumed
      acc[category].consumedValue += consumedValue
      acc[category].materials++
      return acc
    },
    {} as Record<string, { consumed: number; consumedValue: number; materials: number }>,
  )

  // Cost analysis by material with procurement and consumption
  const costAnalysis = materials.map((material) => {
    const stockInTransactions = transactions.filter((t) => t.materialId === material.id && t.type === "in")
    const stockOutTransactions = transactions.filter((t) => t.materialId === material.id && t.type === "out")

    const totalProcured = stockInTransactions.reduce((sum, t) => sum + t.quantity, 0)
    const totalConsumed = stockOutTransactions.reduce((sum, t) => sum + t.quantity, 0)
    const procurementCost = totalProcured * material.unitPrice
    const consumptionCost = totalConsumed * material.unitPrice
    const currentStockValue = material.currentStock * material.unitPrice

    return {
      material,
      totalProcured,
      totalConsumed,
      procurementCost,
      consumptionCost,
      currentStockValue,
      averageCostPerUnit: material.unitPrice,
    }
  })

  // Procurement cost by supplier
  const procurementCostBySupplier = suppliers
    .map((supplier) => {
      const suppliedMaterials = materials.filter((m) => m.supplierId === supplier.id)
      const totalProcurementCost = suppliedMaterials.reduce((sum, material) => {
        const procured = transactions
          .filter((t) => t.materialId === material.id && t.type === "in")
          .reduce((s, t) => s + t.quantity, 0)
        return sum + procured * material.unitPrice
      }, 0)

      const totalCurrentValue = suppliedMaterials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)

      return {
        supplier,
        materialsSupplied: suppliedMaterials.length,
        totalProcurementCost,
        totalCurrentValue,
        costEfficiency: totalCurrentValue > 0 ? (totalCurrentValue / totalProcurementCost) * 100 : 0,
      }
    })
    .sort((a, b) => b.totalProcurementCost - a.totalProcurementCost)

  // Monthly consumption cost breakdown
  const consumptionCostByCategory = Object.entries(categoryConsumption)
    .map(([category, data]) => ({
      category,
      consumed: data.consumed,
      consumedValue: data.consumedValue,
      materials: data.materials,
      avgCostPerMaterial: data.consumedValue / data.materials,
    }))
    .sort((a, b) => b.consumedValue - a.consumedValue)

  // Total cost metrics
  const totalProcurementCost = costAnalysis.reduce((sum, c) => sum + c.procurementCost, 0)
  const totalConsumptionCost = costAnalysis.reduce((sum, c) => sum + c.consumptionCost, 0)
  const totalStockValue = costAnalysis.reduce((sum, c) => sum + c.currentStockValue, 0)

  // To fix the undeclared variable 'selectedView' error, we'll use 'selectedReport' instead.
  const selectedView = selectedReport

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory Value</CardTitle>
            <DollarSign className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all materials</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <Package className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Require reordering</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock In (Last {dateRange}d)</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalStockIn.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentTransactions.filter((t) => t.type === "in").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Out (Last {dateRange}d)</CardTitle>
            <TrendingDown className="w-4 h-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{totalStockOut.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentTransactions.filter((t) => t.type === "out").length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
        <div className="w-full sm:flex-1">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a report view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Overview</SelectItem>
              <SelectItem value="material_transactions">Material-wise Transactions</SelectItem>
              <SelectItem value="supplier_transactions">Supplier-wise Transactions</SelectItem>
              <SelectItem value="recent_movements">Recent Stock Movements</SelectItem>
              <SelectItem value="value_analysis">Inventory Value Analysis</SelectItem>
              <SelectItem value="consumption_trends">Consumption Trends by Category</SelectItem>
              <SelectItem value="supplier_comparison">Supplier Performance Comparison</SelectItem>
              <SelectItem value="low_stock_report">Low Stock & Reorder Report</SelectItem>
              <SelectItem value="cost_analysis">Complete Cost Analysis</SelectItem>
              <SelectItem value="procurement_cost">Procurement Cost by Supplier</SelectItem>
              <SelectItem value="consumption_cost">Consumption Cost by Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select value={String(dateRange)} onValueChange={(v) => setDateRange(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      {selectedView === "summary" && (
        <Tabs defaultValue="consumption" className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="consumption" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Top Consumed
            </TabsTrigger>
            <TabsTrigger value="category" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              By Category
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Inventory Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consumption" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Top Consumed Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topConsumed.map(({ material, consumed }, index) => (
                    <div key={material.id} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {consumed.toFixed(1)} {material.unit} consumed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-medium">
                          ₹{(consumed * material.unitPrice).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Total value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="category" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryData).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium capitalize">{category}</p>
                          <p className="text-sm text-muted-foreground">{data.count} materials</p>
                        </div>
                        <p className="text-foreground font-medium">₹{data.value.toLocaleString()}</p>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-primary"
                          style={{ width: `${(data.value / totalInventoryValue) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {((data.value / totalInventoryValue) * 100).toFixed(1)}% of total value
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Supplier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplierData
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .map(({ supplier, materialCount, totalValue }) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50"
                      >
                        <div>
                          <p className="text-foreground font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {materialCount} materials • Rating: {supplier.rating}/5
                          </p>
                        </div>
                        <p className="text-foreground font-medium">₹{totalValue.toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Current Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {materials.map((material) => {
                    const stockPercentage = (material.currentStock / material.maxStockLevel) * 100
                    const isLow = material.currentStock <= material.minStockLevel
                    return (
                      <div key={material.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-foreground font-medium">{material.name}</p>
                          <span className={`text-sm ${isLow ? "text-error" : "text-muted-foreground"}`}>
                            {material.currentStock.toFixed(1)} / {material.maxStockLevel} {material.unit}
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full ${isLow ? "bg-error" : stockPercentage > 80 ? "bg-success" : "bg-warning"}`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {selectedView === "material_transactions" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Material-wise Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Material</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Stock In</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Stock Out</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Net Movement</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Transactions</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {materialTransactionDetails.map(({ material, stockIn, stockOut, netMovement, totalTransactions }) => (
                    <tr key={material.id} className="border-b border-border/50">
                      <td className="p-3">
                        <div>
                          <p className="text-foreground font-medium">{material.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{material.category}</p>
                        </div>
                      </td>
                      <td className="text-right p-3 text-success">
                        +{stockIn.toFixed(1)} {material.unit}
                      </td>
                      <td className="text-right p-3 text-error">
                        -{stockOut.toFixed(1)} {material.unit}
                      </td>
                      <td className="text-right p-3">
                        <span className={netMovement >= 0 ? "text-success" : "text-error"}>
                          {netMovement >= 0 ? "+" : ""}
                          {netMovement.toFixed(1)} {material.unit}
                        </span>
                      </td>
                      <td className="text-right p-3 text-muted-foreground">{totalTransactions}</td>
                      <td className="text-right p-3 text-foreground font-medium">
                        {material.currentStock.toFixed(1)} {material.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "supplier_transactions" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Supplier-wise Transaction Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Supplier</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Contact</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Rating</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Materials Supplied</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Total Stock In</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Transactions</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Inventory Value</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierTransactionDetails.map(
                    ({ supplier, materialCount, stockIn, totalValue, transactionCount }) => (
                      <tr key={supplier.id} className="border-b border-border/50">
                        <td className="p-3">
                          <p className="text-foreground font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.email}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{supplier.phone}</td>
                        <td className="text-right p-3 text-warning">{supplier.rating.toFixed(1)} ⭐</td>
                        <td className="text-right p-3 text-muted-foreground">{materialCount}</td>
                        <td className="text-right p-3 text-success">{stockIn.toFixed(1)}</td>
                        <td className="text-right p-3 text-muted-foreground">{transactionCount}</td>
                        <td className="text-right p-3 font-medium text-foreground">₹{totalValue.toLocaleString()}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "recent_movements" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Date & Time</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Reference</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Material</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Quantity</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Supplier</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map(({ transaction, material, supplier }) => (
                    <tr key={transaction.id} className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground text-xs">
                        {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs font-mono">{transaction.reference}</td>
                      <td className="p-3 text-foreground">{material?.name || "Unknown"}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            transaction.type === "in" ? "bg-success/20 text-success" : "bg-error/20 text-error"
                          }`}
                        >
                          {transaction.type === "in" ? "Stock In" : "Stock Out"}
                        </span>
                      </td>
                      <td
                        className={`text-right p-3 font-medium ${
                          transaction.type === "in" ? "text-success" : "text-error"
                        }`}
                      >
                        {transaction.type === "in" ? "+" : "-"}
                        {transaction.quantity.toFixed(1)} {material?.unit}
                      </td>
                      <td className="p-3 text-muted-foreground">{supplier?.name || "-"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{transaction.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "value_analysis" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Inventory Value Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Material</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Unit Price</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Current Stock</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Stock Value</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Max Capacity Value</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Value Utilization</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Total Consumed Value</th>
                  </tr>
                </thead>
                <tbody>
                  {valueAnalysis.map(({ material, stockValue, maxValue, valueUtilization, consumedValue }) => (
                    <tr key={material.id} className="border-b border-border/50">
                      <td className="p-3 text-foreground font-medium">{material.name}</td>
                      <td className="text-right p-3 text-muted-foreground">₹{material.unitPrice.toLocaleString()}</td>
                      <td className="text-right p-3 text-foreground">
                        {material.currentStock.toFixed(1)} {material.unit}
                      </td>
                      <td className="text-right p-3 font-medium text-foreground">₹{stockValue.toLocaleString()}</td>
                      <td className="text-right p-3 text-muted-foreground">₹{maxValue.toLocaleString()}</td>
                      <td className="text-right p-3">
                        <span
                          className={`font-medium ${
                            valueUtilization < 30
                              ? "text-error"
                              : valueUtilization < 70
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {valueUtilization.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right p-3 font-medium text-warning">₹{consumedValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "consumption_trends" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Consumption Trends by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Materials Count</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Total Consumed</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Consumed Value</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Avg per Material</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(categoryConsumption)
                    .sort((a, b) => b[1].consumedValue - a[1].consumedValue)
                    .map(([category, data]) => {
                      const totalConsumedValue = Object.values(categoryConsumption).reduce(
                        (sum, c) => sum + c.consumedValue,
                        0,
                      )
                      const percentage = (data.consumedValue / totalConsumedValue) * 100
                      return (
                        <tr key={category} className="border-b border-border/50">
                          <td className="p-3 text-foreground font-medium capitalize">{category}</td>
                          <td className="text-right p-3 text-muted-foreground">{data.materials}</td>
                          <td className="text-right p-3 text-foreground">{data.consumed.toFixed(1)}</td>
                          <td className="text-right p-3 font-medium text-foreground">
                            ₹{data.consumedValue.toLocaleString()}
                          </td>
                          <td className="text-right p-3 text-muted-foreground">
                            ₹{(data.consumedValue / data.materials).toLocaleString()}
                          </td>
                          <td className="text-right p-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                                percentage >= 40
                                  ? "bg-error/20 text-error"
                                  : percentage >= 20
                                    ? "bg-warning/20 text-warning"
                                    : "bg-success/20 text-success"
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "supplier_comparison" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Supplier Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Supplier</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Rating</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Materials</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Avg Price/Unit</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Current Inventory Value</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Performance Score</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers
                    .map((supplier) => {
                      const suppliedMaterials = materials.filter((m) => m.supplierId === supplier.id)
                      const totalValue = suppliedMaterials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0)
                      const avgPrice =
                        suppliedMaterials.reduce((sum, m) => sum + m.unitPrice, 0) / suppliedMaterials.length || 0
                      const performanceScore = (supplier.rating / 5) * 100
                      return {
                        supplier,
                        materialCount: suppliedMaterials.length,
                        totalValue,
                        avgPrice,
                        performanceScore,
                      }
                    })
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .map(({ supplier, materialCount, totalValue, avgPrice, performanceScore }) => (
                      <tr key={supplier.id} className="border-b border-border/50">
                        <td className="p-3">
                          <div>
                            <p className="text-foreground font-medium">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">{supplier.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-warning font-medium">{supplier.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-xs">/ 5.0</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              supplier.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"
                            }`}
                          >
                            {supplier.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-right p-3 text-foreground">{materialCount}</td>
                        <td className="text-right p-3 text-muted-foreground">₹{avgPrice.toLocaleString()}</td>
                        <td className="text-right p-3 font-medium text-foreground">₹{totalValue.toLocaleString()}</td>
                        <td className="text-right p-3">
                          <span
                            className={`font-medium ${
                              performanceScore >= 80
                                ? "text-success"
                                : performanceScore >= 60
                                  ? "text-warning"
                                  : "text-error"
                            }`}
                          >
                            {performanceScore.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "low_stock_report" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Low Stock & Reorder Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Material</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Current Stock</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Min Level</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Max Level</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Reorder Qty</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Supplier</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Reorder Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {materials
                    .filter((m) => m.currentStock <= m.minStockLevel * 1.2) // Show materials at or near minimum
                    .sort((a, b) => a.currentStock / a.minStockLevel - b.currentStock / b.minStockLevel)
                    .map((material) => {
                      const supplier = suppliers.find((s) => s.id === material.supplierId)
                      const reorderQty = material.maxStockLevel - material.currentStock
                      const reorderCost = reorderQty * material.unitPrice
                      const urgency =
                        material.currentStock === 0
                          ? "Critical"
                          : material.currentStock <= material.minStockLevel * 0.5
                            ? "Urgent"
                            : "Low"
                      return (
                        <tr key={material.id} className="border-b border-border/50">
                          <td className="p-3 text-foreground font-medium">{material.name}</td>
                          <td className="p-3 text-muted-foreground capitalize">{material.category}</td>
                          <td className="text-right p-3 font-medium text-error">
                            {material.currentStock.toFixed(1)} {material.unit}
                          </td>
                          <td className="text-right p-3 text-muted-foreground">
                            {material.minStockLevel} {material.unit}
                          </td>
                          <td className="text-right p-3 text-muted-foreground">
                            {material.maxStockLevel} {material.unit}
                          </td>
                          <td className="text-right p-3 font-medium text-success">
                            {reorderQty.toFixed(1)} {material.unit}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                urgency === "Critical"
                                  ? "bg-error/20 text-error"
                                  : urgency === "Urgent"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {urgency}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">{supplier?.name || "Unknown"}</td>
                          <td className="text-right p-3 font-medium text-foreground">
                            ₹{reorderCost.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Reorder Cost:</span>
                  <span className="text-foreground text-xl font-bold">
                    ₹
                    {materials
                      .filter((m) => m.currentStock <= m.minStockLevel * 1.2)
                      .reduce((sum, m) => sum + (m.maxStockLevel - m.currentStock) * m.unitPrice, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "cost_analysis" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Complete Cost Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Comprehensive procurement vs consumption cost breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Procurement Cost</p>
                <p className="text-2xl font-bold text-success">₹{totalProcurementCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All-time purchases</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Consumption Cost</p>
                <p className="text-2xl font-bold text-error">₹{totalConsumptionCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All-time usage</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Current Stock Value</p>
                <p className="text-2xl font-bold text-warning">₹{totalStockValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalStockValue / totalProcurementCost) * 100).toFixed(1)}% of procurement
                </p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-muted-foreground font-medium whitespace-nowrap">Material</th>
                        <th className="text-left p-3 text-muted-foreground font-medium whitespace-nowrap">Category</th>
                        <th className="text-right p-3 text-muted-foreground font-medium whitespace-nowrap">
                          Unit Price
                        </th>
                        <th className="text-right p-3 text-muted-foreground font-medium whitespace-nowrap">Procured</th>
                        <th className="text-right p-3 text-muted-foreground font-medium whitespace-nowrap">P. Cost</th>
                        <th className="text-right p-3 text-muted-foreground font-medium whitespace-nowrap">Consumed</th>
                        <th className="text-right p-3 text-muted-foreground font-medium whitespace-nowrap">C. Cost</th>
                        <th className="text-right p-3 text-muted-foreground font-medium whitespace-nowrap">
                          Stock Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costAnalysis
                        .sort((a, b) => b.procurementCost - a.procurementCost)
                        .map(
                          ({
                            material,
                            totalProcured,
                            totalConsumed,
                            procurementCost,
                            consumptionCost,
                            currentStockValue,
                            averageCostPerUnit,
                          }) => (
                            <tr key={material.id} className="border-b border-border/50">
                              <td className="p-3 text-foreground font-medium">{material.name}</td>
                              <td className="p-3 text-muted-foreground capitalize">{material.category}</td>
                              <td className="text-right p-3 text-muted-foreground whitespace-nowrap">
                                ₹{averageCostPerUnit.toLocaleString()}
                              </td>
                              <td className="text-right p-3 text-foreground whitespace-nowrap">
                                {totalProcured.toFixed(1)} {material.unit}
                              </td>
                              <td className="text-right p-3 font-medium text-success whitespace-nowrap">
                                ₹{procurementCost.toLocaleString()}
                              </td>
                              <td className="text-right p-3 text-foreground whitespace-nowrap">
                                {totalConsumed.toFixed(1)} {material.unit}
                              </td>
                              <td className="text-right p-3 font-medium text-error whitespace-nowrap">
                                ₹{consumptionCost.toLocaleString()}
                              </td>
                              <td className="text-right p-3 font-medium text-warning whitespace-nowrap">
                                ₹{currentStockValue.toLocaleString()}
                              </td>
                            </tr>
                          ),
                        )}
                      <tr className="border-t-2 border-muted font-bold">
                        <td className="p-3 text-foreground" colSpan={4}>
                          TOTAL
                        </td>
                        <td className="text-right p-3 text-success text-lg whitespace-nowrap">
                          ₹{totalProcurementCost.toLocaleString()}
                        </td>
                        <td className="p-3"></td>
                        <td className="text-right p-3 text-error text-lg whitespace-nowrap">
                          ₹{totalConsumptionCost.toLocaleString()}
                        </td>
                        <td className="text-right p-3 text-warning text-lg whitespace-nowrap">
                          ₹{totalStockValue.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "procurement_cost" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Procurement Cost Analysis by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Supplier</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Contact</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Materials Supplied</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Total Procurement Cost</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Current Stock Value</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Rating</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Value Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {procurementCostBySupplier.map(
                    ({ supplier, materialsSupplied, totalProcurementCost, totalCurrentValue, costEfficiency }) => (
                      <tr key={supplier.id} className="border-b border-border/50">
                        <td className="p-3">
                          <p className="text-foreground font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.email}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{supplier.phone}</td>
                        <td className="text-right p-3 text-foreground font-medium">{materialsSupplied}</td>
                        <td className="text-right p-3 font-medium text-success text-lg">
                          ₹{totalProcurementCost.toLocaleString()}
                        </td>
                        <td className="text-right p-3 font-medium text-warning">
                          ₹{totalCurrentValue.toLocaleString()}
                        </td>
                        <td className="text-right p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-warning/20 text-warning text-sm font-medium">
                            {supplier.rating.toFixed(1)} ⭐
                          </span>
                        </td>
                        <td className="text-right p-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                              costEfficiency >= 80
                                ? "bg-success/20 text-success"
                                : costEfficiency >= 50
                                  ? "bg-warning/20 text-warning"
                                  : "bg-error/20 text-error"
                            }`}
                          >
                            {costEfficiency.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                  <tr className="border-t-2 border-muted font-bold">
                    <td className="p-3 text-foreground" colSpan={3}>
                      TOTAL
                    </td>
                    <td className="text-right p-3 text-success text-xl">
                      ₹{procurementCostBySupplier.reduce((sum, s) => sum + s.totalProcurementCost, 0).toLocaleString()}
                    </td>
                    <td className="text-right p-3 text-warning text-xl">
                      ₹{procurementCostBySupplier.reduce((sum, s) => sum + s.totalCurrentValue, 0).toLocaleString()}
                    </td>
                    <td className="p-3" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === "consumption_cost" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Consumption Cost Analysis by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Category Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {consumptionCostByCategory.map(({ category, consumedValue }) => {
                const percentage = (consumedValue / totalConsumptionCost) * 100
                return (
                  <div key={category} className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1 capitalize">{category}</p>
                    <p className="text-xl font-bold text-foreground">₹{consumedValue.toLocaleString()}</p>
                    <div className="mt-2 relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="absolute h-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of total</p>
                  </div>
                )
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Materials</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Total Consumed</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Consumption Cost</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Avg Cost/Material</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionCostByCategory.map(
                    ({ category, materials, consumed, consumedValue, avgCostPerMaterial }) => {
                      const percentage = (consumedValue / totalConsumptionCost) * 100
                      return (
                        <tr key={category} className="border-b border-border/50">
                          <td className="p-3 text-foreground font-medium capitalize">{category}</td>
                          <td className="text-right p-3 text-muted-foreground">{materials}</td>
                          <td className="text-right p-3 text-foreground">{consumed.toFixed(1)}</td>
                          <td className="text-right p-3 font-medium text-error text-lg">
                            ₹{consumedValue.toLocaleString()}
                          </td>
                          <td className="text-right p-3 text-muted-foreground">
                            ₹{avgCostPerMaterial.toLocaleString()}
                          </td>
                          <td className="text-right p-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                                percentage >= 40
                                  ? "bg-error/20 text-error"
                                  : percentage >= 20
                                    ? "bg-warning/20 text-warning"
                                    : "bg-success/20 text-success"
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    },
                  )}
                  <tr className="border-t-2 border-muted font-bold">
                    <td className="p-3 text-foreground">TOTAL</td>
                    <td className="text-right p-3 text-foreground">
                      {consumptionCostByCategory.reduce((sum, c) => sum + c.materials, 0)}
                    </td>
                    <td className="p-3"></td>
                    <td className="text-right p-3 text-error text-xl">₹{totalConsumptionCost.toLocaleString()}</td>
                    <td className="p-3" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed breakdown by material within each category */}
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Material-wise Breakdown by Category</h3>
              {consumptionCostByCategory.map(({ category }) => {
                const categoryMaterials = costAnalysis.filter((c) => c.material.category === category)
                const categoryTotal = categoryMaterials.reduce((sum, c) => sum + c.consumptionCost, 0)

                return (
                  <Card key={category} className="border-border bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-foreground capitalize">
                        {category} - ₹{categoryTotal.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryMaterials
                          .sort((a, b) => b.consumptionCost - a.consumptionCost)
                          .map(({ material, totalConsumed, consumptionCost }) => {
                            const matPercentage = (consumptionCost / categoryTotal) * 100
                            return (
                              <div key={material.id} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-foreground font-medium">{material.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {totalConsumed.toFixed(1)} {material.unit} @ ₹{material.unitPrice.toLocaleString()}/
                                    {material.unit}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-foreground font-medium">₹{consumptionCost.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {matPercentage.toFixed(1)}% of category
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
