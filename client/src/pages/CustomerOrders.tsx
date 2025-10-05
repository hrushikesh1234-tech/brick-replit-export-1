import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";

interface Order {
  id: string;
  items: any;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  delivery_address: any;
}

const statusColors: Record<string, string> = {
  created: "bg-blue-100 text-blue-800",
  pending_verification: "bg-yellow-100 text-yellow-800",
  seller_contacted: "bg-orange-100 text-orange-800",
  seller_accepted: "bg-green-100 text-green-800",
  seller_rejected: "bg-red-100 text-red-800",
  confirmed: "bg-green-100 text-green-800",
  out_for_delivery: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/customer", user?.id],
    enabled: !!user?.id,
  });

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">No orders yet</p>
              <Button onClick={() => navigate("/")} data-testid="button-start-shopping">Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" data-testid={`text-order-id-${order.id}`}>
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"} data-testid={`badge-status-${order.id}`}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm" data-testid={`text-item-${order.id}-${idx}`}>
                            <span>
                              {item.title} × {item.quantity} {item.unit}
                            </span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span data-testid={`text-total-${order.id}`}>₹{order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>Payment Method</span>
                        <span data-testid={`text-payment-method-${order.id}`}>{order.payment_method.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Payment Status</span>
                        <span className="capitalize" data-testid={`text-payment-status-${order.id}`}>{order.payment_status.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2 text-sm">Delivery Address</h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-address-${order.id}`}>
                        {order.delivery_address.line1}
                        {order.delivery_address.line2 && `, ${order.delivery_address.line2}`}
                        <br />
                        {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pinCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
