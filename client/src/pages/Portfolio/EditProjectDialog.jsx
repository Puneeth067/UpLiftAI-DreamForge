import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose  } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { supabase } from '@/utils/supabase'; // Adjust the import path as needed
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '@/contexts/ThemeContext';

const EditProjectDialog = ({ project, onEdit, userId }) => {
  const { isDarkMode, loadUserTheme } = useTheme();
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
        <Button variant="ghost" className="bg-white dark:bg-black" size="icon">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-image">Project Image</Label>
            <div className="flex flex-col items-center gap-4">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <Input
                id="project-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <DialogClose asChild>
            <Button type="submit" disabled={isLoading} className="w-full"  onClick={handleSubmit}>
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