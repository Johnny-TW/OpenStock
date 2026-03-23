"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  TrendingUp,
} from "lucide-react"

import { NavMain } from "@/components/layouts/sidebar/NavMain"
import { NavProjects } from "@/components/layouts/sidebar/NavProjects"
import { NavUser } from "@/components/layouts/sidebar/NavUser"
import { TeamSwitcher } from "@/components/layouts/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/commons/sidebar"
import { enbg_icon } from "@/images/index"
import Image from "next/image"

// 將圖片包成 React 元件，讓 TeamSwitcher 可以像 Lucide icon 一樣使用
const EnbgIconLogo = ({ className }: { className?: string }) => (
  <Image src={enbg_icon} alt="Enbg Icon" className={className} width={6} height={6} />
)

const data = {
  user: {
    name: "Johnny Yeh",
    email: "johnny43607@gmail.com",
    avatar: enbg_icon.src,
  },
  teams: [
    {
      name: "ee39-stocksmart-system",
      logo: EnbgIconLogo,
      plan: "version 1.0.0",
    },
  ],
  navMain: [
    {
      title: "股票資訊",
      url: "/stock",
      icon: TrendingUp,
      isActive: true,
      items: [
        { title: "當日成交總覽", url: "/stock" },
        { title: "本益比/殖利率", url: "/stock/valuation" },
        { title: "大盤指數", url: "/stock/market-index" },
        { title: "成交排行", url: "/stock/top-volume" },
        { title: "盤中走勢", url: "/stock/intraday" },
        { title: "指數歷史", url: "/stock/index-history" },
      ],
    },
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "History", url: "#" },
        { title: "Starred", url: "#" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
