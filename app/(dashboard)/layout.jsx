import { AuthProvider } from "../../components/auth-provider";

function DashboardLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default DashboardLayout;
