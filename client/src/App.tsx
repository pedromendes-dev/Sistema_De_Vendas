import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRouteChange } from "@/hooks/useRouteChange";
import Home from "@/pages/home";
import Ranking from "@/pages/ranking";
import History from "@/pages/history";
import Attendants from "@/pages/attendants";
import Goals from "@/pages/goals";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import SoundTest from "@/pages/sound-test";
import Search from "@/pages/search";
import NotFound from "@/pages/not-found";

function Router() {
  useRouteChange(); // Garante refresh adequado entre rotas
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/ranking" component={Ranking} />
      <Route path="/history" component={History} />
      <Route path="/attendants" component={Attendants} />
      <Route path="/goals" component={Goals} />
      <Route path="/admin" component={Admin} />
      <Route path="/sound-test" component={SoundTest} />
      <Route path="/search" component={Search} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
