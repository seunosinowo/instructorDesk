import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  receiver: User;
}

export interface Conversation {
  partner: User;
  lastMessage: Message;
  messages: Message[];
}

class MessageService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/messages/users`, this.getAuthHeaders());
    return response.data;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await axios.get(`${API_URL}/messages/conversations`, this.getAuthHeaders());
    return response.data;
  }

  async getMessages(userId: string): Promise<Message[]> {
    const response = await axios.get(`${API_URL}/messages/conversation/${userId}`, this.getAuthHeaders());
    return response.data;
  }

  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const response = await axios.post(
      `${API_URL}/messages`,
      { receiverId, content },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await axios.put(
      `${API_URL}/messages/${messageId}`,
      { content },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await axios.delete(`${API_URL}/messages/${messageId}`, this.getAuthHeaders());
  }

  async getUnreadCount(): Promise<number> {
    // This would require implementing read status in the backend
    // For now, return 0
    return 0;
  }
}

export const messageService = new MessageService();