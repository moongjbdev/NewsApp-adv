import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommentType } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { commentsAPI } from '@/services/api';
import CommentItem from './CommentItem';
import { Colors } from '@/constants/Colors';

interface CommentSectionProps {
  article_id: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ article_id }) => {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<Record<string, CommentType[]>>({});

  const fetchComments = useCallback(async (page = 1, refresh = false) => {
    if (page === 1 && !refresh) {
      setIsInitialLoading(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await commentsAPI.getComments(article_id, page, 20, sortBy);
      const { comments: newComments, pagination } = response.data;

      if (refresh || page === 1) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }

      setHasMore(page < pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.log('Error fetching comments:', error);
      Alert.alert('Lỗi', 'Không thể tải bình luận');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [article_id, sortBy]);

  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const response = await commentsAPI.getReplies(commentId, 1, 10);
      const { replies: newReplies } = response.data;
      setReplies(prev => ({ ...prev, [commentId]: newReplies }));
    } catch (error) {
      console.log('Error fetching replies:', error);
    }
  }, []);

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await commentsAPI.addComment({
        article_id,
        content: newComment.trim(),
      });

      const newCommentData = response.data.comment;
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
    } catch (error) {
      console.log('Error adding comment:', error);
      Alert.alert('Lỗi', 'Không thể đăng bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (commentId: string, newContent: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment._id === commentId
          ? { ...comment, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
          : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };

  const handleReply = (commentId: string, username: string) => {
    setNewComment(`@${username} `);
    // Focus on input (you might need to add ref to TextInput)
  };

  const handleLoadReplies = (commentId: string) => {
    const isExpanded = expandedReplies.has(commentId);
    if (isExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      setExpandedReplies(prev => new Set(prev).add(commentId));
      if (!replies[commentId]) {
        fetchReplies(commentId);
      }
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchComments(currentPage + 1);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComments(1, true);
    setRefreshing(false);
  };

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'mostLiked') => {
    setSortBy(newSort);
    setComments([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchComments(1, true);
  };

  useEffect(() => {
    if (article_id) {
      fetchComments(1, true);
    }
  }, [article_id]);

  const renderSortButtons = () => (
    <View style={styles.sortContainer}>
      <Text style={[styles.sortLabel, { color: colors.darkGrey }]}>Sắp xếp:</Text>
      {(['newest', 'oldest', 'mostLiked'] as const).map(sort => (
        <TouchableOpacity
          key={sort}
          style={[
            styles.sortButton,
            sortBy === sort && { backgroundColor: colors.tint }
          ]}
          onPress={() => handleSortChange(sort)}
        >
          <Text style={[
            styles.sortButtonText,
            { color: sortBy === sort ? colors.white : colors.darkGrey }
          ]}>
            {sort === 'newest' ? 'Mới nhất' : sort === 'oldest' ? 'Cũ nhất' : 'Nhiều like'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={48} color={colors.lightGrey} />
      <Text style={[styles.emptyText, { color: colors.darkGrey }]}>
        Chưa có bình luận nào
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.lightGrey }]}>
        Hãy là người đầu tiên bình luận về bài viết này
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={[styles.emptyText, { color: colors.darkGrey, marginTop: 16 }]}>
        Đang tải bình luận...
      </Text>
    </View>
  );

  // Don't show empty state immediately, wait a bit
  const shouldShowEmptyState = comments.length === 0 && !isInitialLoading && !isLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.black }]}>
          Bình luận ({comments.length})
        </Text>
        {renderSortButtons()}
      </View>

      {isInitialLoading ? (
        renderLoadingState()
      ) : (
        <ScrollView
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (layoutMeasurement.height + contentOffset.y >= 
                contentSize.height - paddingToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {comments.map((comment) => (
            <View key={comment._id}>
              <CommentItem
                comment={comment}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
                onReply={handleReply}
                onLoadReplies={handleLoadReplies}
                showReplies={expandedReplies.has(comment._id)}
              />
              {expandedReplies.has(comment._id) && replies[comment._id] && (
                <View style={styles.repliesContainer}>
                  {replies[comment._id].map(reply => (
                    <View key={reply._id} style={styles.replyItem}>
                      <CommentItem
                        comment={reply}
                        onCommentUpdate={handleCommentUpdate}
                        onCommentDelete={handleCommentDelete}
                        onReply={handleReply}
                        onLoadReplies={() => {}}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          
          {shouldShowEmptyState && renderEmptyState()}
          
          {isLoading && currentPage > 1 && (
            <ActivityIndicator size="small" color={colors.tint} style={styles.loadingMore} />
          )}
        </ScrollView>
      )}

      {isAuthenticated && (
        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
          <TextInput
            style={[styles.input, { 
              color: colors.black,
              borderColor: colors.borderColor,
              backgroundColor: colors.background
            }]}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Viết bình luận..."
            placeholderTextColor={colors.darkGrey}
            multiline
            maxLength={1000}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: newComment.trim() ? colors.tint : colors.lightGrey }
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {!isAuthenticated && (
        <View style={[styles.loginPrompt, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.loginText, { color: colors.darkGrey }]}>
            Đăng nhập để bình luận
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 500,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  repliesContainer: {
    marginLeft: 32,
    marginTop: 8,
  },
  replyItem: {
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingMore: {
    padding: 16,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  loginText: {
    fontSize: 14,
  },
});

export default CommentSection; 