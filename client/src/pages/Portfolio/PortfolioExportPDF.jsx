import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
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

        // Fetch portfolio data
        const { data: existingPortfolioData, error: portfolioError } = await supabase
          .from('portfolio')
          .select('*')
          .eq('user_id', userid)
          .single();

        if (portfolioError) {
          // Create default portfolio if none exists
          const defaultPortfolio = {
            user_id: userid,
            title: 'Professional Portfolio',
            bio: 'A dedicated professional seeking new opportunities.',
            skills: ['Communication', 'Problem Solving', 'Teamwork'],
            projects: [],
            experience: [],
            social_links: {}
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('portfolio')
            .insert(defaultPortfolio)
            .select()
            .single();

          if (insertError) throw insertError;
          
          setPortfolioData({
            profile: profileData,
            portfolio: insertedData
          });
        } else {
          setPortfolioData({
            profile: profileData,
            portfolio: existingPortfolioData
          });
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userid]);

  const generatePDF = async () => {
    if (!portfolioData) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Define page dimensions and styling
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const lineHeight = 8;
    let currentY = margin;

    // Set font styles
    doc.setFont('helvetica');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(28, 28, 28);
    doc.rect(0, 0, pageWidth, 297, 'F'); // Full background color

    // Header Section
    doc.setFontSize(20);
    doc.text(
      portfolioData.profile?.fullname || 'Your Name',
      margin,
      currentY
    );

    doc.setFontSize(12);
    currentY += lineHeight;
    doc.text(
      `${portfolioData.profile?.email || 'yourmail@example.com'} \t . \t ${portfolioData.portfolio?.social_links?.github || 'N/A'} \t . \t ${portfolioData.portfolio?.social_links?.linkedin || 'N/A'}`,
      margin,
      currentY
    );

    // Section Separator
    currentY += lineHeight;
    doc.setLineDash([2, 2], 0);
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // Bio Section
    currentY += lineHeight * 1.5;
    doc.setFontSize(14);
    doc.text('About Me', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    doc.setFontSize(12);
    currentY += lineHeight;
    const bioText = portfolioData.portfolio?.bio || 'No bio available.';
    const bioLines = doc.splitTextToSize(bioText, pageWidth - margin * 2);
    doc.text(bioLines, margin, currentY);
    currentY += lineHeight * bioLines.length;

    // Skills Section
    currentY += lineHeight * 1.5;
    doc.setFontSize(14);
    doc.text('Skills', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    doc.setFontSize(12);
    currentY += lineHeight;
    const skills = portfolioData.portfolio?.skills?.join(', ') || 'No skills listed.';
    doc.text(skills, margin, currentY);

    // Experience Section
    currentY += lineHeight * 1.5;
    doc.setFontSize(14);
    doc.text('Professional Experience', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    const experiences = portfolioData.portfolio?.experience || [];
    experiences.forEach(exp => {
      currentY += lineHeight;
      doc.setFontSize(12);
      doc.text(`${exp.role || 'Role'} - ${exp.company || 'Company'}`, margin, currentY);

      currentY += lineHeight * 0.5;
      doc.setFontSize(10);
      doc.text(`${exp.period || 'Time Period'}`, margin, currentY);

      currentY += lineHeight * 0.5;
      doc.setFontSize(10);
      const expDescription = doc.splitTextToSize(exp.description || 'No description.', pageWidth - margin * 2);
      doc.text(expDescription, margin, currentY);
      currentY += lineHeight * expDescription.length;
    });

    // Projects Section
    currentY += lineHeight * 1.5;
    doc.setFontSize(14);
    doc.text('Projects', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    const projects = portfolioData.portfolio?.projects || [];
    projects.forEach(proj => {
      currentY += lineHeight;
      doc.setFontSize(12);
      doc.text(proj.title || 'Untitled Project', margin, currentY);

      currentY += lineHeight * 0.5;
      doc.setFontSize(10);
      const projDescription = doc.splitTextToSize(proj.description || 'No description.', pageWidth - margin * 2);
      doc.text(projDescription, margin, currentY);
      currentY += lineHeight * projDescription.length;
    });

    // Save the PDF
    doc.save(`${portfolioData.profile?.fullname || 'Portfolio'}.pdf`);
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
      onClick={generatePDF}
      variant={buttonVariant}
      size={buttonSize}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export PDF
    </Button>
  );
};

PortfolioExportPDF.propTypes = {
  userid: PropTypes.string.isRequired,
  buttonVariant: PropTypes.string,
  buttonSize: PropTypes.string
};

export default PortfolioExportPDF;
