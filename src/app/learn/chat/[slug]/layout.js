import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function Layout({children}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <Sidebar>{children}</Sidebar>
    </ProtectedRoute>
  );
}
