import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home as House, Calendar, ClipboardList as ClipboardText, MessageCircle as ChatCircle } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
      
      {/* Bottom Navigation */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '80px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        zIndex: 50
      }}>
        <NavItem to="/home" icon={<House size={24} />} label="홈" />
        <NavItem to="/schedule" icon={<Calendar size={24} />} label="일정" />
        <NavItem to="/task" icon={<ClipboardText size={24} />} label="미션" />
        <NavItem to="/event" icon={<ChatCircle size={24} />} label="이벤트" badge="1" />
      </nav>
    </>
  );
};

const NavItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        color: isActive ? 'var(--primary-light)' : '#94a3b8',
        transition: 'all 0.2s ease',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        padding: '0.5rem'
      })}
    >
      <div style={{ marginBottom: '4px', position: 'relative' }}>
        {icon}
        {badge && <span className="notification-dot" style={{ height: '14px', minWidth: '14px', fontSize: '0.55rem', right: '-8px', top: '-8px' }}>{badge}</span>}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>
    </NavLink>
  );
};

export default Layout;
