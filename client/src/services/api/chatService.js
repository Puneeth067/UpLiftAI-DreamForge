// services/api/chatService.js
import { chat } from '@/utils/supabase-chat';

export const chatService = {
  // Fetch messages for a specific ticket
  async getMessages(ticketId) {
    const { data, error } = await chat
      .from('messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // In chatService.js
async sendMessage({ ticketId, senderId, receiverId, content, messageType = 'text' }) {
  const { data, error } = await chat
    .from('messages')
    .insert([
      {
        ticket_id: ticketId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        message_type: messageType
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
},

  // Subscribe to new messages for a ticket
  subscribeToMessages(ticketId, callback) {
    return chat
      .channel(`messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  // Mark messages as read
  async markMessagesAsRead(ticketId, userId) {
    const { error } = await chat
      .from('messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },
};
