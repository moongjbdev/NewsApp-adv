import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { CommentType } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { commentsAPI } from '@/services/api';
import { Colors } from '@/constants/Colors';

interface CommentItemProps {
  comment: CommentType;
  onCommentUpdate: (commentId: string, newContent: string) => void;
  onCommentDelete: (commentId: string) => void;
  onReply: (commentId: string, username: string) => void;
  onLoadReplies: (commentId: string) => void;
  showReplies?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentUpdate,
  onCommentDelete,
  onReply,
  onLoadReplies,
  showReplies = false,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiked, setIsLiked] = useState(comment.likes.includes(user?.id || ''));
  const [isDisliked, setIsDisliked] = useState(comment.dislikes.includes(user?.id || ''));
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const isOwnComment = user?.id === comment.user._id;

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }

    setIsLoading(true);
    try {
      const response = await commentsAPI.toggleLike(comment._id);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likes);
      setDislikeCount(response.data.dislikes);
      if (response.data.isLiked && isDisliked) {
        setIsDisliked(false);
      }
    } catch (error) {
      console.log('Error toggling like:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }

    setIsLoading(true);
    try {
      const response = await commentsAPI.toggleDislike(comment._id);
      setIsDisliked(response.data.isDisliked);
      setLikeCount(response.data.likes);
      setDislikeCount(response.data.dislikes);
      if (response.data.isDisliked && isLiked) {
        setIsLiked(false);
      }
    } catch (error) {
      console.log('Error toggling dislike:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditContent(comment.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      Alert.alert('Lỗi', 'Nội dung bình luận không được để trống');
      return;
    }

    setIsLoading(true);
    try {
      await commentsAPI.updateComment(comment._id, { content: editContent.trim() });
      onCommentUpdate(comment._id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.log('Error updating comment:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật bình luận');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await commentsAPI.deleteComment(comment._id);
              onCommentDelete(comment._id);
            } catch (error) {
              console.log('Error deleting comment:', error);
              Alert.alert('Lỗi', 'Không thể xóa bình luận');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    const now = moment();
    const commentTime = moment(dateString);
    const diffMinutes = now.diff(commentTime, 'minutes');
    const diffHours = now.diff(commentTime, 'hours');
    const diffDays = now.diff(commentTime, 'days');

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return commentTime.format('DD/MM/YYYY');
  };

  if (isEditing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: colors.black }]}>
              {comment.user.fullName || comment.user.username}
            </Text>
            <Text style={[styles.timestamp, { color: colors.darkGrey }]}>
              {formatTime(comment.createdAt)}
            </Text>
          </View>
        </View>
        
        <TextInput
          style={[styles.editInput, { 
            color: colors.black,
            borderColor: colors.borderColor,
            backgroundColor: colors.background
          }]}
          value={editContent}
          onChangeText={setEditContent}
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.tint }]}
            onPress={handleSaveEdit}
            disabled={isLoading}
          >
            <Text style={[styles.editButtonText, { color: colors.white }]}>
              Lưu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.lightGrey }]}
            onPress={handleCancelEdit}
            disabled={isLoading}
          >
            <Text style={[styles.editButtonText, { color: colors.darkGrey }]}>
              Hủy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.black }]}>
            {comment.user.fullName || comment.user.username}
          </Text>
          <Text style={[styles.timestamp, { color: colors.darkGrey }]}>
            {formatTime(comment.createdAt)}
            {comment.isEdited && ' (đã chỉnh sửa)'}
          </Text>
        </View>
        
        {isOwnComment && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={16} color={colors.darkGrey} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Ionicons name="trash" size={16} color={colors.darkGrey} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={[styles.content, { color: colors.black }]}>
        {comment.content}
      </Text>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionItem, isLiked && styles.activeAction]}
          onPress={handleLike}
          disabled={isLoading}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={isLiked ? Colors.tint : colors.darkGrey}
          />
          <Text style={[styles.actionText, { 
            color: isLiked ? Colors.tint : colors.darkGrey 
          }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, isDisliked && styles.activeAction]}
          onPress={handleDislike}
          disabled={isLoading}
        >
          <Ionicons
            name={isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={16}
            color={isDisliked ? Colors.tint : colors.darkGrey}
          />
          <Text style={[styles.actionText, { 
            color: isDisliked ? Colors.tint : colors.darkGrey 
          }]}>
            {dislikeCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeAction: {
    // Additional styling for active state if needed
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CommentItem; 