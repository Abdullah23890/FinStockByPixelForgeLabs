import "../Css/Sidebar.css";
import { IconLogout, IconMenu } from "./Icons";
import { useAuth } from "../Context/AuthContext";

export default function Sidebar({
  brand,
  menuItems = [],
  activeId,
  onSelect,
  isOpen,
  onToggle,
}) {
  const { user, logout } = useAuth();

  return (
    <>
      <button className="pfl-sidebar-trigger" onClick={onToggle} aria-label="Toggle menu">
        <IconMenu />
      </button>

      {isOpen && <div className="pfl-sidebar-backdrop" onClick={onToggle} />}

      <aside className={`pfl-sidebar ${isOpen ? "pfl-sidebar--open" : ""}`}>
        <div className="pfl-sidebar__brand">
          <div className="pfl-sidebar__brand-text">
            <span className="pfl-sidebar__brand-name">{brand?.name}</span>
            <span className="pfl-sidebar__brand-tagline">{brand?.tagline}</span>
          </div>
        </div>

        <nav className="pfl-sidebar__nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                className={`pfl-sidebar__item ${isActive ? "pfl-sidebar__item--active" : ""}`}
                onClick={() => onSelect?.(item.id)}
              >
                <span className="pfl-sidebar__item-indicator" />
                {Icon && (
                  <span className="pfl-sidebar__item-icon">
                    <Icon size={18} />
                  </span>
                )}
                <span className="pfl-sidebar__item-label">{item.label}</span>
                {item.badge != null && (
                  <span className="pfl-sidebar__item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pfl-sidebar__footer">
          <div className="pfl-sidebar__user">
            <span className="pfl-sidebar__avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || "User"} />
              ) : (
                (user?.name || "U").charAt(0).toUpperCase()
              )}
            </span>
            <span className="pfl-sidebar__user-text">
              <span className="pfl-sidebar__user-name">{user?.name}</span>
              <span className="pfl-sidebar__user-role">{user?.role}</span>
            </span>
          </div>
          <button className="pfl-sidebar__logout" onClick={logout} aria-label="Log out">
            <IconLogout size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}