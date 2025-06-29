import React from 'react'
import { Tabs } from 'expo-router'
import { TabBar } from '@/components/TabBar'

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang Chính",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Khám Phá",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Yêu Thích",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Cài Đặt",
        }}
      />
    </Tabs>
  )
}

export default TabLayout