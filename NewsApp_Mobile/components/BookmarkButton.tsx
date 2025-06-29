import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { NewsDataType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { bookmarksAPI } from '@/services/api';

interface BookmarkButtonProps {
  newsItem: NewsDataType;
  size?: number;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  newsItem,
  size = 24,
  onBookmarkChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  const toggleBookmark = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isAuthenticated) {
        // Use backend
        if (isBookmarked(newsItem.article_id)) {
          await bookmarksAPI.removeBookmark(newsItem.article_id);
          removeBookmark(newsItem.article_id);
        } else {
          await bookmarksAPI.addBookmark({
            article_id: newsItem.article_id,
            title: newsItem.title,
            description: newsItem.description,
            image_url: newsItem.image_url,
            source_name: newsItem.source_name,
            source_url: newsItem.source_url,
            link: newsItem.link,
            category: newsItem.category,
            pubDate: newsItem.pubDate,
          });
          addBookmark(newsItem.article_id);
        }
        onBookmarkChange?.(!isBookmarked(newsItem.article_id));
      } else {
        // Use local storage
        const bookmarks = await AsyncStorage.getItem('bookmark');
        let bookmarkList: NewsDataType[] = bookmarks ? JSON.parse(bookmarks) : [];

        if (isBookmarked(newsItem.article_id)) {
          bookmarkList = bookmarkList.filter(item => item.article_id !== newsItem.article_id);
          removeBookmark(newsItem.article_id);
        } else {
          bookmarkList.push(newsItem);
          addBookmark(newsItem.article_id);
        }

        await AsyncStorage.setItem('bookmark', JSON.stringify(bookmarkList));
        onBookmarkChange?.(!isBookmarked(newsItem.article_id));
      }
    } catch (error) {
      console.log('Error toggling bookmark:', error);
      Alert.alert(
        'Lỗi',
        'Không thể cập nhật bookmark. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleBookmark}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <Ionicons
        name={isBookmarked(newsItem.article_id) ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={isBookmarked(newsItem.article_id) ? Colors.tint : Colors.darkGrey}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});

export default BookmarkButton; 