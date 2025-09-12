import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRouteChange } from "@/hooks/useRouteChange";
import PageLoader from "@/components/PageLoader";

const Home = lazy(() => import("@/pages/home"));
const Ranking = lazy(() => import("@/pages/ranking"));
const History = lazy(() => import("@/pages/history"));
const Attendants = lazy(() => import("@/pages/attendants"));
const Goals = lazy(() => import("@/pages/goals"));
const Admin = lazy(() => import("@/pages/admin"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SoundTest = lazy(() => import("@/pages/sound-test"));
const Clients = lazy(() => import("@/pages/clients"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  useRouteChange(); // Garante refresh adequado entre rotas
  
  return (
    <Suspense fallback={<PageLoader message="Carregando página..." />}> 
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/ranking" component={Ranking} />
        <Route path="/history" component={History} />
        <Route path="/attendants" component={Attendants} />
        <Route path="/goals" component={Goals} />
        <Route path="/clients" component={Clients} />
        <Route path="/admin" component={Admin} />
        <Route path="/sound-test" component={SoundTest} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
