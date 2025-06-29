import { NewsDataType } from '@/types'
import axios from 'axios'
import { Link, router, Stack, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PUBLIC_API_KEY } from '@/constants/Config'
import { Ionicons } from '@expo/vector-icons'
import { Loading } from '@/components/Loading'
import NewsItem from '@/components/NewsItem'
import { useTheme } from '@/contexts/ThemeContext'
import ErrorView from '@/components/ErrorView'

const search = () => {
    const { colors } = useTheme();
    const { query, category, country } = useLocalSearchParams<{ query: string, category: string, country: string }>()
    const [news, setNews] = useState<NewsDataType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getNews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let url = `https://newsdata.io/api/1/latest?apikey=${PUBLIC_API_KEY}&image=1&removeduplicate=1&size=10`
            if (category) url += `&category=${category}`
            if (country) url += `&country=${country}`
            if (query) url += `&q=${query}`

            const response = await axios.get(url)
            if (response && response.data) {
                setNews(response.data.results)
            }
        } catch (error: any) {
            setError('Không thể tải kết quả tìm kiếm');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getNews();
    }, [query, category, country])

    const renderNewsItem = ({ item }: { item: NewsDataType }) => (
        <Link href={`/news/${item.article_id}`} asChild>
            <TouchableOpacity style={styles.newsItemContainer}>
                <NewsItem item={item} />
            </TouchableOpacity>
        </Link>
    );

    return (
        <>
            <Stack.Screen options={{
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name='arrow-back' size={22} color={colors.black} />
                    </TouchableOpacity>
                ),
                title: 'Tìm Kiếm',
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.cardBackground,
                },
                headerTintColor: colors.black,
            }} />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {isLoading ? (
                    <Loading size={'large'} />
                ) : error ? (
                    <ErrorView message={error} onRetry={getNews} />
                ) : news.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color={colors.lightGrey} />
                        <Text style={[styles.emptyText, { color: colors.black }]}>
                            Không tìm thấy kết quả nào
                        </Text>
                    </View>
                ) : (
                    <FlatList 
                        data={news}
                        keyExtractor={(item) => item.article_id}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderNewsItem}
                        contentContainerStyle={styles.listContainer}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={5}
                    />
                )}
            </View>
        </>
    )
}

export default search

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    listContainer: {
        paddingBottom: 20
    },
    newsItemContainer: {
        marginBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    }
})