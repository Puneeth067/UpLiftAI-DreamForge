import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, CheckCircle, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';

const AvatarDialog = ({ 
  avatarDialogOpen, 
  setAvatarDialogOpen, 
  selectedAvatar, 
  setSelectedAvatar,
  userId,
  supabase,
  profile,
  setProfile,
  isDarkMode,
  toast,
  avatars 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const deleteOldAvatar = async (oldAvatarUrl) => {
    if (!oldAvatarUrl || !oldAvatarUrl.includes('user-avatars')) return;
    
    try {
      // Extract the file path from the URL
      const urlParts = oldAvatarUrl.split('user-avatars/');
      if (urlParts.length < 2) return;
      
      const filePath = `${urlParts[1]}`;
      
      const { error } = await supabase.storage
        .from('user-avatars')
        .remove([filePath]);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      throw error; // Propagate error to be handled by calling function
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
      return;
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);

    try {
      setIsUploading(true);

      // Delete old custom avatar if exists
      if (profile.is_custom_avatar && profile.avatar_url) {
        await deleteOldAvatar(profile.avatar_url);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const sanitizedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${userId}-${Date.now()}.${sanitizedExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error('Upload successful but no path returned');

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Failed to get public URL');

      // Update profile with new avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          is_custom_avatar: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setSelectedAvatar(publicUrl);
      setProfile(prev => ({
        ...prev,
        avatar_url: publicUrl,
        is_custom_avatar: true,
        updated_at: new Date().toISOString()
      }));

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleDeleteCustomAvatar = async () => {
    try {
      if (!profile.is_custom_avatar || !profile.avatar_url) {
        throw new Error('No custom avatar to delete');
      }

      // Delete the file from storage
      await deleteOldAvatar(profile.avatar_url);

      // Update profile to use default avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatars[0], // Set to first default avatar
          is_custom_avatar: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setSelectedAvatar(avatars[0]);
      setProfile(prev => ({
        ...prev,
        avatar_url: avatars[0],
        is_custom_avatar: false,
        updated_at: new Date().toISOString()
      }));

      toast({
        title: "Success",
        description: "Custom avatar deleted successfully",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } catch (error) {
      console.error('Error deleting custom avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete custom avatar",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    }
  };

  const handleAvatarSelect = async (avatar) => {
    try {
      // If user had a custom avatar, delete it when switching to default
      if (profile.is_custom_avatar && profile.avatar_url) {
        await deleteOldAvatar(profile.avatar_url);
      }
      
      // Update profile with selected default avatar
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: `https://byoenyaekxtufmzsfqxq.supabase.co/storage/v1/object/public/user-avatars/avatars/${avatar}`,
          is_custom_avatar: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setSelectedAvatar(avatar);
      setProfile(prev => ({
        ...prev,
        avatar_url: avatar,
        is_custom_avatar: false,
        updated_at: new Date().toISOString()
      }));

      setAvatarDialogOpen(false);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    }
  };

  return (
    <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>

        {/* Upload Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Upload Custom Avatar
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              {profile.is_custom_avatar && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteCustomAvatar}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Custom Avatar
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Max file size: 5MB
              </p>
            </div>
            
            {/* Preview Section */}
            {(previewUrl || (profile.is_custom_avatar && profile.avatar_url)) && (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl || profile.avatar_url}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {previewUrl ? 'Preview of new avatar' : 'Current custom avatar'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Default Avatars Section */}
        <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Default Avatars
        </h3>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-4 gap-4 p-4">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                className={`relative rounded-lg p-2 transition-all ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${
                  selectedAvatar === avatar ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={`https://byoenyaekxtufmzsfqxq.supabase.co/storage/v1/object/public/user-avatars/avatars/${avatar}`}
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
};

AvatarDialog.propTypes = {
  avatarDialogOpen: PropTypes.bool.isRequired,
  setAvatarDialogOpen: PropTypes.func.isRequired,
  selectedAvatar: PropTypes.string,
  setSelectedAvatar: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  supabase: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  setProfile: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  toast: PropTypes.func.isRequired,
  avatars: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AvatarDialog;