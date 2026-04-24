import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ProfileProvider } from "./contexts/ProfileContext.tsx";
import Index from "./pages/Index.tsx";
import InstructorSearch from "./pages/InstructorSearch.tsx";
import JobSearch from "./pages/JobSearch.tsx";
import AcademySearch from "./pages/AcademySearch.tsx";
import FeedSearch from "./pages/FeedSearch.tsx";
import NotFound from "./pages/NotFound.tsx";
import StudioSearch from "./pages/StudioSearch.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import TeacherDetail from "./pages/TeacherDetail.tsx";
import StudioDetail from "./pages/StudioDetail.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <ProfileProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/instructors" element={<InstructorSearch />} />
          <Route path="/jobs" element={<JobSearch />} />
          <Route path="/academies" element={<AcademySearch />} />
          <Route path="/feed" element={<FeedSearch />} />
          <Route path="/studios" element={<StudioSearch />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/teachers/:id" element={<TeacherDetail />} />
          <Route path="/studios/:id" element={<StudioDetail />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
