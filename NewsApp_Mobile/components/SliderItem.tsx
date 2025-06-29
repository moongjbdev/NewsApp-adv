import { NewsDataType } from '@/types'
import React from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {
    sliderItem: NewsDataType,
    index: number,
    scrollX: SharedValue<number>
}

const { width } = Dimensions.get('screen')
const ITEM_WIDTH = width * 0.85;

const SliderItem = ({ sliderItem, index, scrollX }: Props) => {
    const { colors } = useTheme();
    
    const rnStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
        ];

        return {
            transform: [
                {
                    scaleX: interpolate(
                        scrollX.value,
                        inputRange,
                        [0.6, 1, 0.6],
                        Extrapolation.CLAMP
                    ),
                },
                {
                    scaleY: interpolate(
                        scrollX.value,
                        inputRange,
                        [0.85, 1, 0.85],
                        Extrapolation.CLAMP
                    ),
                },
                {
                    translateX: interpolate(
                        scrollX.value,
                        inputRange,
                        [-ITEM_WIDTH * 0.3, 0, ITEM_WIDTH * 0.3],
                        Extrapolation.CLAMP
                    ),
                },
            ],
        };
    });

    const handlePress = () => {
        router.push(`/news/${sliderItem.article_id}`);
    };

    return (
        <TouchableOpacity 
            onPress={handlePress} 
            activeOpacity={0.9}
            style={styles.pressable}
        >
            <Animated.View style={[styles.itemWrapper, rnStyle]}>
                <View style={[styles.imageContainer, { backgroundColor: colors.cardBackground }]}>
                    <Image source={{ uri: sliderItem.image_url }} style={styles.image} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.background}
                    >
                        <View style={styles.sourceInfo}>
                            {sliderItem.source_icon && (
                                <Image source={{ uri: sliderItem.source_icon }} style={styles.srcIcon} />
                            )}
                            <Text style={styles.sourceName}>{sliderItem.source_name}</Text>
                        </View>
                        <Text style={styles.title} numberOfLines={2}>{sliderItem.title}</Text>
                    </LinearGradient>
                </View>
            </Animated.View>
        </TouchableOpacity>
    )
}

export default SliderItem

const styles = StyleSheet.create({
    pressable: {
        width: ITEM_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemWrapper: {
        position: 'relative',
        width: ITEM_WIDTH,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    image: {
        width: ITEM_WIDTH,
        height: 180,
        borderRadius: 20
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        width: ITEM_WIDTH,
        height: 180,
        borderRadius: 20,
        padding: 20
    },
    title: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
        position: 'absolute',
        top: 120,
        paddingHorizontal: 20
    },
    srcIcon: {
        width: 25,
        height: 25,
        borderRadius: 20
    },
    sourceName: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: "600"
    },
    sourceInfo: {
        flexDirection: 'row',
        position: 'absolute',
        top: 85,
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 10
    }
})