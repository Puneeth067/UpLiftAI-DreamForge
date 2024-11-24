import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion} from 'framer-motion';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '@/utils/supabase';
import {
  Mail,
  Phone,
  Gem,
  Sparkles ,
  Edit2,
  Save,
  X,
  Clock,
  ArrowLeft,
  CheckCircle,
  Camera,
  Info,
  Home,
  MessageSquare,
  Star,
  Palette,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Settings
} from 'lucide-react';
import PropTypes from 'prop-types';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";


const BackgroundSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1440 900"
  >
    <defs>
      <radialGradient id="lightGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#F8F0FF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#F0E6FF" stopOpacity="0.2" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#9B6DFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#D4BBFF" stopOpacity="0.1" />
      </radialGradient>

      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#2A1352" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1A0B38" stopOpacity="0.2" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="60" />
      </filter>

      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" className="text-purple-200 dark:text-purple-900" opacity="0.3" />
      </pattern>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="200" cy="150" r="400" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <circle cx="1200" cy="300" r="500" fill="url(#lightGradient)" opacity="0.4" filter="url(#blurFilter)" />
      <circle cx="800" cy="600" r="300" fill="url(#accentGradient)" opacity="0.3" filter="url(#blurFilter)" />
      <path d="M0,300 Q720,400 1440,300 Q720,500 0,300" fill="url(#accentGradient)" opacity="0.15" />
      <ellipse cx="600" cy="750" rx="600" ry="300" fill="url(#lightGradient)" opacity="0.2" filter="url(#blurFilter)" />
    </g>
   
    {/* Dark Mode Patterns */}
    <g className="opacity-0 dark:opacity-100">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="300" cy="200" r="600" fill="url(#darkGradient)" filter="url(#blurFilter)" />
      <path d="M1440,600 Q720,800 0,600 Q720,400 1440,600" fill="url(#darkGradient)" opacity="0.25" />
      <ellipse cx="1100" cy="500" rx="700" ry="400" fill="url(#darkGradient)" opacity="0.2" filter="url(#blurFilter)" />
      <circle cx="800" cy="750" r="400" fill="url(#darkGradient)" opacity="0.15" filter="url(#blurFilter)" />
    </g>
  </svg>
);

const DEPARTMENTS = [
  'Visual Artist',
  'Musician',
  'Writer',
  'Digital Creator',
  'Mixed Media Artist'
];

const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/[^\d]/g, '');
  
  // Format the number as XXX XXX XXXX
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3)}`;
  } else {
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
  }
};

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userData?.id;
  const { isDarkMode, loadUserTheme } = useTheme();
  const [userData, setProfileData] = useState(location.state?.userData);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phonenumber: '',
    department: '',
    usertype: '',
    avatar_url: 'user.png'
  });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [setActiveView] = useState('profile');
  const [activeItem, setActiveItem] = useState(null);

  // Updated menu items for creator dashboard
  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      view: 'home',
      onClick: () => navigate('/agentdashboard', { state: { userData } })
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      view: 'tickets',
      onClick: () => navigate('/agenttickets', { state: { userData } })
    },
    {
      title: 'Featured Work',
      icon: Star,
      view: 'project',
      onClick: () => navigate('/agentprojects', { state: { userData } })
    },
    {
      title: 'Portfolio',
      icon: Palette,
      view: 'portfolio',
      onClick: () => navigate('/portfolio', { state: { userData } })
    },
    {
      title: 'Profile',
      icon: User,
      view: 'profile',
      onClick: () => navigate('/profile', { state: { userData } })
    },
    {
      title: 'Settings',
      icon: Settings,
      view: 'settings',
      onClick: () => navigate('/settings', { state: { userData } })
    }    
  ];

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && <span className="text-xl font-semibold dark:text-white">Menu</span>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {isCollapsed ? 
              <PanelLeftOpen  className="h-6 w-6 dark:text-white" /> : 
              <PanelLeftClose className="h-6 w-6 dark:text-white" />
            }
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userData?.avatar_url ? (
              <img 
                src={`/avatars/${userData.avatar_url}`}
                alt={userData.fullname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/avatars/user.png';
                }}
              />
            ) : (
              <img 
                src="/avatars/user.png"
                alt="Default User"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-medium truncate dark:text-white">{userData.fullname}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
              {userData.department && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{userData.department}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MenuItem = ({ item, index }) => (
    <div className="mb-2">
      <button 
        onClick={() => {
          if (item.onClick) {
            item.onClick();
          } else {
            setActiveView(item.view);
            setActiveItem(activeItem === index ? null : index);
          }
        }}
        className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors duration-200 ${
          isCollapsed ? 'justify-center' : ''
        }`}
        title={isCollapsed ? item.title : ''}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
        {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
        
      </button>
    </div>
  );

  MenuItem.propTypes = {
    item: PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      view: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  useEffect(() => {
    // Load user theme
    loadUserTheme(userId);
    fetchProfile();
    fetchAvatars();
  }, [userId, loadUserTheme]);

  const fetchAvatars = async () => {
    // In a real implementation, you might want to fetch this list from an API
    // For now, we'll hardcode the list based on your public/avatars directory
    const avatarList = [
      'agent-boy.png', 'agent-girl.png', 'astronaut.png', 'bear.png',
      'bot.png', 'cat.png', 'cool-.png', 'cow.png', 'dog.png',
      'dragon.png', 'duck.png', 'ghost.png', 'giraffe.png',
      'gorilla.png', 'hippopotamus.png', 'knight.png', 'koala.png',
      'lion.png', 'man.png', 'meerkat.png', 'ninja.png', 'owl.png',
      'panda.png', 'polar-bear.png', 'rabbit.png', 'shark.png',
      'tiger.png', 'user.png', 'woman.png'
    ];
    setAvatars(avatarList);
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
      setProfileData(data);
      setFormData({
        fullname: data.fullname || '',
        email: data.email || '',
        phonenumber: data.phonenumber || '',
        department: data.department || '',
        usertype: data.usertype || '',
        avatar_url: data.avatar_url || 'user.png'
      });
      setSelectedAvatar(data.avatar_url || 'user.png');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        fullname: formData.fullname,
        avatar_url: selectedAvatar
      };

      if (profile.usertype === 'agent') {
        updateData.department = formData.department;
      }

      if (profile.usertype === 'customer') {
        updateData.phonenumber = formData.phonenumber;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      setProfile({ ...profile, ...updateData });
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    }
  };

  const handleAvatarSelect = async (avatar) => {
    // Update the local state immediately
    setSelectedAvatar(avatar);
    
    try {
      // Optionally, update the avatar in Supabase immediately
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatar })
        .eq('id', userId);

      if (error) throw error;

      // Update the local profile state
      setProfile(prev => ({
        ...prev,
        avatar_url: avatar
      }));

      // Close the avatar dialog
      setAvatarDialogOpen(false);

      // Show a toast notification
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phonenumber') {
      // Format phone number while typing
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDepartmentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      department: value
    }));
  };


  const renderAvatarDialog = () => (
    <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] p-4">
          <div className="grid grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                className={`relative rounded-lg p-2 transition-all hover:bg-gray-100 ${
                  selectedAvatar === avatar ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={`/avatars/${avatar}`}
                  alt={avatar}
                  className="w-full h-auto rounded-lg"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      // Show the tip when entering edit mode
      toast({
        title: "Profile Edit Tip",
        description: "Hover over your profile picture to change your avatar!",
        icon: <Info className="h-5 w-5 text-blue-500" />,
        duration: 5000,
        className: `${isDarkMode 
          ? "bg-gray-800 border-gray-700 text-gray-100" 
          : "bg-blue-50 border-blue-200"}`
      });
    }
  };

  const getUserTypeColor = (userType) => {
    const types = {
      admin: isDarkMode 
        ? 'bg-purple-900 text-purple-100 border-purple-800'
        : 'bg-purple-50 text-purple-700 border-purple-200',
      agent: isDarkMode
        ? 'bg-blue-900 text-blue-100 border-blue-800'
        : 'bg-blue-50 text-blue-700 border-blue-200',
      customer: isDarkMode
        ? 'bg-green-900 text-green-100 border-green-800'
        : 'bg-green-50 text-green-700 border-green-200',
      default: isDarkMode
        ? 'bg-gray-800 text-gray-100 border-gray-700'
        : 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return types[userType?.toLowerCase()] || types.default;
  };

  const renderProfileInfo = () => {
    const isAgent = profile?.usertype === 'agent';
    const isCustomer = profile?.usertype === 'customer';

    return (
      <div className="flex flex-col items-center text-center">
        
        <div className="relative group">
          <Avatar className={`h-32 w-32 ${isDarkMode ? 'ring-gray-800' : 'ring-white'} ring-4 shadow-lg`}>
            <AvatarImage 
              src={`/avatars/${editing ? selectedAvatar : (profile?.avatar_url || 'user.png')}`} 
              alt={profile?.fullname} 
            />
            <AvatarFallback>
              <img src="/avatars/user.png" alt="Default Avatar" />
            </AvatarFallback>
          </Avatar>
          {editing && (
            <button
              onClick={() => setAvatarDialogOpen(true)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
          )}
          <Badge className="absolute -bottom-2 -right-2 bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        </div>
        
        <h2 className={`text-2xl font-bold mt-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {profile?.fullname}
        </h2>
        <Badge variant="secondary" className={`mt-2 px-4 py-1 ${getUserTypeColor(profile?.usertype)}`}>
        {profile?.usertype === 'agent' ? 'Creator' : 'Patron'}
        </Badge>

        <div className="w-full mt-8 space-y-4">
          <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} justify-center`}>
            <Mail className="h-4 w-4" />
            {profile?.email}
          </div>
          {isCustomer && (
            <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} justify-center`}>
              <Phone className="h-4 w-4" />
              {profile?.phonenumber || 'Not provided'}
            </div>
          )}
          {isAgent && (
            <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} justify-center`}>
              <Gem className="h-4 w-4" />
              {profile?.department || 'Not specified'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    const isAgent = profile?.usertype === 'agent';
    const isCustomer = profile?.usertype === 'customer';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <Input
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              className={`transition-all focus:ring-2 ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
              }`}
            />
          </div>
          
          {isCustomer && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone
              </label>
              <Input
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleInputChange}
                placeholder="(555) 555-5555"
                maxLength={14}
                className={`transition-all focus:ring-2 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                }`}
              />
            </div>
          )}
          {isAgent && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Speciality
              </label>
              <Select
                value={formData.department}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger className={`w-full ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                }`}>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderEditButtons = () => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(false)}
        className={`transition-all ${
          isDarkMode ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'
        }`}
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleUpdate}
        className="transition-all"
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  );

  const renderViewMode = () => {
    const isAgent = profile?.usertype === 'agent';
    const isCustomer = profile?.usertype === 'customer';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Full Name
            </label>
            <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {profile?.fullname}
            </p>
          </div>
          {isCustomer && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Phone
              </label>
              <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {profile?.phonenumber || 'Not provided'}
              </p>
            </div>
          )}
          {isAgent && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Department
              </label>
              <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {profile?.department || 'Not specified'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside className={`hidden md:block fixed left-0 top-0 h-full border-r border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>
      <Toaster />
      {renderAvatarDialog()}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className={`mr-4 ${isDarkMode ? 'text-gray-100 hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Profile Details
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <Card className={`md:col-span-1 shadow-md hover:shadow-lg transition-shadow ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="pt-8">
              {renderProfileInfo()}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-8">
            <Card className={`shadow-md hover:shadow-lg transition-shadow ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Profile Information
                </h3>
                {editing ? (
                  renderEditButtons()
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                    className={`transition-all ${
                      isDarkMode ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editing ? renderEditForm() : renderViewMode()}
              </CardContent>
            </Card>

            <Card className={`shadow-md hover:shadow-lg transition-shadow ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <CardHeader>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Account Details
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`flex items-center gap-4 p-6 rounded-xl ${getUserTypeColor(profile?.usertype)} transition-all hover:shadow-md`}>
                    <div className={`p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-sm`}>
                      <Sparkles  className={`h-6 w-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`} />
                    </div>
                    <div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Account Type
                      </div>
                      <div className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {profile?.usertype === 'agent' ? 'Creator' : 'Patron'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 p-6 rounded-xl transition-all hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}>
                      <Clock className={`h-6 w-6 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Account Created</div>
                      <div className={`font-semibold text-lg ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {new Date(profile?.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {loading && (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`md:col-span-1 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className={`h-32 w-32 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <Skeleton className={`h-6 w-48 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <Skeleton className={`h-4 w-32 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                </div>
              </CardContent>
            </Card>
            <Card className={`md:col-span-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <Skeleton className={`h-6 w-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <Skeleton className={`h-6 w-3/4 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <Skeleton className={`h-6 w-1/2 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;