import { Colors } from '@/constants/Colors'
import { NewsDataType } from '@/types'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, Text, useWindowDimensions, View, ViewToken } from 'react-native'
import SliderItem from './SliderItem'
import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import Pagination from './Pagination'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {
    newList: Array<NewsDataType>
}

const { width } = Dimensions.get('screen')
const ITEM_WIDTH = width * 0.85;

const BreakingNews = ({ newList }: Props) => {
    const { colors } = useTheme();
    const [data, setData] = useState<Array<NewsDataType>>([]);

    const [paginationIndex, setPaginationIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const ref = useAnimatedRef<Animated.FlatList<any>>()

    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const interval = useRef<NodeJS.Timeout>();
    const offset = useSharedValue(0);
    const { width } = useWindowDimensions();

    const onScrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x
        },
        onMomentumEnd: (e) => {
            offset.value = e.contentOffset.x
        }
    })

    const handleLoadMore = () => {
        const moreData = [...newList];
        setData((prev) => [...prev, ...moreData]);
    };

    const onViewableItemsChanged = ({
        viewableItems,
    }: {
        viewableItems: ViewToken[]
    }) => {
        if (
            viewableItems[0].index !== undefined &&
            viewableItems[0].index !== null
        ) {
            setPaginationIndex(viewableItems[0].index % newList.length)
        }
    }

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    }

    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged }
    ])

    useEffect(() => {
        if (isAutoPlay === true) {
            interval.current = setInterval(() => {
                offset.value = offset.value + ITEM_WIDTH;
            }, 5000);
        } else {
            clearInterval(interval.current);
        }

        return () => {
            clearInterval(interval.current);
        };
    }, [isAutoPlay, offset, width]);

    useDerivedValue(() => {
        scrollTo(ref, offset.value, 0, true);
    });

    useEffect(() => {
        setData(newList);
    }, [newList]);

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.black }]}>Tin tức mới nhất</Text>
            <View style={styles.slideWrapper}>
                <Animated.FlatList
                    ref={ref}
                    data={data}
                    keyExtractor={(_, index) => `list_item${index}`}
                    renderItem={({ item, index }) => (<SliderItem sliderItem={item} index={index} scrollX={scrollX} />)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    snapToInterval={ITEM_WIDTH}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 }}
                    onScroll={onScrollHandler}
                    scrollEventThrottle={16}
                    onEndReachedThreshold={0.5}
                    onEndReached={handleLoadMore}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    onScrollBeginDrag={() => {
                        setIsAutoPlay(false);
                    }}
                    onScrollEndDrag={() => {
                        setIsAutoPlay(true);
                    }}
                />
                <Pagination items={newList} paginationIndex={paginationIndex} scrollX={scrollX} />
            </View>
        </View>
    )
}

export default BreakingNews

const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 20
    },
    slideWrapper: {
        justifyContent: 'center'
    },
})