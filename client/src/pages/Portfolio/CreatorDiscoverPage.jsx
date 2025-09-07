import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  X,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import LoadingScreen from '@/components/ui/loading';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SidebarContent from '@/components/layout/Sidebar/Sidebar';
import CyberCursorEffect from '@/components/ui/CyberCursorEffect';

const BackgroundSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1440 900"
  >
    <defs>
      <radialGradient id="lightGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#F0F4FF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#FAFAFF" stopOpacity="0.2" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
      </radialGradient>

      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#111827" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0A0F1C" stopOpacity="0.2" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="60" />
      </filter>

      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary/30 dark:text-primary/20" opacity="0.3" />
      </pattern>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="300" cy="200" r="600" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <path d="M1440,600 Q720,800 0,600 Q720,400 1440,600" fill="url(#accentGradient)" opacity="0.25" />
      <ellipse cx="1100" cy="500" rx="700" ry="400" fill="url(#lightGradient)" opacity="0.2" filter="url(#blurFilter)" />
      <circle cx="800" cy="750" r="400" fill="url(#accentGradient)" opacity="0.15" filter="url(#blurFilter)" />
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
  '3D Modeling',
  'Aerial Engineering',
  'Aerospace Engineering',
  'Aerospace Research',
  'AR/VR Development',
  'Artificial Intelligence',
  'Audio Engineering',
  'Bioinformatics',
  'Biotechnology',
  'Blockchain Technology',
  'Brand Strategy',
  'Cinematography',
  'Civil Engineering',
  'Cloud Computing',
  'Cloud Solutions',
  'Composition',
  'Content Strategy',
  'Copywriting',
  'Creative Direction',
  'Creative Technology',
  'Creative Writing',
  'Cybersecurity',
  'Data Science',
  'DevOps',
  'Digital Art',
  'Digital Marketing',
  'Digital Performance',
  'Electrical Engineering',
  'Environmental Science',
  'Film Production',
  'Filmmaking',
  'Game Design',
  'Generative AI',
  'Graphic Design',
  'Illustration',
  'Immersive Experience Design',
  'Industrial Design',
  'Information Security',
  'Innovation Consulting',
  'Interactive Media',
  'IoT Design',
  'IT Support',
  'Machine Learning',
  'Mechanical Engineering',
  'Mobile App Development',
  'Motion Graphics',
  'Music Production',
  'Network Administration',
  'Network Engineering',
  'Performance Art',
  'Podcasting',
  'Product Management',
  'Quantum Computing',
  'Quantum Technology',
  'Robotics Engineering',
  'Software Engineering',
  'Sound Design',
  'Systems Architecture',
  'Technical Documentation',
  'Technical Writing',
  'UI/UX Design',
  'Web Design',
  'Web Development'
];

const CreatorDiscoverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userData?.id;
  const [patron, setUserData] = useState(location.state?.userData);
  const { isDarkMode, loadUserTheme } = useTheme();
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [setIsCollapsed] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 40; // 40 cards per page (10 rows x 4 columns)

  // Pagination-related functions
  const calculateTotalPages = (items) => Math.ceil(items.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = (items) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    // Add a small delay before collapsing to make the interaction smoother
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400); // 300ms delay
    setHoverTimeout(timeout);
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, creatorsData] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('profiles').select('*').eq('usertype', 'agent'),
        ]);

        if (profileData.error || creatorsData.error) {
          throw new Error('Error fetching data');
        }

        // Fetch the skills data for each creator from the portfolio table
        const creatorSkillsData = await Promise.all(
          creatorsData.data.map(async (creator) => {
            const { data: portfolioData } = await supabase
              .from('portfolio')
              .select('skills')
              .eq('user_id', creator.id)
              .single();
            return { ...creator, skills: portfolioData?.skills || '' };
          })
        );

        setUserData(profileData);
        loadUserTheme(userId);
        setCreators(creatorSkillsData);
        setFilteredCreators(creatorSkillsData);

        toast({
          title: 'Explore Creators',
          description: 'Click on a creator card to view their portfolio!',
          variant: 'default',
          className: isDarkMode 
            ? 'bg-surface border-primary/50 text-foreground' 
            : 'bg-surface border-primary/50 text-foreground'
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
          className: isDarkMode 
            ? 'bg-surface border-red-500/50 text-foreground' 
            : 'bg-surface border-red-500/50 text-foreground'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadUserTheme, userId, isDarkMode]);

  const handleDepartmentFilter = (dept) => {
    setSelectedDepartment(dept);
    setCurrentPage(1); // Reset to first page when filtering
    applyFilters(dept, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    applyFilters(selectedDepartment, query);
  };

  const applyFilters = (department, query) => {
    let result = creators;

    // Filter by department
    if (department !== 'All Departments') {
      result = result.filter((creator) => creator.department === department);
    }

    // Filter by search query
    if (query) {
      result = result.filter((creator) => 
        creator.fullname.toLowerCase().includes(query.toLowerCase()) ||
        creator.skills.toLowerCase().includes(query.toLowerCase()) ||
        creator.department.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredCreators(result);
  };

  const clearFilters = () => {
    setSelectedDepartment('All Departments');
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page
    setFilteredCreators(creators);
  };

  // Pagination Handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = calculateTotalPages(filteredCreators);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const DiscoverHeader = ({ 
    isDarkMode, 
    selectedDepartment, 
    searchQuery, 
    clearFilters 
  }) => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex top-0 justify-between items-center mb-6"
      >
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`text-3xl font-bold ${isDarkMode ? 'text-primary' : 'text-primary'}`}
        >
          Discover Creators
        </motion.h1>
        
        {(selectedDepartment !== 'All Departments' || searchQuery) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className={`flex items-center space-x-2 p-2 rounded-md transition-all duration-300 ${
              isDarkMode 
                ? 'bg-primary/20 hover:bg-primary/30 text-primary' 
                : 'bg-primary/10 hover:bg-primary/20 text-primary'
            }`}
          >
            <X className="w-5 h-5" />
            <span>Clear Filters</span>
          </motion.button>
        )}
      </motion.div>
    );
  };

  DiscoverHeader.propTypes = {
    isDarkMode: PropTypes.bool.isRequired,
    selectedDepartment: PropTypes.string.isRequired,
    searchQuery: PropTypes.string.isRequired,
    clearFilters: PropTypes.func.isRequired,
  };

  // Pagination Component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPreviousPage, 
    onNextPage,
    isDarkMode 
  }) => {
    return (
      <div className="flex justify-center items-center space-x-2">
        <button 
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-md transition-all ${
            currentPage === 1 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-primary/10'
          } ${
            isDarkMode 
              ? 'text-primary bg-surface' 
              : 'text-primary bg-surface'
          }`}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <span className={`text-sm ${isDarkMode ? 'text-foreground/80' : 'text-foreground/80'}`}>
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md transition-all ${
            currentPage === totalPages 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-primary/10'
          } ${
            isDarkMode 
              ? 'text-primary bg-surface' 
              : 'text-primary bg-surface'
          }`}
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  };

  PaginationControls.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPreviousPage: PropTypes.func.isRequired,
    onNextPage: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
  };

  // Prepare paginated creators
  const totalPages = calculateTotalPages(filteredCreators);
  const paginatedCreators = getCurrentPageItems(filteredCreators);

  return (
    <div className={`min-h-screen flex flex-col pl-20 pr-16 mx-auto min-w-[1240px] max-w-[1024] w-full ${isDarkMode ? 'bg-background text-foreground' : 'bg-background text-foreground'} cursor-none`}>
      <BackgroundSVG />
      <CyberCursorEffect />
        <Toaster />
      <aside 
        className={`hidden md:block fixed left-0 top-0 h-full border-r shrink-0 z-30 transition-all duration-600 ease-in-out ${
          isDarkMode 
            ? 'border-primary/30 bg-surface/80' 
            : 'border-primary/20 bg-surface/80'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent 
        userId={userId}
        isDarkMode={isDarkMode}
        />
      </aside>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-10 pt-4 ${isDarkMode ? 'bg-background' : 'bg-background'}`}>
        <div className="container mx-auto px-4 max-w-screen-xl">
          <DiscoverHeader
            isDarkMode={isDarkMode}
            selectedDepartment={selectedDepartment}
            searchQuery={searchQuery}
            clearFilters={clearFilters}
          />
          
          {/* Filters Container */}
          <div className="flex flex-wrap space-x-4 mb-4">
            {/* Department Filter */}
            <div className="flex-grow basis-full sm:basis-auto">
              <Select
                onValueChange={handleDepartmentFilter}
                value={selectedDepartment}
              >
                <SelectTrigger
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-surface border-primary/30 text-foreground'
                      : 'bg-white border-primary/30 text-foreground'
                  }`}
                >
                  <Filter className="mr-2 w-4 h-4 text-secondary" />
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-surface border-primary/30' : 'bg-white border-primary/30'}>
                  <SelectItem value="All Departments">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Search Input */}
            <div className="flex-grow basis-full sm:basis-auto relative">
              <Input
                type="text"
                placeholder="Search creators, skills, departments"
                value={searchQuery}
                onChange={handleSearchChange}
                className={`w-full pl-10 ${
                  isDarkMode
                    ? 'bg-surface border-primary/30 text-foreground placeholder:text-foreground/50'
                    : 'bg-white border-primary/30 text-foreground placeholder:text-foreground/50'
                }`}
              />
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-secondary' : 'text-secondary'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto w-full pt-4">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <LoadingScreen />
          ) : filteredCreators.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedCreators.map((creator) => (
                  <Card
                    key={creator.id}
                    className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
                      isDarkMode 
                        ? 'bg-surface border-primary/30 hover:border-primary' 
                        : 'bg-white border-primary/20 hover:border-primary'
                    }`}
                    onClick={() => {
                      navigate('/portfolio', { 
                        state: { 
                          creator: creator, 
                          patron: patron, 
                          viewMode: 'patron', 
                          userId: creator.id  
                        } 
                      });
                    }}
                  >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <img
                        src={`${creator.avatar_url.startsWith('http') 
                          ? creator.avatar_url 
                          : `https://byoenyaekxtufmzsfqxq.supabase.co/storage/v1/object/public/user-avatars/avatars/${creator.avatar_url}`}`}
                        alt={creator.full_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
                      />
                      <CardTitle className={isDarkMode ? 'text-primary' : 'text-primary'}>
                        {creator.fullname}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-foreground/70' : 'text-foreground/70'}`}>
                       {creator.department}
                    </p>
                    <div className={`text-xs p-2 rounded ${
                      isDarkMode
                        ? 'bg-primary/20 text-primary'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      Skills: {creator.skills.length > 0
                        ? creator.skills.map((skill, index) => (
                            <span key={index} className={`${index > 0 ? 'ml-1' : ''}`}>
                              {skill}
                            </span>
                          ))
                        : 'No skills available'}
                    </div>
                  </CardContent>
                  </Card>
                ))}
              </div>               
            </>
          ) : (
            <div className={`text-center p-8 rounded-lg ${
              isDarkMode 
                ? 'bg-surface text-foreground/80' 
                : 'bg-surface text-foreground/80'
            }`}>
              <p className="text-xl mb-4">
                {selectedDepartment !== 'All Departments' || searchQuery
                  ? `No creators found matching your search.`
                  : 'No creators available at the moment.'}
              </p>
              <button 
                onClick={clearFilters} 
                className={`px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary' 
                    : 'bg-primary/10 hover:bg-primary/20 text-primary'
                }`}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Pagination */}
      <div className={`relative bottom-2 w-full z-50 ${
        isDarkMode 
          ? 'bg-background/75' 
          : 'bg-background/90'
      }`}>
        <div className="container mx-auto px-4 max-w-screen-xl">
          {filteredCreators.length > 0 && (
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDiscoverPage;