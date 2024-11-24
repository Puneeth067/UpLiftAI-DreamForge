import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger} from '@/components/ui/dialog';
import{
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Github, Twitter, Instagram, Linkedin, Globe, Mail, Edit, Save, Plus, X, Building, Calendar, Home,MessageSquare, Star, Palette, User, PanelLeftClose, PanelLeftOpen, Settings} from "lucide-react";
import { supabase } from '@/utils/supabase';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
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

const MotionCard = motion(Card);

const AgentPortfolio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadUserTheme } = useTheme();
  const [userData, setProfileData] = useState(location.state?.userData);
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [setActiveView] = useState('portfolio');
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, [userData.id]);

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

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (profileError) throw profileError;

      loadUserTheme(profileData.id);
      setUserProfile(profileData);
      setProfileData(profileData);

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (portfolioError) {
        const { data: defaultData } = await supabase
          .from('portfolio')
          .select('*')
          .eq('user_id', 'DEFAULT')
          .single();

        setPortfolioData({ ...defaultData, user_id: userData.id });
      } else {
        setPortfolioData(portfolioData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('portfolio')
        .upsert({
          ...portfolioData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setIsEditing(false);
      await fetchPortfolioData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside className={`hidden md:block fixed left-0 top-0 h-full border-r border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>
      {/* Header with Edit Toggle */}
      <div className={`sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Portfolio</h1>
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            variant={isEditing ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit Portfolio
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={`max-w-5xl mx-auto px-4 py-8 ${isCollapsed ? 'left-20' : 'left-64'} space-y-8`}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <Avatar className="w-48 h-48">
                <AvatarImage 
                src={`/avatars/${userData.avatar_url}`}
                alt={userData.fullname} 
                />
                <AvatarFallback className="text-4xl">
                  {userData?.fullname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h1 className="text-4xl font-bold">{userProfile?.fullname}</h1>
                {isEditing ? (
                  <Input
                    value={portfolioData.title}
                    onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                    className="mt-2 text-xl"
                    placeholder="Your title"
                  />
                ) : (
                  <h2 className="text-2xl text-muted-foreground mt-2">{portfolioData.title}</h2>
                )}
              </div>

              {isEditing ? (
                <Textarea
                  value={portfolioData.bio}
                  onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell your story..."
                />
              ) : (
                <p className="text-lg text-muted-foreground">{portfolioData.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {userProfile?.email}
                  </Button> 
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills Section */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {portfolioData.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newSkills = portfolioData.skills.filter((_, i) => i !== index);
                        setPortfolioData({ ...portfolioData, skills: newSkills });
                      }}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {isEditing && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Skill</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Enter skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setPortfolioData({
                            ...portfolioData,
                            skills: [...portfolioData.skills, e.target.value]
                          });
                          e.target.value = '';
                        }
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </MotionCard>

        {/* Projects Grid */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Featured Projects</CardTitle>
            {isEditing && (
              <Button 
                variant="outline"
                onClick={() => setPortfolioData({
                  ...portfolioData,
                  projects: [...portfolioData.projects, {
                    title: "New Project",
                    description: "Project Description",
                    image: "/api/placeholder/600/400"
                  }]
                })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioData.projects.map((project, index) => (
                <MotionCard
                  key={index}
                  className="overflow-hidden group relative"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative h-48">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isEditing && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => {
                            const newProjects = portfolioData.projects.filter((_, i) => i !== index);
                            setPortfolioData({ ...portfolioData, projects: newProjects });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    {isEditing ? (
                      <>
                        <Input
                          value={project.title}
                          onChange={(e) => {
                            const newProjects = [...portfolioData.projects];
                            newProjects[index] = { ...project, title: e.target.value };
                            setPortfolioData({ ...portfolioData, projects: newProjects });
                          }}
                          className="mb-2"
                        />
                        <Textarea
                          value={project.description}
                          onChange={(e) => {
                            const newProjects = [...portfolioData.projects];
                            newProjects[index] = { ...project, description: e.target.value };
                            setPortfolioData({ ...portfolioData, projects: newProjects });
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                      </>
                    )}
                  </CardContent>
                </MotionCard>
              ))}
            </div>
          </CardContent>
          </MotionCard>
          {/* Experience Timeline */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience</CardTitle>
            {isEditing && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Experience</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const newExperience = {
                        role: formData.get('role'),
                        company: formData.get('company'),
                        period: formData.get('period'),
                        description: formData.get('description')
                      };
                      setPortfolioData({
                        ...portfolioData,
                        experience: [...portfolioData.experience, newExperience]
                      });
                      e.target.reset();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" name="role" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" name="company" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period">Period</Label>
                      <Input id="period" name="period" placeholder="e.g., 2020 - Present" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required />
                    </div>
                    <Button type="submit" className="w-full">Add Experience</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="relative space-y-8">
              {/* Vertical timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
              
              {portfolioData.experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-8 group"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 w-3 h-3 -translate-x-1/2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                  
                  <div className="relative">
                    {isEditing && (
                      <div className="absolute right-0 top-0 flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Experience</DialogTitle>
                            </DialogHeader>
                            <form className="space-y-4">
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                  value={exp.role}
                                  onChange={(e) => {
                                    const newExp = [...portfolioData.experience];
                                    newExp[index] = { ...exp, role: e.target.value };
                                    setPortfolioData({ ...portfolioData, experience: newExp });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Company</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => {
                                    const newExp = [...portfolioData.experience];
                                    newExp[index] = { ...exp, company: e.target.value };
                                    setPortfolioData({ ...portfolioData, experience: newExp });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Period</Label>
                                <Input
                                  value={exp.period}
                                  onChange={(e) => {
                                    const newExp = [...portfolioData.experience];
                                    newExp[index] = { ...exp, period: e.target.value };
                                    setPortfolioData({ ...portfolioData, experience: newExp });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => {
                                    const newExp = [...portfolioData.experience];
                                    newExp[index] = { ...exp, description: e.target.value };
                                    setPortfolioData({ ...portfolioData, experience: newExp });
                                  }}
                                />
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newExp = portfolioData.experience.filter((_, i) => i !== index);
                            setPortfolioData({ ...portfolioData, experience: newExp });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      {exp.role}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {exp.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {exp.period}
                      </div>
                    </div>
                    <p className="mt-2">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </MotionCard>

        {/* Social Links */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CardHeader>
            <CardTitle>Connect With Me</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                github: { icon: Github, label: "GitHub" },
                twitter: { icon: Twitter, label: "Twitter" },
                instagram: { icon: Instagram, label: "Instagram" },
                linkedin: { icon: Linkedin, label: "LinkedIn" }
              }).map(([key, { icon: Icon, label }]) => (
                <div key={key} className="flex items-center gap-4">
                  <Icon className="w-5 h-5" />
                  {isEditing ? (
                    <Input
                      value={portfolioData.social_links[key] || ''}
                      onChange={(e) => {
                        setPortfolioData({
                          ...portfolioData,
                          social_links: {
                            ...portfolioData.social_links,
                            [key]: e.target.value
                          }
                        });
                      }}
                      placeholder={`${label} URL`}
                    />
                  ) : portfolioData.social_links[key] ? (
                    <a
                      href={portfolioData.social_links[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {portfolioData.social_links[key]}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not connected</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
};

export default AgentPortfolio;