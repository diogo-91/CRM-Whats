export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  lastMessageTime: string;
  unreadCount: number;
  lastMessagePreview?: string;
  tags: Tag[];
  assignedTo: string; // e.g., "Hebrain"
  status: 'online' | 'offline';
}

export interface Tag {
  color: 'red' | 'green' | 'blue' | 'yellow' | 'gray';
  label?: string;
}

export interface Column {
  id: string;
  title: string;
  count: number;
  color: string;
  items: Contact[];
}

export interface GeminiResponse {
  suggestion: string;
}

export interface Appointment {
  id: string;
  title: string;
  contactName: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'call' | 'meeting' | 'demo';
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

export interface Broadcast {
  id: string;
  name: string;
  message: string;
  targetTags: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  scheduledDate?: string;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
  };
}