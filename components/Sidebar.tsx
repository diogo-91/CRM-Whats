import { useAuth } from '../context/AuthContext';

// ...

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  const { logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // ...

  // Logout Button
  <div className="mt-auto pt-4 border-t border-gray-800">
    <button
      onClick={logout}
      className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors group"
    >
      <LogOut size={20} className="group-hover:text-red-500" />
      <span className="font-medium">Sair</span>
    </button>
  </div>
      </div >
    </>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
        ? 'bg-[#00A884] text-white shadow-lg shadow-emerald-900/50'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
};

export default Sidebar;