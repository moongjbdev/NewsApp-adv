import { Colors } from '@/constants/Colors'
import { NewsDataType } from '@/types'
import React, { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import BookmarkButton from './BookmarkButton'
import { useTheme } from '@/contexts/ThemeContext'

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

export default NewsItem;

const styles = StyleSheet.create({
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