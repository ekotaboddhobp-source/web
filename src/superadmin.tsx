// superadmin.tsx – Ekotaboddho B.P Super Admin Dashboard (Admin Powers Full)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack, IoPeopleOutline, IoCashOutline, IoMegaphoneOutline, IoCalendarOutline,
  IoStatsChartOutline, IoRocketOutline, IoFlagOutline, IoImagesOutline,
  IoSettingsOutline, IoCheckmarkCircle, IoCloseCircle, IoCreateOutline,
  IoTrashOutline, IoGridOutline, IoClose, IoCheckmark, IoHourglassOutline, IoWalletOutline,
  IoLogOutOutline, IoMailOutline, IoLockClosedOutline, IoLockOpenOutline, IoCalendar
} from 'react-icons/io5';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = '#6C63FF' }) => (
  <div className="spinner" style={{ width: size, height: size, borderColor: `${color}33`, borderTopColor: color }} />
);

const SuperAdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [section, setSection] = useState<string>('menu');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form states
  const [fundAmount, setFundAmount] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDesc, setNoticeDesc] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState('');
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionProgress, setMissionProgress] = useState('0');
  const [selectedPhotosForMission, setSelectedPhotosForMission] = useState<string[]>([]);
  const [galleryTitleInput, setGalleryTitleInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  // Modals
  const [photoPickerModalVisible, setPhotoPickerModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editFatherName, setEditFatherName] = useState('');

  // Stats
  const [stats, setStats] = useState({ approved: 0, pending: 0, fund: 0, missions: 0, gallery: 0 });

  useEffect(() => {
    if (!token) {
      showToast('সেশন নেই, লগইন করুন', 'error');
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    if (section === 'menu') fetchDashboardStats();
    if (section === 'members' || section === 'dbedit') fetchMembers();
    if (section === 'missions' || section === 'mission-create') fetchMissions();
    if (section === 'album' || section === 'mission-create') fetchGallery();
    if (section === 'poll' || section === 'polls-list') fetchPolls();
    if (section === 'notice') fetchNotices();
    if (section === 'event') fetchEvents();
  }, [section, token]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const [approvedRes, pendingRes, fundRes, missionRes, galleryRes] = await Promise.all([
        fetch(`${API_URL}/users/approved`, { headers: authHeaders }),
        fetch(`${API_URL}/users/pending`, { headers: authHeaders }),
        fetch(`${API_URL}/fund`, { headers: authHeaders }),
        fetch(`${API_URL}/missions/active`, { headers: authHeaders }),
        fetch(`${API_URL}/albums/photos`, { headers: authHeaders }),
      ]);

      const approvedData = await approvedRes.json();
      const pendingData = await pendingRes.json();
      const fundData = await fundRes.json();
      const missionData = await missionRes.json();
      const galleryData = await galleryRes.json();

      setStats({
        approved: approvedData.success ? approvedData.users.length : 0,
        pending: pendingData.success ? pendingData.users.length : 0,
        fund: fundData?.totalAmount || 0,
        missions: missionData.success ? missionData.missions.length : 0,
        gallery: galleryData.success ? galleryData.photos.length : 0,
      });
    } catch (err) {
      console.error('Stats fetch error', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        fetch(`${API_URL}/users/approved`, { headers: authHeaders }),
        fetch(`${API_URL}/users/pending`, { headers: authHeaders }),
      ]);
      const approvedData = await approvedRes.json();
      const pendingData = await pendingRes.json();
      setUsers(approvedData.success ? approvedData.users : []);
      setPendingUsers(pendingData.success ? pendingData.users : []);
    } catch (err) {
      showToast('মেম্বার লোড ব্যর্থ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/missions/active`, { headers: authHeaders });
      const data = await res.json();
      setMissions(data.success ? data.missions : []);
    } catch (err) {
      showToast('মিশন লোড ব্যর্থ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/albums/photos`, { headers: authHeaders });
      const data = await res.json();
      setGallery(data.success ? data.photos : []);
    } catch (err) {
      showToast('অ্যালবাম লোড ব্যর্থ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/poll/active`, { headers: authHeaders });
      const data = await res.json();
      setPolls(data.success ? data.polls : []);
    } catch (err) {
      showToast('পোল লোড ব্যর্থ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notices`, { headers: authHeaders });
      const data = await res.json();
      setNotices(data.success ? data.notices : []);
    } catch (err) {
      showToast('নোটিশ লোড ব্যর্থ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events/upcoming`, { headers: authHeaders });
      const data = await res.json();
      setEvents(data.success ? data.events : []);
    } catch (err) {
      showToast('ইভেন্ট লোড ব্যর্থ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/approve/${id}`, { method: 'PUT', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast(`অনুমোদিত হয়েছে, আইডি: ${data.memberId}`, 'success');
        fetchMembers(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const rejectUser = async (id: string) => {
    if (!window.confirm('আপনি কি এই ইউজারকে রিজেক্ট করতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/users/reject/${id}`, { method: 'PUT', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('ইউজার রিজেক্ট হয়েছে', 'success');
        fetchMembers(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('মেম্বারটি স্থায়ীভাবে মুছে ফেলবেন?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('মুছে ফেলা হয়েছে', 'success');
        fetchMembers(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const toggleFreeze = async (id: string, currentFrozen: boolean) => {
    const action = currentFrozen ? 'আনফ্রিজ' : 'ফ্রিজ';
    if (!window.confirm(`আপনি কি এই ইউজারকে ${action} করতে চান?`)) return;
    try {
      const res = await fetch(`${API_URL}/users/freeze/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ frozen: !currentFrozen }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchMembers();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleFundUpdate = async () => {
    if (!fundAmount) return showToast('অ্যামাউন্ট দিন', 'error');
    try {
      const res = await fetch(`${API_URL}/fund/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ amount: Number(fundAmount) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('ফান্ড আপডেট হয়েছে', 'success');
        setFundAmount('');
        fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleNoticeAdd = async () => {
    if (!noticeTitle || !noticeDesc) return showToast('শিরোনাম ও বিবরণ দিন', 'error');
    try {
      const res = await fetch(`${API_URL}/notices/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ title: noticeTitle, description: noticeDesc }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('নোটিশ পাঠানো হয়েছে', 'success');
        setNoticeTitle(''); setNoticeDesc('');
        fetchNotices();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('এই নোটিশটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/notices/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('নোটিশ ডিলিট হয়েছে', 'success');
        fetchNotices();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleEventAdd = async () => {
    if (!eventTitle || !eventDate) return showToast('শিরোনাম ও তারিখ দিন', 'error');
    try {
      const res = await fetch(`${API_URL}/events/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ title: eventTitle, date: eventDate }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('ইভেন্ট যোগ হয়েছে', 'success');
        setEventTitle(''); setEventDate('');
        fetchEvents();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('এই ইভেন্টটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('ইভেন্ট ডিলিট হয়েছে', 'success');
        fetchEvents();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handlePollCreate = async () => {
    if (!pollQuestion || !pollOptions) return showToast('প্রশ্ন ও অপশন দিন', 'error');
    try {
      const optionsArray = pollOptions.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
      if (optionsArray.length < 2) {
        return showToast('কমপক্ষে ২টি অপশন দিন (কমা দিয়ে পৃথক করুন)', 'error');
      }
      const res = await fetch(`${API_URL}/poll/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ question: pollQuestion, options: optionsArray }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('পোল তৈরি হয়েছে', 'success');
        setPollQuestion(''); setPollOptions('');
        fetchPolls();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleDeletePoll = async (id: string) => {
    if (!window.confirm('এই পোলটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/poll/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('পোল ডিলিট হয়েছে', 'success');
        fetchPolls();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleNewsletterSend = async () => {
    if (!newsletterSubject || !newsletterMessage) return showToast('বিষয় ও বিবরণ দিন', 'error');
    if (!window.confirm('সব সদস্যকে এই ইমেইলটি পাঠাতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/newsletter/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ subject: newsletterSubject, message: newsletterMessage }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setNewsletterSubject(''); setNewsletterMessage('');
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleMissionCreate = async () => {
    if (!missionTitle || !missionDesc) return showToast('শিরোনাম ও বিবরণ দিন', 'error');
    try {
      const res = await fetch(`${API_URL}/missions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          title: missionTitle,
          description: missionDesc,
          progress: Number(missionProgress),
          albumPhotos: selectedPhotosForMission,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('মিশন তৈরি হয়েছে', 'success');
        setMissionTitle(''); setMissionDesc(''); setMissionProgress('0'); setSelectedPhotosForMission([]);
        fetchMissions(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const handleDeleteMission = async (id: string) => {
    if (!window.confirm('এই মিশনটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/missions/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('মিশন ডিলিট হয়েছে', 'success');
        fetchMissions(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  // ==================== ✅ FIX: FileReader finally bug ====================
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          const uploadRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ data: base64Data }),
          });
          const uploadData = await uploadRes.json();
          if (!uploadData.success) {
            showToast('আপলোড ব্যর্থ: ' + uploadData.message, 'error');
            return;
          }
          const imageUrl = uploadData.url;

          const galleryRes = await fetch(`${API_URL}/gallery/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ imageUrl, title: galleryTitleInput || 'অ্যালবাম ছবি' }),
          });
          const galleryData = await galleryRes.json();
          if (galleryData.success) {
            showToast('ছবি অ্যালবামে যোগ হয়েছে', 'success');
            setGalleryTitleInput('');
            fetchGallery(); fetchDashboardStats();
          } else {
            showToast(galleryData.message, 'error');
          }
        } catch (err) {
          showToast('আপলোডে সমস্যা', 'error');
        } finally {
          setUploadingPhoto(false); // ✅ onload-এর ভেতরে
        }
      };
      reader.onerror = () => {
        showToast('ফাইল পড়তে সমস্যা', 'error');
        setUploadingPhoto(false);
      };
    } catch (err) {
      showToast('আপলোডে সমস্যা', 'error');
      setUploadingPhoto(false);
    }
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    if (!window.confirm('এই ছবিটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`${API_URL}/gallery/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        showToast('ছবি ডিলিট হয়েছে', 'success');
        fetchGallery(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const togglePhotoSelection = (url: string) => {
    setSelectedPhotosForMission(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const handleEditMemberSave = async () => {
    if (!editingUser || !token) return;
    try {
      const res = await fetch(`${API_URL}/users/update/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ name: editName, phone: editPhone, address: editAddress, bloodGroup: editBloodGroup, fatherName: editFatherName }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('মেম্বার তথ্য আপডেট হয়েছে', 'success');
        setEditModalVisible(false);
        fetchMembers(); fetchDashboardStats();
      } else showToast(data.message, 'error');
    } catch (err) { showToast('সার্ভার সমস্যা', 'error'); }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || ''); setEditPhone(user.phone || '');
    setEditAddress(user.address || ''); setEditBloodGroup(user.bloodGroup || ''); setEditFatherName(user.fatherName || '');
    setEditModalVisible(true);
  };

  const handleLogout = () => {
    if (window.confirm('আপনি কি লগআউট করতে চান?')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { title: 'মেম্বার', icon: 'people', key: 'members', desc: 'অনুমোদন, ফ্রিজ ও এডিট' },
    { title: 'ফান্ড', icon: 'cash', key: 'fund', desc: 'তহবিল ব্যবস্থাপনা' },
    { title: 'নোটিশ', icon: 'megaphone', key: 'notice', desc: 'নোটিশ তৈরি ও ডিলিট' },
    { title: 'ইভেন্ট', icon: 'calendar', key: 'event', desc: 'ইভেন্ট তৈরি ও ডিলিট' },
    { title: 'পোল', icon: 'stats-chart', key: 'poll', desc: 'পোল তৈরি ও ডিলিট' },
    { title: 'মিশন তৈরি', icon: 'rocket', key: 'mission-create', desc: 'নতুন প্রকল্প' },
    { title: 'মিশন লিস্ট', icon: 'flag', key: 'missions', desc: 'অগ্রগতি ও ডিলিট' },
    { title: 'অ্যালবাম', icon: 'images', key: 'album', desc: 'ছবি আপলোড ও ডিলিট' },
    { title: 'ডাটাবেস', icon: 'settings', key: 'dbedit', desc: 'তথ্য সম্পাদনা' },
    { title: 'নিউজলেটার', icon: 'mail', key: 'newsletter', desc: 'সবাইকে ইমেইল পাঠান' },
  ];

  const getIcon = (icon: string) => {
    const color = "#6C63FF";
    switch (icon) {
      case 'people': return <IoPeopleOutline size={28} color={color} />;
      case 'cash': return <IoCashOutline size={28} color={color} />;
      case 'megaphone': return <IoMegaphoneOutline size={28} color={color} />;
      case 'calendar': return <IoCalendarOutline size={28} color={color} />;
      case 'stats-chart': return <IoStatsChartOutline size={28} color={color} />;
      case 'rocket': return <IoRocketOutline size={28} color={color} />;
      case 'flag': return <IoFlagOutline size={28} color={color} />;
      case 'images': return <IoImagesOutline size={28} color={color} />;
      case 'settings': return <IoSettingsOutline size={28} color={color} />;
      case 'mail': return <IoMailOutline size={28} color={color} />;
      default: return <IoSettingsOutline size={28} color={color} />;
    }
  };

  const renderHeader = () => (
    <div className="admin-header glass-header">
      <button className="back-btn" onClick={() => section === 'menu' ? handleLogout() : setSection('menu')}>
        {section === 'menu' ? <IoLogOutOutline size={22} color="#ff4757" /> : <IoArrowBack size={22} color="#333" />}
      </button>
      <span className="admin-header-title">
        {section === 'menu' ? 'অ্যাডমিন ড্যাশবোর্ড' : menuItems.find(i => i.key === section)?.title}
      </span>
      <div style={{ width: 44 }} />
    </div>
  );

  const renderMenu = () => (
    <div className="admin-content">
      {statsLoading ? <div className="center-spinner"><Spinner size={40} /></div> : (
        <div className="stats-row">
          <div className="stat-card glass-card">
            <IoPeopleOutline size={24} color="#6C63FF" />
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">অনুমোদিত</span>
          </div>
          <div className="stat-card glass-card">
            <IoHourglassOutline size={24} color="#f0a500" />
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">পেন্ডিং</span>
          </div>
          <div className="stat-card glass-card">
            <IoWalletOutline size={24} color="#2ed573" />
            <span className="stat-value">৳{stats.fund}</span>
            <span className="stat-label">ফান্ড</span>
          </div>
          <div className="stat-card glass-card">
            <IoRocketOutline size={24} color="#ff4757" />
            <span className="stat-value">{stats.missions}</span>
            <span className="stat-label">মিশন</span>
          </div>
        </div>
      )}

      <div className="menu-grid">
        {menuItems.map((item, idx) => (
          <button key={idx} className="menu-card glass-card" onClick={() => setSection(item.key)}>
            <div className="menu-icon-bg">{getIcon(item.icon)}</div>
            <span className="menu-title">{item.title}</span>
            <span className="menu-desc">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="admin-content">
      <div className="section-title">পেন্ডিং মেম্বার ({pendingUsers.length})</div>
      {loading ? <Spinner /> : pendingUsers.length === 0 ? <p className="empty-text">কোনো পেন্ডিং নেই</p> :
        pendingUsers.map(u => (
          <div key={u._id} className="list-item glass-card">
            <div className="list-item-info">
              <span className="list-name">{u.name}</span>
              <span className="list-sub">{u.email}</span>
            </div>
            <div className="list-item-actions">
              <button className="icon-btn approve" onClick={() => approveUser(u._id)} title="Approve"><IoCheckmarkCircle size={28} /></button>
              <button className="icon-btn reject" onClick={() => rejectUser(u._id)} title="Reject"><IoCloseCircle size={28} /></button>
            </div>
          </div>
        ))
      }

      <div className="section-title">অনুমোদিত মেম্বার ({users.length})</div>
      {loading ? <Spinner /> : users.length === 0 ? <p className="empty-text">কোনো মেম্বার নেই</p> :
        users.map(u => (
          <div key={u._id} className="list-item glass-card" style={{ borderLeft: u.frozen ? '3px solid #ff4757' : '3px solid transparent' }}>
            <div className="list-item-info">
              <span className="list-name">
                {u.name} ({u.memberId})
                {u.frozen && <span style={{ marginLeft: 6, fontSize: 11, background: '#ff4757', color: '#fff', padding: '2px 6px', borderRadius: 8 }}>❄️ FROZEN</span>}
              </span>
              <span className="list-sub">{u.phone || 'N/A'}</span>
            </div>
            <div className="list-item-actions">
              <button 
                className="icon-btn" 
                onClick={() => toggleFreeze(u._id, !!u.frozen)} 
                title={u.frozen ? 'আনফ্রিজ' : 'ফ্রিজ'}
              >
                {u.frozen ? <IoLockOpenOutline size={22} color="#2ed573" /> : <IoLockClosedOutline size={22} color="#ff4757" />}
              </button>
              <button className="icon-btn edit" onClick={() => openEditModal(u)} title="Edit"><IoCreateOutline size={22} /></button>
              <button className="icon-btn delete" onClick={() => deleteUser(u._id)} title="Delete"><IoTrashOutline size={22} /></button>
            </div>
          </div>
        ))
      }
    </div>
  );

  const renderFund = () => (
    <div className="admin-content form-container glass-card">
      <div className="label">বর্তমান ফান্ড: <span style={{ color: '#6C63FF', fontWeight: 'bold' }}>৳{stats.fund}</span></div>
      <div className="label">নতুন জমার পরিমাণ (টাকা)</div>
      <input className="text-input" type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="5000" />
      <button className="primary-btn" onClick={handleFundUpdate}>আপডেট করুন</button>
    </div>
  );

  const renderNotice = () => (
    <div className="admin-content">
      <div className="form-container glass-card">
        <div className="label">শিরোনাম</div>
        <input className="text-input" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="শিরোনাম" />
        <div className="label">বিবরণ</div>
        <textarea className="text-input" rows={4} value={noticeDesc} onChange={(e) => setNoticeDesc(e.target.value)} placeholder="বিবরণ" />
        <button className="primary-btn" onClick={handleNoticeAdd}>নোটিশ পাঠান</button>
      </div>

      <div className="section-title">সব নোটিশ ({notices.length})</div>
      {loading ? <Spinner /> : notices.length === 0 ? <p className="empty-text">কোনো নোটিশ নেই</p> :
        notices.map(n => (
          <div key={n._id} className="list-item glass-card">
            <div className="list-item-info">
              <span className="list-name">{n.title}</span>
              <span className="list-sub">{n.description.substring(0, 60)}...</span>
            </div>
            <button className="icon-btn delete" onClick={() => handleDeleteNotice(n._id)} title="Delete">
              <IoTrashOutline size={22} color="#ff4757" />
            </button>
          </div>
        ))
      }
    </div>
  );

  const renderEvent = () => (
    <div className="admin-content">
      <div className="form-container glass-card">
        <div className="label">ইভেন্টের নাম</div>
        <input className="text-input" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="বনভোজন ২০২৬" />
        <div className="label">তারিখ</div>
        <input className="text-input" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        <button className="primary-btn" onClick={handleEventAdd}>যোগ করুন</button>
      </div>

      <div className="section-title">সব ইভেন্ট ({events.length})</div>
      {loading ? <Spinner /> : events.length === 0 ? <p className="empty-text">কোনো ইভেন্ট নেই</p> :
        events.map(e => (
          <div key={e._id} className="list-item glass-card">
            <div className="list-item-info">
              <span className="list-name">{e.title}</span>
              <span className="list-sub">{e.date ? new Date(e.date).toLocaleDateString('bn-BD') : 'তারিখ নেই'}</span>
            </div>
            <button className="icon-btn delete" onClick={() => handleDeleteEvent(e._id)} title="Delete">
              <IoTrashOutline size={22} color="#ff4757" />
            </button>
          </div>
        ))
      }
    </div>
  );

  const renderPoll = () => (
    <div className="admin-content">
      <div className="form-container glass-card">
        <div className="label">প্রশ্ন</div>
        <input className="text-input" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="আগামী শুক্রবার কি বনভোজন হবে?" />
        <div className="label">অপশন (কমা দিয়ে পৃথক)</div>
        <input className="text-input" value={pollOptions} onChange={(e) => setPollOptions(e.target.value)} placeholder="হ্যাঁ, না, পরবর্তী মাসে" />
        <button className="primary-btn" onClick={handlePollCreate}>পোল তৈরি করুন</button>
      </div>

      <div className="section-title">সব চলমান পোল ({polls.length})</div>
      {loading ? <Spinner /> : polls.length === 0 ? <p className="empty-text">কোনো পোল নেই</p> :
        polls.map(p => (
          <div key={p._id} className="list-item glass-card">
            <div className="list-item-info">
              <span className="list-name">{p.question}</span>
              <span className="list-sub">{p.options.map((o: any) => `${o.text} (${o.votes})`).join(' • ')}</span>
            </div>
            <button className="icon-btn delete" onClick={() => handleDeletePoll(p._id)} title="Delete">
              <IoTrashOutline size={22} color="#ff4757" />
            </button>
          </div>
        ))
      }
    </div>
  );

  const renderNewsletter = () => (
    <div className="admin-content form-container glass-card">
      <div className="label">ইমেইলের বিষয় (Subject)</div>
      <input className="text-input" value={newsletterSubject} onChange={(e) => setNewsletterSubject(e.target.value)} placeholder="যেমন: মাসিক মিটিং এর নোটিশ" />
      <div className="label">মেসেজ (Message)</div>
      <textarea className="text-input" rows={6} value={newsletterMessage} onChange={(e) => setNewsletterMessage(e.target.value)} placeholder="এখানে আপনার বক্তব্য লিখুন..." />
      <button className="primary-btn" onClick={handleNewsletterSend} style={{ marginTop: 10 }}>সব সদস্যকে ইমেইল পাঠান</button>
    </div>
  );

  const renderMissionCreate = () => (
    <div className="admin-content form-container glass-card">
      <div className="label">মিশনের নাম</div>
      <input className="text-input" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} placeholder="গরিবদের মাঝে খাদ্য বিতরণ" />
      <div className="label">বিবরণ</div>
      <textarea className="text-input" rows={3} value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} placeholder="বিবরণ" />
      <div className="label">অগ্রগতি (%)</div>
      <input className="text-input" type="number" value={missionProgress} onChange={(e) => setMissionProgress(e.target.value)} placeholder="0" />
      
      <div className="label">অ্যালবাম ফটো নির্বাচন করুন</div>
      <button className="secondary-btn" onClick={() => setPhotoPickerModalVisible(true)}>
        গ্যালারি থেকে ছবি ({selectedPhotosForMission.length} টি)
      </button>
      
      {selectedPhotosForMission.length > 0 && (
        <div className="selected-photos-container">
          {selectedPhotosForMission.map((url, idx) => (
            <div key={idx} className="selected-photo-item">
              <img src={url} alt={`selected-${idx}`} />
              <button className="remove-photo-btn" onClick={() => togglePhotoSelection(url)}><IoCloseCircle size={20} color="#fff" /></button>
            </div>
          ))}
        </div>
      )}
      <button className="primary-btn" onClick={handleMissionCreate} style={{ marginTop: 15 }}>মিশন তৈরি করুন</button>
    </div>
  );

  const renderMissionsList = () => (
    <div className="admin-content">
      <div className="section-title">চলমান মিশন ({missions.length})</div>
      {loading ? <Spinner /> : missions.length === 0 ? <p className="empty-text">কোনো মিশন নেই</p> :
        missions.map(m => (
          <div key={m._id} className="list-item glass-card">
            <div className="list-item-info">
              <span className="list-name">{m.title}</span>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${m.progress}%` }} /></div>
              <span className="list-sub">{m.progress}% সম্পন্ন</span>
            </div>
            <button className="icon-btn delete" onClick={() => handleDeleteMission(m._id)} title="Delete">
              <IoTrashOutline size={22} color="#ff4757" />
            </button>
          </div>
        ))
      }
    </div>
  );

  const renderAlbum = () => (
    <div className="admin-content">
      <div className="form-container glass-card">
        <div className="label">ছবির শিরোনাম</div>
        <input className="text-input" value={galleryTitleInput} onChange={(e) => setGalleryTitleInput(e.target.value)} placeholder="ছবির নাম" />
        <label className="upload-btn">
          {uploadingPhoto ? <Spinner color="#fff" /> : 'ডিভাইস থেকে ছবি আপলোড করুন'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploadingPhoto} />
        </label>
      </div>
      <div className="section-title">অ্যালবাম ({gallery.length} টি)</div>
      {loading ? <Spinner /> : gallery.length === 0 ? <p className="empty-text">কোনো ছবি নেই</p> :
        <div className="gallery-grid">
          {gallery.map(img => (
            <div key={img._id} className="gallery-card glass-card" style={{ position: 'relative' }}>
              <img src={img.url} alt={img.caption || 'ছবি'} />
              <div className="gallery-caption">{img.caption || 'ছবি'}</div>
              <button 
                className="icon-btn delete" 
                onClick={() => handleDeleteGalleryPhoto(img._id)} 
                title="Delete"
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,71,87,0.9)', padding: 4 }}
              >
                <IoTrashOutline size={16} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      }
    </div>
  );

  const renderDbEdit = () => (
    <div className="admin-content">
      <div className="section-title">সদস্যদের তথ্য এডিট করুন ({users.length})</div>
      {loading ? <Spinner /> : users.length === 0 ? <p className="empty-text">কোনো মেম্বার নেই</p> :
        users.map(u => (
          <div key={u._id} className="list-item glass-card">
            <div className="list-item-info">
              <span className="list-name">{u.name} ({u.memberId})</span>
              <span className="list-sub">{u.email}</span>
            </div>
            <button className="icon-btn edit" onClick={() => openEditModal(u)} title="Edit"><IoCreateOutline size={22} /></button>
          </div>
        ))
      }
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'members': return renderMembers();
      case 'fund': return renderFund();
      case 'notice': return renderNotice();
      case 'event': return renderEvent();
      case 'poll': return renderPoll();
      case 'newsletter': return renderNewsletter();
      case 'mission-create': return renderMissionCreate();
      case 'missions': return renderMissionsList();
      case 'album': return renderAlbum();
      case 'dbedit': return renderDbEdit();
      default: return null;
    }
  };

  if (!token) return <div className="loading-fullscreen"><Spinner size={48} /></div>;

  return (
    <div className="superadmin-container">
      <style>{`
        :root {
          --primary: #6C63FF; 
          --primary-light: rgba(108, 99, 255, 0.15);
          --bg: #f3f0ff;
          --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
          --glass-border: rgba(255, 255, 255, 0.5);
          --glass-blur: blur(25px);
          --text-dark: #2d2d2d; 
          --text-muted: #777777;
          --shadow-main: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color: transparent; }
        html, body { min-height: 100dvh; width: 100%; overflow-x: hidden; overflow-y: auto; }
        body { font-family: 'Hind Siliguri', sans-serif; background-color: var(--bg); color: var(--text-dark); }
        
        .superadmin-container { 
          position: relative; min-height: 100dvh; background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%); overflow: hidden;
        }

        .admin-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 20px; backdrop-filter: blur(25px); background: rgba(255,255,255,0.6);
          border-bottom: 1px solid var(--glass-border); position: sticky; top: 0; z-index: 10;
        }
        .back-btn { background: rgba(255,255,255,0.5); border: 1px solid var(--glass-border); border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
        .admin-header-title { font-size: 20px; font-weight: 800; color: var(--text-dark); }
        
        .admin-content { padding: 20px; max-width: 800px; margin: 0 auto; position: relative; z-index: 10; }
        .center-spinner { display: flex; justify-content: center; margin: 30px 0; }
        .loading-fullscreen { display: flex; justify-content: center; align-items: center; height: 100dvh; }
        
        .glass-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); box-shadow: var(--shadow-main), inset 0 2px 4px rgba(255,255,255,0.5);
        }

        .stats-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 25px; }
        .stat-card {
          flex: 1 1 calc(50% - 12px); min-width: 130px; padding: 15px; border-radius: 20px;
          text-align: center; display: flex; flex-direction: column; align-items: center;
        }
        .stat-value { font-size: 20px; font-weight: 800; margin-top: 5px; color: var(--text-dark); }
        .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
        
        .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .menu-card {
          border-radius: 20px; padding: 20px 15px; cursor: pointer; text-align: center;
          transition: transform 0.2s; display: flex; flex-direction: column; align-items: center;
        }
        .menu-card:active { transform: scale(0.96); }
        .menu-icon-bg { width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 10px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.6); }
        .menu-title { font-size: 15px; font-weight: 800; color: var(--text-dark); }
        .menu-desc { font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.4; }
        
        .section-title { font-size: 18px; font-weight: 800; margin: 20px 0 10px; color: var(--text-dark); }
        .empty-text { text-align: center; color: #999; margin: 20px 0; }
        
        .list-item {
          padding: 15px; border-radius: 16px; margin-bottom: 10px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .list-item-info { flex: 1; margin-right: 10px; }
        .list-name { font-size: 16px; font-weight: 700; color: var(--text-dark); }
        .list-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .list-item-actions { display: flex; gap: 6px; flex-shrink: 0; }
        
        .icon-btn { background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.8); border-radius: 50%; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .icon-btn.approve { color: #2ed573; }
        .icon-btn.reject, .icon-btn.delete { color: #ff4757; }
        .icon-btn.edit { color: #f0a500; }
        
        .form-container { padding: 20px; border-radius: 20px; margin-bottom: 20px; }
        .label { font-size: 14px; font-weight: 700; margin: 10px 0 8px; color: #444; }
        .text-input {
          width: 100%; padding: 14px; border: 1px solid rgba(255,255,255,0.8); border-radius: 12px;
          font-size: 16px; margin-bottom: 12px; outline: none; background: rgba(255,255,255,0.4);
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); transition: all 0.3s;
        }
        .text-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.6); box-shadow: 0 0 0 3px var(--primary-light), inset 0 2px 4px rgba(255,255,255,0.5); }
        
        .primary-btn {
          background: var(--primary); color: #fff; border: none; padding: 14px 20px;
          border-radius: 14px; cursor: pointer; font-weight: bold; font-size: 16px;
          width: 100%; box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3); transition: all 0.2s;
        }
        .primary-btn:active { transform: scale(0.98); }
        
        .secondary-btn {
          background: rgba(255,255,255,0.6); color: var(--primary); border: 1px solid var(--glass-border);
          padding: 14px 20px; border-radius: 14px; cursor: pointer; font-weight: bold; width: 100%;
        }
        
        .upload-btn {
          display: flex; align-items: center; justify-content: center; background: #333; color: #fff;
          padding: 14px; border-radius: 14px; cursor: pointer; font-weight: 600; margin-top: 10px;
        }
        
        .selected-photos-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .selected-photo-item { position: relative; width: 80px; height: 80px; }
        .selected-photo-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .remove-photo-btn { position: absolute; top: -8px; right: -8px; background: #ff4757; border: none; border-radius: 50%; cursor: pointer; padding: 2px; }
        
        .progress-bar-bg { height: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; margin: 8px 0; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--primary); border-radius: 4px; }
        
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; margin-top: 15px; }
        .gallery-card { border-radius: 14px; overflow: hidden; }
        .gallery-card img { width: 100%; height: 130px; object-fit: cover; }
        .gallery-caption { padding: 8px; font-size: 12px; text-align: center; font-weight: 600; color: #444; }
        
        .spinner { border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: flex-end; z-index: 1000;
        }
        .modal-content {
          background: rgba(255,255,255,0.95); backdrop-filter: blur(25px); width: 100%; max-width: 500px; padding: 25px;
          border-radius: 25px 25px 0 0; max-height: 85vh; overflow-y: auto; animation: slideUp 0.3s ease;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .modal-title { font-size: 20px; font-weight: 800; margin-bottom: 15px; color: #333; }
      `}</style>

      {renderHeader()}

      {section === 'menu' ? renderMenu() : (
        <div style={{ position: 'relative', minHeight: '80vh' }}>
          {renderSection()}
        </div>
      )}

      {photoPickerModalVisible && (
        <div className="modal-overlay" onClick={() => setPhotoPickerModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <span className="modal-title">ছবি নির্বাচন করুন</span>
              <button className="icon-btn" onClick={() => setPhotoPickerModalVisible(false)}><IoClose size={24} color="#333" /></button>
            </div>
            {gallery.length === 0 ? <p className="empty-text">কোনো ছবি নেই</p> : (
              <div className="gallery-grid" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {gallery.map(item => {
                  const isSelected = selectedPhotosForMission.includes(item.url);
                  return (
                    <div key={item._id} onClick={() => togglePhotoSelection(item.url)} style={{ cursor: 'pointer', position: 'relative' }}>
                      <img src={item.url} alt={item.caption || ''} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                      {isSelected && <span style={{ position: 'absolute', top: 5, right: 5, background: 'var(--primary)', borderRadius: '50%', padding: 2 }}><IoCheckmark size={18} color="#fff" /></span>}
                    </div>
                  );
                })}
              </div>
            )}
            <button className="primary-btn" onClick={() => setPhotoPickerModalVisible(false)} style={{ marginTop: 15 }}>ঠিক আছে</button>
          </div>
        </div>
      )}

      {editModalVisible && editingUser && (
        <div className="modal-overlay" onClick={() => setEditModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">মেম্বার তথ্য সম্পাদনা</div>
            <input className="text-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="নাম" />
            <input className="text-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="ফোন" />
            <input className="text-input" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="ঠিকানা" />
            <input className="text-input" value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)} placeholder="রক্তের গ্রুপ" />
            <input className="text-input" value={editFatherName} onChange={(e) => setEditFatherName(e.target.value)} placeholder="পিতার নাম" />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="secondary-btn" onClick={() => setEditModalVisible(false)} style={{ flex: 1 }}>বাতিল</button>
              <button className="primary-btn" onClick={handleEditMemberSave} style={{ flex: 1 }}>সংরক্ষণ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminScreen;
