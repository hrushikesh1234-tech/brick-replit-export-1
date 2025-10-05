import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Building2, Shield } from "lucide-react";
import { apiRequest } from "@lib/queryClient";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"customer" | "seller" | "admin">("customer");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const shopName = mode === "seller" ? (formData.get("shopName") as string) : undefined;

    try {
      await signUp(email, password, phone, name, mode);

      if (mode === "seller" && shopName) {
        try {
          await apiRequest("/api/sellers", {
            method: "POST",
            body: JSON.stringify({
              user_id: user?.id,
              shop_name: shopName,
            }),
          });
        } catch (sellerError) {
          console.error("Error creating seller profile:", sellerError);
        }
      }

      toast({
        title: "Success!",
        description: "Account created successfully.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn(email, password);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BuildKart
            </h1>
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              variant={mode === "customer" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("customer")}
              className="gap-2"
              data-testid="button-mode-customer"
            >
              <ShoppingBag className="h-4 w-4" />
              Customer
            </Button>
            <Button
              variant={mode === "seller" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("seller")}
              className="gap-2"
              data-testid="button-mode-seller"
            >
              <Building2 className="h-4 w-4" />
              Seller
            </Button>
            <Button
              variant={mode === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("admin")}
              className="gap-2"
              data-testid="button-mode-admin"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" required data-testid="input-signin-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" required data-testid="input-signin-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-signin-submit">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" name="name" type="text" required data-testid="input-signup-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone</Label>
                  <Input id="signup-phone" name="phone" type="tel" required data-testid="input-signup-phone" />
                </div>
                {mode === "seller" && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-shopname">Shop Name</Label>
                    <Input id="signup-shopname" name="shopName" type="text" required data-testid="input-signup-shopname" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required data-testid="input-signup-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" required data-testid="input-signup-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-signup-submit">
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
