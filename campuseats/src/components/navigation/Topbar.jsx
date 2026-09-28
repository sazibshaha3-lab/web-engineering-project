import { Menu, Bell } from "lucide-react";
import IconButton from "../common/IconButton";
import Avatar from "../common/Avatar";
import Dropdown from "../feedback/Dropdown";
import { LogOut, Settings, User } from "lucide-react";
import "./Topbar.css";

export default function Topbar({ title, onMenuClick, userName = "Account" }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="topbar__title">{title}</h1>
      </div>
      <div className="topbar__right">
        <IconButton icon={Bell} label="Notifications" variant="surface" badge={3} />
        <Dropdown
          align="right"
          trigger={<Avatar name={userName} size="sm" />}
          items={[
            { label: "Profile", icon: User },
            { label: "Settings", icon: Settings },
            { label: "Log out", icon: LogOut, danger: true },
          ]}
        />
      </div>
    </header>
  );
}
