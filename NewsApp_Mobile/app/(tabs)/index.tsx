import { FlatList, StyleSheet, Text, View, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useCallback, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import { NewsDataType } from '@/types'
import BreakingNews from '@/components/BreakingNews'
import Categories from '@/components/Categories'
import NewsItem from '@/components/NewsItem'
import SkeletonLoading from '@/components/SkeletonLoading'
import ErrorView from '@/components/ErrorView'
import { useTheme } from '@/contexts/ThemeContext'
import { useNewsData } from '@/hooks/useNewsData'
import { Link } from 'expo-router'

type Props = {}

const Page = (props: Props) => {
  const { top: safeTop } = useSafeAreaInsets()
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState('')

  const {
    breakingNews,
    news,
    isLoading,
    error,
    refreshData,
    fetchNewsByCategory,
  } = useNewsData();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
      setCurrentCategory('');
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const onCatChanged = useCallback((category: string) => {
    setCurrentCategory(category);
    fetchNewsByCategory(category);
  }, [fetchNewsByCategory]);

  const renderHeader = useMemo(() => (
    <>
      <Header />
      {/* <SearchBar withHorizontalPadding={true} setSearchQuery={setSearchQuery} /> */}
      {isLoading ? (
        <SkeletonLoading count={8} />
      ) : (
        <BreakingNews newList={breakingNews} />
      )}
      <Categories onCategoryChanged={onCatChanged} currentCategory={currentCategory} />
    </>
  ), [isLoading, breakingNews, onCatChanged, currentCategory]);

  const renderNewsItem = ({ item }: { item: NewsDataType }) => (
    <Link href={`/news/${item.article_id}`} asChild>
      <TouchableOpacity style={styles.newsItemContainer} activeOpacity={0.8}>
        <NewsItem item={item} />
      </TouchableOpacity>
    </Link>
  );

  if (error && !isLoading) {
    return (
      <View style={[styles.container, { paddingTop: safeTop, backgroundColor: colors.background }]}>
        <Header />
        <ErrorView message={error} onRetry={refreshData} />
      </View>
    )
  }

  return (
    <FlatList
      style={[styles.container, { paddingTop: safeTop, backgroundColor: colors.background }]}
      data={news}
      renderItem={renderNewsItem}
      ListHeaderComponent={renderHeader}
      keyExtractor={(item) => item.article_id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.tint}
          colors={[colors.tint]}
        />
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      contentContainerStyle={styles.contentContainer}
    />
  )
}

export default Page

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  newsItemContainer: {
    marginHorizontal: 20,
  },
})