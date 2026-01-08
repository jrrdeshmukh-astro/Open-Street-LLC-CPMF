import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Brochure from "@/pages/Brochure";
import Dashboard from "@/pages/Dashboard";
import AdminView from "@/pages/AdminView";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminView from "@/pages/AdminView";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/brochure" component={Brochure} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminView} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin/public-view" component={AdminView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
