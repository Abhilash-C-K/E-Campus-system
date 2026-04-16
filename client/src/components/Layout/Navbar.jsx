import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Bell, LogOut } from 'lucide-react';
import ProfileModal from '../ProfileModal';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <div style={{
                        width: 36, height: 36, background: 'rgba(255,255,255,0.15)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FileText size={18} color="white" />
                    </div>
                    <div>
                        <div className="navbar-brand-name">E-Approval System</div>
                        <div className="navbar-brand-sub">College of Engineering, Thalassery</div>
                    </div>
                </div>

                <div className="navbar-right">
                    <Bell size={18} color="rgba(255,255,255,0.7)" style={{ cursor: 'pointer' }} />
                    <div style={{ textAlign: 'right' }}>
                        <div className="navbar-user-name">{user?.name}</div>
                        <div className="navbar-role">{formatRole(user?.role)}</div>
                    </div>

                    {/* Clickable avatar */}
                    <div
                        className="avatar avatar-clickable"
                        onClick={() => setProfileOpen(true)}
                        title="Edit Profile"
                        id="navbar-profile-btn"
                    >
                        {initials}
                    </div>

                    <LogOut
                        size={18}
                        color="rgba(255,255,255,0.7)"
                        style={{ cursor: 'pointer' }}
                        onClick={handleLogout}
                    />
                </div>
            </nav>

            <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
}

function formatRole(role) {
    const map = {
        student: 'Student',
        tutor: 'Class Tutor',
        nodal_officer: 'Nodal Officer',
        faculty_coordinator: 'Faculty Coordinator',
        hod: 'Head of Department',
        principal: 'Principal',
    };
    return map[role] || role;
}
