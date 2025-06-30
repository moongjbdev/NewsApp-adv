export interface NotificationType {
  _id: string;
  user_id: string;
  type: NotificationCategory;
  title: string;
  message: string;
  data?: {
    article_id?: string;
    comment_id?: string;
    user_id?: string;
    category?: string;
    [key: string]: any;
  };
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationCategory = 
  | 'breaking_news'           // Tin tức nóng
  | 'comment_reply'           // Trả lời bình luận
  | 'comment_like'            // Like bình luận
  | 'comment_mention'         // Mention trong bình luận
  | 'bookmark_update'         // Cập nhật bookmark
  | 'daily_digest'            // Tóm tắt hàng ngày
  | 'trending_topic'          // Chủ đề trending
  | 'category_news'           // Tin tức theo category
  | 'reading_reminder'        // Nhắc nhở đọc
  | 'achievement'             // Thành tích đọc
  | 'system'                  // Thông báo hệ thống;

export interface NotificationPreferences {
  breaking_news: boolean;
  comment_replies: boolean;
  comment_likes: boolean;
  comment_mentions: boolean;
  bookmark_updates: boolean;
  daily_digest: boolean;
  trending_topics: boolean;
  category_news: boolean;
  reading_reminders: boolean;
  achievements: boolean;
  system_notifications: boolean;
  
  // Time preferences
  quiet_hours: {
    enabled: boolean;
    start_time: string; // "22:00"
    end_time: string;   // "08:00"
  };
  
  // Frequency
  digest_frequency: 'daily' | 'weekly' | 'never';
  max_notifications_per_day: number;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  preferences: NotificationPreferences;
} 