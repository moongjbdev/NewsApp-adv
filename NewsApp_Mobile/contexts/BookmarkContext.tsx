import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { bookmarksAPI } from '@/services/api';

interface BookmarkContextType {
  bookmarkedIds: Set<string>;
  addBookmark: (articleId: string) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  refreshBookmarks: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  const refreshBookmarks = async () => {
    try {
      if (isAuthenticated) {
        // Fetch from backend
        const response = await bookmarksAPI.getBookmarks(1, 1000); // Get all bookmarks
        const bookmarks = response.data.bookmarks;
        const ids = new Set(bookmarks.map((bookmark: any) => bookmark.article_id)) as Set<string>;
        setBookmarkedIds(ids);
      } else {
        // Fallback to local storage
        const bookmarks = await AsyncStorage.getItem('bookmark');
        if (bookmarks) {
          const bookmarkList = JSON.parse(bookmarks);
          const ids = new Set(bookmarkList.map((item: any) => item.article_id)) as Set<string>;
          setBookmarkedIds(ids);
        } else {
          setBookmarkedIds(new Set());
        }
      }
    } catch (error) {
      console.log('Error refreshing bookmarks:', error);
      // Fallback to local storage if backend fails
      const bookmarks = await AsyncStorage.getItem('bookmark');
      if (bookmarks) {
        const bookmarkList = JSON.parse(bookmarks);
        const ids = new Set(bookmarkList.map((item: any) => item.article_id)) as Set<string>;
        setBookmarkedIds(ids);
      } else {
        setBookmarkedIds(new Set());
      }
    }
  };

  const addBookmark = (articleId: string) => {
    setBookmarkedIds(prev => new Set([...prev, articleId]));
  };

  const removeBookmark = (articleId: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(articleId);
      return newSet;
    });
  };

  const isBookmarked = (articleId: string) => {
    return bookmarkedIds.has(articleId);
  };

  useEffect(() => {
    refreshBookmarks();
  }, [isAuthenticated]);

  const value: BookmarkContextType = {
    bookmarkedIds,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refreshBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}; 