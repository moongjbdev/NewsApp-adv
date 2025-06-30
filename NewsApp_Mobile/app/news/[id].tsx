import { Colors } from '@/constants/Colors'
import { NewsDataType } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, findNodeHandle, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PUBLIC_API_KEY } from '@/constants/Config'
import axios from 'axios'
import { Loading } from '@/components/Loading'
import { getFakeContentByCategory } from '@/constants/ContentFake'
import Moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useBookmarks } from '@/contexts/BookmarkContext'
import { userAPI, newsAPI } from '@/services/api'
import BookmarkButton from '@/components/BookmarkButton'
import CommentSection from '@/components/CommentSection'

type Props = {
    newsList: NewsDataType | null
}

const NewsList = ({ newsList }: Props) => {
    const { colors } = useTheme();
    const { isAuthenticated } = useAuth();
    const { id } = useLocalSearchParams<{ id: string }>()
    const [newsDetail, setNewsDetail] = useState<NewsDataType | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const URL = `https://newsdata.io/api/1/latest?apikey=${PUBLIC_API_KEY}&id=${id}`;
                const response = await axios.get(URL);

                if (response && response.data && response.data.results?.length > 0) {
                    const article = response.data.results[0];
                    setNewsDetail(article);

                    // Track reading history and article view if authenticated
                    if (isAuthenticated) {
                        try {
                            // Add to reading history
                            await userAPI.addToReadingHistory({
                                article_id: article.article_id,
                                title: article.title,
                                description: article.description,
                                image_url: article.image_url,
                                source_name: article.source_name,
                                source_url: article.source_url,
                                link: article.link,
                                category: article.category,
                                pubDate: article.pubDate,
                                readingTime: Math.ceil(article.content?.length / 200) || 2, // Estimate reading time
                            });

                            // Track article view for analytics
                            await newsAPI.trackArticleView({
                                article_id: article.article_id,
                                category: article.category[0],
                                title: article.title,
                            });
                        } catch (error) {
                            console.log('Error tracking reading activity:', error);
                        }
                    }
                } else {
                    setNewsDetail(null);
                }
            } catch (error) {
                console.log('Error fetching news detail:', error);
                setNewsDetail(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, isAuthenticated]);

    const handleOpenLink = () => {
        if (newsDetail?.link) {
            Linking.openURL(newsDetail.link);
        }
    };

    return (
        <>
            <Stack.Screen options={{
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name='arrow-back' size={22} color={colors.black} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    newsDetail && <BookmarkButton newsItem={newsDetail} size={22} />
                ),
                title: '',
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.cardBackground,
                },
                headerTintColor: colors.black,
            }} />
            {
                isLoading ? (
                    <Loading size={'large'} />
                ) : newsDetail ? (
                    <ScrollView
                        style={[styles.container, { backgroundColor: colors.background }]}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {/* Article Content */}
                        <View style={styles.articleContainer}>
                            <Text style={[styles.title, { color: colors.black }]}>
                                {newsDetail.title}
                            </Text>
                            <View style={styles.newInfoWrapper}>
                                <Text style={[styles.newInfo, { color: colors.darkGrey }]}>
                                    {Moment(newsDetail.pubDate).format('MMMM DD, hh:mm')}
                                </Text>
                                <Text style={[styles.newInfo, { color: colors.darkGrey }]}>
                                    {newsDetail.source_name}
                                </Text>
                            </View>
                            <Image
                                source={{ uri: newsDetail.image_url }}
                                style={styles.newImage}
                                resizeMode="cover"
                            />
                            <Text style={[styles.newContent, { color: colors.black }]}>
                                {(getFakeContentByCategory(newsDetail.category[0] || "")) || newsDetail.description}
                            </Text>

                            {newsDetail.link && (
                                <TouchableOpacity
                                    style={[styles.readMoreButton, { backgroundColor: colors.tint }]}
                                    onPress={handleOpenLink}
                                >
                                    <Text style={[styles.readMoreText, { color: colors.white }]}>
                                        Đọc bài viết gốc
                                    </Text>
                                    <Ionicons name="open-outline" size={16} color={colors.white} />
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {/* Comments Section */}
                        <View style={styles.commentsContainer}>
                            <CommentSection article_id={newsDetail.article_id} />
                        </View>
                    </ScrollView>
                ) : (
                    <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                        <Ionicons name="alert-circle-outline" size={64} color={colors.lightGrey} />
                        <Text style={[styles.errorText, { color: colors.black }]}>
                            Không thể tải chi tiết tin tức
                        </Text>
                    </View>
                )
            }
        </>
    )
}

export default NewsList

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        marginHorizontal: 20,
        paddingBottom: 20
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginVertical: 10,
        letterSpacing: 0.6,
        lineHeight: 26,
    },
    newImage: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        marginBottom: 20,
    },
    newInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    newInfo: {
        fontSize: 12,
    },
    newContent: {
        fontSize: 16,
        letterSpacing: 0.8,
        lineHeight: 26,
        marginBottom: 20,
    },
    readMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
        marginTop: 10,
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    commentsContainer: {
        flex: 1,
        marginTop: 20,
        minHeight: 400,
    },
    articleContainer: {
        flex: 1,
        marginHorizontal: 20,
        paddingBottom: 20
    },
})