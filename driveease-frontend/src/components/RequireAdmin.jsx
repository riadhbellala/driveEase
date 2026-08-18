import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function RequireAdmin({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'agency_owner' || profile?.role === 'agency_staff') {
        setIsAdmin(true);
      }
      
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Verifying permissions...</div>;
  }

  // If they are not admin (or not logged in), redirect them.
  // RequireAuth (which will wrap this) handles kicking unauthenticated users to /login,
  // so this redirect usually applies to logged-in non-admins.
  if (!isAdmin) {
    return <Navigate to="/cars" replace />;
  }

  return children ? children : <Outlet />;
}
