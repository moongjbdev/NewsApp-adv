import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import newsCategoryList from '@/constants/Categories'
import CheckBox from '@/components/CheckBox'
import useNewsCategories from '@/hooks/useNewsCategories'
import useNewsCountries from '@/hooks/useNewsCountries'
import { Link } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'

type Props = {}

const Page = (props: Props) => {
  const { top: safeTop } = useSafeAreaInsets()
  const { colors } = useTheme()

  const { newsCategories, toggleNewsCategory } = useNewsCategories()
  const { newsCountries, toggleNewsCountry } = useNewsCountries()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<string[]>([])
  const [country, setCountry] = useState<string[]>([])

  return (
    <View style={[styles.container, { paddingTop: safeTop + 20, backgroundColor: colors.background }]}>
      <SearchBar withHorizontalPadding={false} setSearchQuery={setSearchQuery} />
      <Text style={[styles.title, { color: colors.black }]}>Thể Loại</Text>
      <View style={styles.listContainer}>
        {
          newsCategories.map((item, index) => (
            <CheckBox key={item.id}
              label={item.title}
              checked={item.selected}
              onPress={() => {
                toggleNewsCategory(item.id);
                setCategory(prev => {
                  if (item.selected) {
                    return prev.filter(slug => slug !== item.slug);
                  } else {
                    return [...prev, item.slug];
                  }
                });
              }}
            />
          ))
        }
      </View>
      <Text style={[styles.title, { color: colors.black }]}>Quốc Gia</Text>
      <View style={styles.listContainer}>
        {
          newsCountries.map((item, index) => (
            <CheckBox key={index}
              label={item.name}
              checked={item.selected}
              onPress={() => {
                toggleNewsCountry(index);
                setCountry(prev => {
                  if (item.selected) {
                    return prev.filter(code => code !== item.code);
                  } else {
                    return [...prev, item.code];
                  }
                });
              }}
            />
          ))
        }
      </View>
      <Link style={[styles.searchBtn, { backgroundColor: colors.tint }]} href={{
        pathname: `/news/search`,
        params: { query: searchQuery, category: category.join(','), country: country.join(',') }
      }} asChild>
        <TouchableOpacity >
          <Text style={[styles.searchBtnTxt, { color: colors.white }]}>Tìm Kiếm</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

export default Page

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
    marginBottom: 13,
  },
  searchBtn: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
  },
  searchBtnTxt: {
    fontSize: 16,
    fontWeight: '600'
  }
})