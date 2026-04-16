import { useState, useEffect, useRef } from 'react';
import { X, User, Lock, Save, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DEPTS = ['CS1', 'CS2', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ECS'];
const CATEGORIES = ['Merit', 'TFW', 'Management', 'NRI', 'Non-KEAM'];
const ADMISSIONS = ['Regular', 'Lateral Entry', 'Spot'];
const CLUBS = ['IEDC', 'IEEE', 'MuLEARN', 'TinkerHub', 'Others'];

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

export default function ProfileModal({ open, onClose }) {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('profile'); // 'profile' | 'password'
    const [form, setForm] = useState({});
    const [pwForm, setPwForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [sigFile, setSigFile] = useState(null);
    const sigInputRef = useRef();

    // Populate form when user data loads or modal opens
    useEffect(() => {
        if (user && open) {
            setForm({
                name: user.name || '',
                department: user.department || '',
                yearOfStudy: user.yearOfStudy || '1',
                yearOfAdmission: user.yearOfAdmission || new Date().getFullYear(),
                category: user.category || 'Merit',
                typeOfAdmission: user.typeOfAdmission || 'Regular',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                parentName: user.parentName || '',
                isHostler: user.isHostler || false,
                hostelName: user.hostelName || '',
                staffId: user.staffId || '',
                assignedClubs: user.assignedClubs || [],
                assignedYear: user.assignedYear || '',
            });
            setError('');
            setSuccess('');
            setSigFile(null);
            setTab('profile');
        }
    }, [user, open]);

    if (!open || !user) return null;

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

    const toggleClub = (club) => {
        set('assignedClubs',
            form.assignedClubs.includes(club)
                ? form.assignedClubs.filter(c => c !== club)
                : [...form.assignedClubs, club]
        );
    };

    const handleSaveProfile = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'assignedClubs') formData.append(k, JSON.stringify(v));
                else formData.append(k, v);
            });
            if (sigFile) formData.append('signature', sigFile);

            const res = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateUser(res.data.user);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleSavePassword = async () => {
        setError('');
        setSuccess('');
        if (pwForm.password !== pwForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (pwForm.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/profile', {
                currentPassword: pwForm.currentPassword,
                password: pwForm.password,
            });
            setSuccess('Password changed successfully!');
            setPwForm({ currentPassword: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <>
            {/* Backdrop */}
            <div className="profile-modal-backdrop" onClick={onClose} />

            {/* Drawer */}
            <div className="profile-modal-drawer">
                {/* Header */}
                <div className="profile-modal-header">
                    <div className="profile-modal-header-info">
                        <div className="profile-modal-avatar">{initials}</div>
                        <div>
                            <div className="profile-modal-title">{user.name}</div>
                            <div className="profile-modal-subtitle">{formatRole(user.role)} · {user.email}</div>
                        </div>
                    </div>
                    <button className="profile-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="profile-modal-tabs">
                    <button
                        className={`profile-modal-tab ${tab === 'profile' ? 'active' : ''}`}
                        onClick={() => { setTab('profile'); setError(''); setSuccess(''); }}
                    >
                        <User size={14} /> Profile Details
                    </button>
                    <button
                        className={`profile-modal-tab ${tab === 'password' ? 'active' : ''}`}
                        onClick={() => { setTab('password'); setError(''); setSuccess(''); }}
                    >
                        <Lock size={14} /> Change Password
                    </button>
                </div>

                {/* Alert Messages */}
                {success && (
                    <div className="profile-alert profile-alert-success">
                        <CheckCircle size={15} /> {success}
                    </div>
                )}
                {error && (
                    <div className="profile-alert profile-alert-error">
                        <AlertCircle size={15} /> {error}
                    </div>
                )}

                {/* Body */}
                <div className="profile-modal-body">
                    {tab === 'profile' && (
                        <div>
                            {/* Common field */}
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
                            </div>

                            {/* Student fields */}
                            {user.role === 'student' && (
                                <>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Admission Number</label>
                                            <input className="form-input" value={user.admissionNo || ''} disabled style={{ opacity: 0.6 }} title="Admission number cannot be changed" />
                                            <div className="form-helper">Cannot be changed after registration</div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Branch / Department</label>
                                            <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                                                <option value="">Select</option>
                                                {DEPTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Year of Study</label>
                                            <select className="form-select" value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                                                {[1, 2, 3, 4].map(y => (
                                                    <option key={y} value={y}>
                                                        {y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Year of Admission</label>
                                            <input className="form-input" type="number" min="2015" max="2030" value={form.yearOfAdmission} onChange={e => set('yearOfAdmission', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Category</label>
                                            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Type of Admission</label>
                                            <select className="form-select" value={form.typeOfAdmission} onChange={e => set('typeOfAdmission', e.target.value)}>
                                                {ADMISSIONS.map(a => <option key={a}>{a}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date of Birth</label>
                                            <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Father's / Mother's Name</label>
                                            <input className="form-input" value={form.parentName} onChange={e => set('parentName', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input type="checkbox" id="p-hostler" checked={form.isHostler} onChange={e => set('isHostler', e.target.checked)} />
                                        <label htmlFor="p-hostler" style={{ fontSize: 14 }}>Whether Hostler</label>
                                    </div>
                                    {form.isHostler && (
                                        <div className="form-group">
                                            <label className="form-label">Hostel Name</label>
                                            <input className="form-input" value={form.hostelName} onChange={e => set('hostelName', e.target.value)} />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Authority fields */}
                            {user.role !== 'student' && (
                                <>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Staff ID</label>
                                            <input className="form-input" value={form.staffId} onChange={e => set('staffId', e.target.value)} />
                                        </div>
                                        {!['faculty_coordinator', 'principal'].includes(user.role) && (
                                            <div className="form-group">
                                                <label className="form-label">Department</label>
                                                <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                                                    <option value="">Select</option>
                                                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        {user.role === 'tutor' && (
                                            <div className="form-group">
                                                <label className="form-label">Assigned Year</label>
                                                <select className="form-select" value={form.assignedYear} onChange={e => set('assignedYear', e.target.value)}>
                                                    <option value="">Select</option>
                                                    {[1, 2, 3, 4].map(y => (
                                                        <option key={y} value={y}>
                                                            {y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    {user.role === 'faculty_coordinator' && (
                                        <div className="form-group">
                                            <label className="form-label">Assigned Clubs</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                                {CLUBS.map(club => (
                                                    <button
                                                        key={club}
                                                        type="button"
                                                        onClick={() => toggleClub(club)}
                                                        style={{
                                                            padding: '5px 14px',
                                                            borderRadius: 999,
                                                            border: '1px solid',
                                                            borderColor: form.assignedClubs.includes(club) ? 'var(--navy)' : 'var(--border)',
                                                            background: form.assignedClubs.includes(club) ? 'var(--navy)' : 'white',
                                                            color: form.assignedClubs.includes(club) ? 'white' : 'var(--text-secondary)',
                                                            fontSize: 13,
                                                            cursor: 'pointer',
                                                            fontWeight: 500,
                                                            transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        {club}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Signature update */}
                                    <div className="form-group">
                                        <label className="form-label">Signature</label>
                                        {user.signatureUrl && !sigFile && (
                                            <div style={{ marginBottom: 8, padding: 10, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', display: 'inline-block' }}>
                                                <img
                                                    src={`${api.defaults.baseURL?.replace('/api', '')}${user.signatureUrl}`}
                                                    alt="Current signature"
                                                    style={{ maxHeight: 60, maxWidth: 200, display: 'block' }}
                                                    onError={e => e.target.style.display = 'none'}
                                                />
                                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Current signature</div>
                                            </div>
                                        )}
                                        {sigFile && (
                                            <div style={{ marginBottom: 8, padding: 10, background: '#EFF6FF', borderRadius: 8, border: '1px solid var(--navy)', display: 'inline-block' }}>
                                                <img src={URL.createObjectURL(sigFile)} alt="New signature preview" style={{ maxHeight: 60, maxWidth: 200, display: 'block' }} />
                                                <div style={{ fontSize: 11, color: 'var(--navy)', marginTop: 4 }}>New signature selected</div>
                                            </div>
                                        )}
                                        <div>
                                            <input
                                                ref={sigInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg"
                                                style={{ display: 'none' }}
                                                onChange={e => setSigFile(e.target.files[0] || null)}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                style={{ fontSize: 13, padding: '7px 14px' }}
                                                onClick={() => sigInputRef.current.click()}
                                            >
                                                <Camera size={14} /> {sigFile ? 'Change Signature' : 'Upload New Signature'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                                onClick={handleSaveProfile}
                                disabled={loading}
                            >
                                <Save size={15} /> {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {tab === 'password' && (
                        <div>
                            <div style={{ marginBottom: 20, padding: '14px 16px', background: '#EFF6FF', borderRadius: 8, fontSize: 13, color: 'var(--navy)', border: '1px solid #BFDBFE' }}>
                                Your password must be at least 8 characters long.
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={pwForm.currentPassword}
                                    onChange={e => setPw('currentPassword', e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={pwForm.password}
                                    onChange={e => setPw('password', e.target.value)}
                                    placeholder="Enter new password"
                                    minLength={8}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={pwForm.confirmPassword}
                                    onChange={e => setPw('confirmPassword', e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                                onClick={handleSavePassword}
                                disabled={loading || !pwForm.currentPassword || !pwForm.password}
                            >
                                <Lock size={15} /> {loading ? 'Updating…' : 'Update Password'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
