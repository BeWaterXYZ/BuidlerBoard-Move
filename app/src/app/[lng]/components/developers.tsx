"use client";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/app/i18n/client";
import { BuilderboardDeveloper, BuilderboardLanguage } from "@/services/leaderboard";
import { useBuilderboardDeveloper } from "@/services/leaderboard.query";
import PageSwitcher from "./page-switcher";
import { UpdateIcon, PersonIcon } from "@radix-ui/react-icons";
import Link from 'next/link';

const gridTemplate = "grid-cols-1 md:grid-cols-[minmax(0,_0.5fr)_minmax(0,_4fr)_minmax(0,_4fr)_minmax(0,_3fr)]";
const rowStyle = `grid gap-2 md:gap-4 border-b border-b-[#334155] box-border ${gridTemplate}`;


const languageColors: { [key: string]: string } = {
  "TypeScript": "#3178c6",
  "JavaScript": "#f1e05a",
  "Python": "#3572A5",
  "Java": "#b07219",
  "Ruby": "#701516",
  "Go": "#00ADD8",
  "Rust": "#dea584",
  "Solidity": "#AA6746",
  "C++": "#f34b7d",
  "C#": "#178600",
  "PHP": "#4F5D95",
  "Swift": "#ffac45",
  "Kotlin": "#A97BFF",
  "Dart": "#00B4AB",
  "Vue": "#41b883",
  "HTML": "#e34c26",
  "CSS": "#563d7c",
};

function Developer({ data, rank, lng }: { data: BuilderboardDeveloper; rank: number; lng: string }) {
  const popularRepo = data.popular_repo;
  const topLanguages = popularRepo.languages?.slice(0, 3) || [];
  
  return (
    <div className={`${rowStyle} py-4 items-start md:items-center text-xs text-[#F8FAFC]`}>
      {/* Rank */}
      <p className="text-base hidden md:block">#{rank}</p>

      {/* Developer Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="md:hidden text-base">#{rank}</span>
          <Link 
            href={`/${lng}/developer/${data.login}`} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src={data.avatar_url}
              alt={data.login}
              width={48}
              height={48}
              className="rounded-full w-8 h-8 md:w-12 md:h-12"
            />
            <p className="font-bold text-sm md:text-base text-[#F8FAFC]">
              {data.login}
            </p>
          </Link>
        </div>
        <div className="flex gap-4 text-[#94A3B8] text-xs">
          <span>{data.total_stars} stars</span>
          <span>{data.followers} followers</span>
        </div>
        <p className="text-xs md:text-sm text-[#94A3B8] line-clamp-2">
          {data.bio}
        </p>
      </div>

      {/* Popular Repo */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <a href={popularRepo?.html_url} className="font-bold text-sm md:text-base text-[#F8FAFC] hover:underline">
          {popularRepo?.name}
        </a>
        <p className="text-xs md:text-sm text-[#94A3B8] line-clamp-2">
          {popularRepo?.description}
        </p>
      </div>

      {/* Languages */}
      <div className="flex flex-col gap-3 mt-4 md:mt-0">
        {topLanguages.map((lang: BuilderboardLanguage) => (
          <div key={lang.name} className="flex flex-col gap-1">
            <span className="text-[#F8FAFC] text-xs">{lang.name}</span>
            <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${lang.percentage}%`,
                  backgroundColor: languageColors[lang.name] || '#00FFFF'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DevelopersProps {
  ecosystem: string;
  sector: string;
  lng: string;
}


export default function Developers({ ecosystem, sector, lng }: DevelopersProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const { data: apiData, isLoading: apiLoading } = useBuilderboardDeveloper(100, ecosystem, sector);

  useEffect(() => {
    setCurrentPage(1);
  }, [ecosystem, sector]);

  const displayLoading = apiLoading;
  const displayData = apiData;

  console.log(displayData);
  const currentPageData = (displayData ?? []).slice(
    ITEMS_PER_PAGE * (currentPage - 1),
    ITEMS_PER_PAGE * currentPage
  );

  if (displayLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UpdateIcon className="w-8 h-8 text-[#00FFFF] animate-spin" />
        <p className="mt-4 text-[#94A3B8]">Loading developers...</p>
      </div>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PersonIcon className="w-12 h-12 text-[#475569] mb-4" />
        <p className="text-[#94A3B8] mb-2">No developers found</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${rowStyle} py-2`} />

      {currentPageData.map((data, index) => (
        data && <Developer
          data={data}
          rank={index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
          lng={lng}
          key={data.login || index}
        />
      ))}

      {displayData.length > 0 && (
        <PageSwitcher
          currentPage={currentPage}
          rowsPerPage={ITEMS_PER_PAGE}
          totalRows={displayData.length}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}
    </>
  );
} 