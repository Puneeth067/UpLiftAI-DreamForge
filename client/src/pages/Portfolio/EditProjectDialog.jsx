import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose  } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '@/contexts/ThemeContext';

const EditProjectDialog = ({ project, onEdit, userId }) => {
  const { isDarkMode } = useTheme();
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(project.image);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const uploadProjectImage = async (file, userId) => {
    try {
      if (!file) return project.image;

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const currentDate = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${uuidv4()}_${currentDate}.${fileExt}`;
      const filePath = `${userId}/projects/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return project.image;
    }
  };

  const deleteProjectImage = async (imageUrl) => {
    try {
      if (!imageUrl || imageUrl.startsWith('/api/placeholder')) return;

      // Extract the file path from the URL
      const filePath = imageUrl.split('/').slice(-2).join('/');

      const { error } = await supabase.storage
        .from('project-images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If a new image is selected, upload it and delete the old one
      let newImageUrl = preview;
      if (imageFile) {
        // Delete the old image from storage
        await deleteProjectImage(project.image);
        
        // Upload the new image
        newImageUrl = await uploadProjectImage(imageFile, userId);
      }

      const editedProject = {
        ...project,
        title,
        description,
        image: newImageUrl
      };

      onEdit(editedProject);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error editing project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className={`${
            isDarkMode 
              ? 'bg-surface hover:bg-primary/20 text-foreground' 
              : 'bg-white hover:bg-primary/10 text-foreground'
          } border border-primary/30`} 
          size="icon"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[425px] ${
        isDarkMode 
          ? 'bg-surface border-primary/30 text-foreground' 
          : 'bg-white border-primary/20 text-foreground'
      }`}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-foreground' : 'text-foreground'}>
            Edit Project
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="project-image" 
              className={isDarkMode ? 'text-foreground/80' : 'text-foreground/80'}
            >
              Project Image
            </Label>
            <div className="flex flex-col items-center gap-4">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-primary/30"
                />
              )}
              <Input
                id="project-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full ${
                  isDarkMode 
                    ? 'bg-background border-primary/30 text-foreground file:bg-primary/20 file:text-primary file:border-primary/30' 
                    : 'bg-white border-primary/30 text-foreground file:bg-primary/10 file:text-primary file:border-primary/30'
                }`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label 
              htmlFor="title" 
              className={isDarkMode ? 'text-foreground/80' : 'text-foreground/80'}
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${
                isDarkMode 
                  ? 'bg-background border-primary/30 text-foreground placeholder:text-foreground/50 focus:border-primary' 
                  : 'bg-white border-primary/30 text-foreground placeholder:text-foreground/50 focus:border-primary'
              }`}
              required
            />
          </div>
          <div className="space-y-2">
            <Label 
              htmlFor="description" 
              className={isDarkMode ? 'text-foreground/80' : 'text-foreground/80'}
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${
                isDarkMode 
                  ? 'bg-background border-primary/30 text-foreground placeholder:text-foreground/50 focus:border-primary' 
                  : 'bg-white border-primary/30 text-foreground placeholder:text-foreground/50 focus:border-primary'
              }`}
              required
            />
          </div>
          <DialogClose asChild>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full ${
                isDarkMode
                  ? 'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50'
                  : 'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50'
              }`}
              onClick={handleSubmit}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogClose>          
        </form>
      </DialogContent>
    </Dialog>
  );
};

EditProjectDialog.propTypes = {
  project: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired
};

export default EditProjectDialog;