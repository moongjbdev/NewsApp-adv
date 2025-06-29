import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {
    withHorizontalPadding: boolean,
    setSearchQuery: Function
}

const SearchBar = ({ withHorizontalPadding, setSearchQuery }: Props) => {
    const { colors } = useTheme();
    
    return (
        <View style={[styles.container, withHorizontalPadding && { paddingHorizontal: 20 }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
                <Ionicons name='search-outline' size={20} color={colors.lightGrey} />
                <TextInput
                    style={[styles.searchText, { color: colors.black }]}
                    placeholder='Tìm kiếm bài viết'
                    placeholderTextColor={colors.lightGrey}
                    onChangeText={query => setSearchQuery(query)}
                />
            </View>
        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({
    container: {
        // marginHorizontal: 20,
        marginBottom: 20
    },
    searchBar: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchText: {
        fontSize: 14,
        flex: 1,
    }
})