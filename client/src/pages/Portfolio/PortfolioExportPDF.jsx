import { useState, useEffect, useMemo } from 'react';
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';
import { supabase } from '@/utils/supabase';

const PortfolioExportPDF = ({ 
  userid, 
  buttonVariant = "outline", 
  buttonSize = "default" 
}) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Enhanced PDF styles with improved typography and layout
  const styles = useMemo(() => StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.6,
      color: '#333333',
      border: 2, // Add border width
      borderColor: '#007bff', // Border color matching header
      borderStyle: 'solid', // Solid border style
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    },
    header: {
      flexDirection: 'column',
      alignItems: 'right',
      marginBottom: 5,
      paddingBottom: 5,
      borderBottomWidth: 2,
      borderBottomColor: '#007bff',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: 5,
    },
    headerContact: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 15,
      fontSize: 9,
      color: '#666666',
    },
    section: {
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: 10,
      paddingBottom: 5,
      borderBottomWidth: 1.5,
      borderBottomColor: '#E0E0E0',
    },
    sectionContent: {
      paddingLeft: 10,
    },
    bioText: {
      fontSize: 10,
      color: '#444444',
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    skillTag: {
      backgroundColor: '#E6F2FF',
      color: '#007bff',
      padding: 3,
      borderRadius: 3,
      fontSize: 8,
      paddingHorizontal: 6,
    },
    experienceItem: {
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    experienceRole: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#333333',
    },
    experiencePeriod: {
      fontSize: 9,
      color: '#666666',
    },
    experienceDescription: {
      fontSize: 9,
      color: '#444444',
    },
    projectItem: {
      marginBottom: 10,
    },
    projectTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 5,
    },
    projectDescription: {
      fontSize: 9,
      color: '#444444',
    },
  }), []);

  // PDF Document Component with improved layout
  const PortfolioPDFDocument = useMemo(() => {
    if (!portfolioData) return null;

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {portfolioData.profile?.fullname || 'Your Name'}
              </Text>
              <View style={styles.headerContact}>
                <Text>{portfolioData.profile?.email || 'Email'}</Text>
                <Text>{portfolioData.portfolio?.social_links?.linkedin || 'LinkedIn'}</Text>
                <Text>{portfolioData.portfolio?.social_links?.github || 'GitHub'}</Text>
              </View>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.bioText}>
                  {portfolioData.portfolio?.bio || 'No bio available.'}
                </Text>
              </View>
            </View>

            {/* Skills Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {portfolioData.portfolio?.skills?.map((skill, index) => (
                  <Text key={index} style={styles.skillTag}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>

            {/* Professional Experience */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Experience</Text>
              <View style={styles.sectionContent}>
                {portfolioData.portfolio?.experience?.map((exp, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <Text style={styles.experienceRole}>
                        {exp.role} at {exp.company}
                      </Text>
                      <Text style={styles.experiencePeriod}>
                        {exp.period}
                      </Text>
                    </View>
                    <Text style={styles.experienceDescription}>
                      {exp.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Projects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              <View style={styles.sectionContent}>
                {portfolioData.portfolio?.projects?.map((proj, index) => (
                  <View key={index} style={styles.projectItem}>
                    <Text style={styles.projectTitle}>{proj.title}</Text>
                    <Text style={styles.projectDescription}>
                      {proj.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }, [portfolioData, styles]);

  // Fetch portfolio data (same as before)
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userid)
          .single();

        if (profileError) throw profileError;

        // Fetch or create portfolio
        const { data: existingPortfolioData, error: portfolioError } = await supabase
          .from('portfolio')
          .select('*')
          .eq('user_id', userid)
          .single();

        const portfolioData = portfolioError 
          ? {
              user_id: userid,
              title: 'Professional Portfolio',
              bio: 'A dedicated professional seeking new opportunities.',
              skills: ['Communication', 'Problem Solving', 'Teamwork'],
              projects: [],
              experience: [],
              social_links: {}
            }
          : existingPortfolioData;

        const { data: insertedData, error: insertError } = portfolioError
          ? await supabase
              .from('portfolio')
              .insert(portfolioData)
              .select()
              .single()
          : { data: portfolioData };

        if (insertError) throw insertError;
          
        setPortfolioData({
          profile: profileData,
          portfolio: insertedData
        });
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userid]);

  // PDF Export Handler
  const handlePdfExport = async () => {
    if (!portfolioData) {
      alert('Portfolio data is not ready. Please wait and try again.');
      return;
    }

    try {
      setIsExporting(true);
      
      // Generate PDF Blob
      const blob = await pdf(PortfolioPDFDocument).toBlob();
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${portfolioData.profile?.fullname || 'Portfolio'}_Portfolio.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading portfolio: {error}
      </div>
    );
  }  

  return (
    <Button
      onClick={handlePdfExport}
      variant={buttonVariant}
      size={buttonSize}
      disabled={loading || isExporting}
      className="flex items-center gap-2"
    >
      {isExporting ? 'Preparing PDF...' : (
        <>
          <Download className="w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  );
};

PortfolioExportPDF.propTypes = {
  userid: PropTypes.string.isRequired,
  buttonVariant: PropTypes.string,
  buttonSize: PropTypes.string
};

export default PortfolioExportPDF;