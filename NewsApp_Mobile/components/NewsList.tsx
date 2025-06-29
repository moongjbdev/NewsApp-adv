import { Colors } from '@/constants/Colors'
import { NewsDataType } from '@/types'
import React, { memo } from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Loading } from './Loading'
import BookmarkButton from './BookmarkButton'
import { Link } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {
    newsList: NewsDataType[]
}

const NewsList = ({ newsList }: Props) => {
    const { colors } = useTheme();

    if (newsList.length === 0) {
        return <Loading size='large' />
    }

    const renderNewsItem = ({ item }: { item: NewsDataType }) => (
        <Link href={`/news/${item.article_id}`} asChild>
            <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
                <NewsItem item={item} />
            </TouchableOpacity>
        </Link>
    );

    const keyExtractor = (item: NewsDataType) => item.article_id;

    return (
        <View style={styles.container}>
            <FlatList
                data={newsList}
                renderItem={renderNewsItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
                getItemLayout={(data, index) => ({
                    length: 120, // Approximate height of each item
                    offset: 120 * index,
                    index,
                })}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    )
}

export default NewsList

const NewsItem = memo(({ item }: { item: NewsDataType }) => {
    const { colors } = useTheme();
    
    return (
        <View style={[styles.itemContainer, { 
            backgroundColor: colors.cardBackground,
            shadowColor: colors.shadowColor 
        }]}>
            <Image 
                source={{ uri: item.image_url }} 
                style={styles.itemImage}
                resizeMode="cover"
            />
            <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemCategory, { 
                        color: colors.darkGrey,
                        backgroundColor: colors.background 
                    }]}>
                        {item.category}
                    </Text>
                    <BookmarkButton newsItem={item} size={20} />
                </View>
                <Text style={[styles.itemTitle, { color: colors.black }]} numberOfLines={3}>
                    {item.title}
                </Text>
                <View style={styles.itemSrcInfo}>
                    <Image 
                        source={{ uri: item.source_icon }} 
                        style={styles.itemSrcImage}
                        resizeMode="cover"
                    />
                    <Text style={[styles.itemSrcName, { color: colors.darkGrey }]}>
                        {item.source_name}
                    </Text>
                </View>
            </View>
        </View>
    )
});

NewsItem.displayName = 'NewsItem';

export { NewsItem };

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 50
    },
    listContainer: {
        paddingBottom: 20
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
        flex: 1,
        gap: 12,
        borderRadius: 12,
        padding: 12,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'space-between',
        gap: 8
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCategory: {
        fontSize: 12,
        textTransform: 'capitalize',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    itemSrcImage: {
        width: 16,
        height: 16,
        borderRadius: 8
    },
    itemSrcName: {
        fontSize: 11,
        fontWeight: '400'
    },
    itemSrcInfo: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center'
    }
})