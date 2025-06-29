import { Colors } from '@/constants/Colors'
import { NewsDataType } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { SharedValue } from 'react-native-reanimated'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {
    items: NewsDataType[],
    paginationIndex: number,
    scrollX: SharedValue<number>
}

const Pagination = ({ items, paginationIndex, scrollX }: Props) => {
    const { colors } = useTheme();
    
    return (
        <View style={styles.container}>
            {
                items.map((item, index) => {
                    return (
                        <Animated.View 
                            style={[
                                styles.dot, 
                                { 
                                    backgroundColor: paginationIndex === index ? colors.tint : colors.lightGrey 
                                }
                            ]} 
                            key={item.article_id} 
                        />
                    )
                })
            }
        </View>
    )
}

export default Pagination

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dot: {
        height: 8,
        width: 8,
        marginHorizontal: 2,
        borderRadius: 8
    }
})