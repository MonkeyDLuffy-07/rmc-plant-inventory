"use client"

// app/dashboard/page.tsx (example)
import { getMaterials, getTransactions } from "@/lib/storage";
import { DashboardOverview } from "@/components/dashboard-overview";

export default async function DashboardPage() {
  const materials = await getMaterials();
  const transactions = await getTransactions();

  return (
    <DashboardOverview
      materials={materials}
      transactions={transactions}
    />
  );
}


  useEffect(() => {
  if (!materials || !Array.isArray(materials)) return;
  if (!transactions || !Array.isArray(transactions)) return;

  const today = new Date().toDateString();

  const todayTransactions =
    transactions.filter(
      (t) => new Date(t.createdAt).toDateString() === today,
    ).length;

  setStats({
    totalMaterials: materials.length,
    totalTransactions: transactions.length,
    todayTransactions,
    // ...rest of your stats
  });
}, [materials, transactions]);


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Materials</CardTitle>
          <Package className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.totalMaterials}</div>
          <p className="text-xs text-muted-foreground mt-1">Active inventory items</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
          <AlertTriangle className="w-4 h-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.lowStockItems}</div>
          <p className="text-xs text-muted-foreground mt-1">Require attention</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Transactions</CardTitle>
          <TrendingDown className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.todayTransactions}</div>
          <p className="text-xs text-muted-foreground mt-1">Transactions recorded</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Suppliers</CardTitle>
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.activeSuppliers}</div>
          <p className="text-xs text-muted-foreground mt-1">Registered suppliers</p>
        </CardContent>
      </Card>
    </div>
  )
}
