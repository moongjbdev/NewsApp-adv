import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { Link, router, Stack } from 'expo-router'
import { Loading } from '@/components/Loading'
import NewsItem from '@/components/NewsItem'
import { NewsDataType } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useBookmarks } from '@/contexts/BookmarkContext'
import { bookmarksAPI } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'

type Props = {}

const Page = (props: Props) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const { refreshBookmarks } = useBookmarks();
  const [bookmarkNews, setBookmarkNews] = useState<NewsDataType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [isAuthenticated])
  );

  const fetchBookmarks = async (page = 1) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Fetch from backend
        const response = await bookmarksAPI.getBookmarks(page, 20);
        const { bookmarks, pagination } = response.data;

        if (page === 1) {
          setBookmarkNews(bookmarks);
        } else {
          setBookmarkNews(prev => [...prev, ...bookmarks]);
        }

        setHasMore(page < pagination.totalPages);
        setCurrentPage(page);
      } else {
        // Fallback to local storage
        const token = await AsyncStorage.getItem('bookmark');
        if (token) {
          const res = JSON.parse(token);
          setBookmarkNews(Array.isArray(res) ? res : []);
        } else {
          setBookmarkNews([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error fetching bookmarks:', error);
      // Fallback to local storage if backend fails
      const token = await AsyncStorage.getItem('bookmark');
      if (token) {
        const res = JSON.parse(token);
        setBookmarkNews(Array.isArray(res) ? res : []);
      } else {
        setBookmarkNews([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreBookmarks = () => {
    if (hasMore && !isLoading && isAuthenticated) {
      fetchBookmarks(currentPage + 1);
    }
  };

  const handleRemoveBookmark = async (article_id: string) => {
    try {
      if (isAuthenticated) {
        await bookmarksAPI.removeBookmark(article_id);
        setBookmarkNews(prev => prev.filter(item => item.article_id !== article_id));
        // Refresh bookmark context to update all screens
        await refreshBookmarks();
      } else {
        // Remove from local storage
        const bookmarks = await AsyncStorage.getItem('bookmark');
        if (bookmarks) {
          const bookmarkList: NewsDataType[] = JSON.parse(bookmarks);
          const updatedBookmarks = bookmarkList.filter(item => item.article_id !== article_id);
          await AsyncStorage.setItem('bookmark', JSON.stringify(updatedBookmarks));
          setBookmarkNews(updatedBookmarks);
          // Refresh bookmark context to update all screens
          await refreshBookmarks();
        }
      }
    } catch (error) {
      console.log('Error removing bookmark:', error);
      Alert.alert('Lỗi', 'Không thể xóa bookmark. Vui lòng thử lại.');
    }
  };

  const renderNewsItem = ({ item }: { item: NewsDataType }) => {
    return (
      <View style={styles.newsItemContainer}>
        <Link href={`/news/${item.article_id}`} asChild>
          <TouchableOpacity style={styles.newsLink}>
            <NewsItem item={item} />
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveBookmark(item.article_id)}
        >
          <Ionicons name="close-circle" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={colors.lightGrey} />
      <Text style={[styles.emptyTitle, { color: colors.black }]}>
        Chưa có tin tức yêu thích
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.darkGrey }]}>
        {isAuthenticated
          ? 'Bạn có thể bookmark tin tức để đọc sau và đồng bộ giữa các thiết bị'
          : 'Bạn có thể bookmark tin tức để đọc sau'
        }
      </Text>
      {!isAuthenticated && (
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            router.push('/auth/login');
          }}
        >
          <Text style={[styles.loginButtonText, { color: colors.white }]}>
            Đăng nhập để đồng bộ
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerLeft: () => null,
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTintColor: colors.black,
      }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {
          isLoading ? (
            <Loading size={'large'} />
          ) : (
            <FlatList
              data={bookmarkNews.filter(Boolean)}
              keyExtractor={(item) => item.article_id}
              showsVerticalScrollIndicator={false}
              renderItem={renderNewsItem}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={5}
              onEndReached={loadMoreBookmarks}
              onEndReachedThreshold={0.1}
            />
          )
        }
      </View>
    </>
  )
}

export default Page

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20
  },
  newsItemContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  newsLink: {
    flex: 1,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 20,
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
})