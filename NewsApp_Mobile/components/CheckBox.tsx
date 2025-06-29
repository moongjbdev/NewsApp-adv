import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons'
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {
    label: string,
    checked: boolean,
    onPress: () => void
}

const CheckBox = ({ label, checked, onPress }: Props) => {
    const { colors } = useTheme();
    
    const rnAnimatedContainerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(colors.cardBackground, { duration: 100 }),
            borderColor: withTiming(checked ? colors.tint : colors.lightGrey, { duration: 100 }),
            paddingLeft: 16,
            paddingRight: checked ? 10 : 16
        }
    }, [checked, colors])
    
    const rnTextStyle = useAnimatedStyle(() => {
        return {
            color: withTiming(checked ? colors.tint : colors.black, { duration: 100 }),
        }
    }, [checked, colors])
    
    return (
        <Animated.View style={[styles.container, rnAnimatedContainerStyle]}
            onTouchEnd={onPress}
            layout={LinearTransition.springify().mass(0.8)}
        >
            <Animated.Text style={[styles.label, rnTextStyle]}>{label}</Animated.Text>
            {checked &&
                <Animated.View style={styles.iconWrapper} entering={FadeIn.duration(350)} exiting={FadeOut}>
                    <AntDesign name='checkcircle' size={14} color={colors.tint} />
                </Animated.View>
            }
        </Animated.View>
    )
}

export default CheckBox

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        paddingVertical: 8,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
    },
    iconWrapper: {
        marginLeft: 8,
        height: 14,
        width: 14
    }
})