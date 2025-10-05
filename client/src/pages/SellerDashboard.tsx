import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag, LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: seller } = useQuery({
    queryKey: ["/api/sellers/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/seller", seller?.id],
    enabled: !!seller?.id,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/seller", seller?.id],
    enabled: !!seller?.id,
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/seller"] });
      toast({ title: "Success", description: "Product added successfully" });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const productData = {
      seller_id: seller?.id,
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      price: parseFloat(formData.get("price") as string),
      unit: formData.get("unit") as string,
      stock: parseInt(formData.get("stock") as string),
      min_qty: parseInt(formData.get("min_qty") as string) || 1,
      description: formData.get("description") as string,
      is_active: true,
    };

    createProductMutation.mutate(productData);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (!seller) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Seller Dashboard
            </h1>
            <Button variant="outline" onClick={handleSignOut} data-testid="button-signout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Products</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:bg-gradient-primary-hover" data-testid="button-add-product">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <Label>Product Title *</Label>
                      <Input name="title" required data-testid="input-product-title" />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bricks">Bricks</SelectItem>
                          <SelectItem value="cement">Cement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price (₹) *</Label>
                        <Input name="price" type="number" step="0.01" required data-testid="input-product-price" />
                      </div>
                      <div>
                        <Label>Unit *</Label>
                        <Input name="unit" placeholder="e.g., piece, bag" required data-testid="input-product-unit" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stock *</Label>
                        <Input name="stock" type="number" required data-testid="input-product-stock" />
                      </div>
                      <div>
                        <Label>Min Quantity</Label>
                        <Input name="min_qty" type="number" defaultValue="1" data-testid="input-product-minqty" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" rows={3} data-testid="input-product-description" />
                    </div>
                    <Button type="submit" className="w-full" disabled={createProductMutation.isPending} data-testid="button-submit-product">
                      {createProductMutation.isPending ? "Adding..." : "Add Product"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product: any) => (
                  <Card key={product.id} data-testid={`card-product-${product.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{product.title}</CardTitle>
                        <Badge>{product.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-semibold">₹{product.price} / {product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock</span>
                          <span>{product.stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-semibold">Incoming Orders</h2>
            {ordersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <Badge>{formatStatus(order.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Items:</span>
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="ml-4">
                              {item.title} × {item.quantity}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-semibold">₹{order.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment</span>
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
