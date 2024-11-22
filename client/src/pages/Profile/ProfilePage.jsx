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
  Building,
  Shield,
  Edit2,
  Save,
  X,
  Clock,
  ArrowLeft,
  CheckCircle,
  Camera,
  Info
} from 'lucide-react';

const DEPARTMENTS = [
  'Technical Support',
  'Customer Service',
  'Billing Support',
  'Product Support'
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
          {profile?.usertype || 'Customer'}
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
              <Building className="h-4 w-4" />
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
                Department
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
                      <Shield className={`h-6 w-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`} />
                    </div>
                    <div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Account Type
                      </div>
                      <div className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {profile?.usertype || 'Standard User'}
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