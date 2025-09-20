import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    // We could add: await apiClient.post('/auth/logout');
    logout();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-start gap-4 px-4 py-4">
          <h1 className="text-xl font-bold self-start border-b pb-2 w-full">Testwise</h1>
          <NavLink
            to="/dashboard/tests"
            className={({ isActive }) =>
              `w-full text-left px-3 py-2 rounded-lg transition-all ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary'
              }`
            }
          >
            My Tests
          </NavLink>
          {/* Add more links here in the future */}
        </nav>
        <div className="mt-auto p-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
        </div>
      </aside>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:ml-60">
        {/* Child routes will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}