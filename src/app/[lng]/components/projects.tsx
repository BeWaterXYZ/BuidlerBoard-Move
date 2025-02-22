"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/app/i18n/client";
import { BuilderboardProject } from "@/services/leaderboard";
import { useBuilderboardProject } from "@/services/leaderboard.query";
import PageSwitcher from "./page-switcher";
import { UpdateIcon, CodeIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import Link from 'next/link';

const gridTemplate = "grid-cols-1 md:grid-cols-[minmax(0,_0.5fr)_minmax(0,_4fr)_minmax(0,_4fr)_minmax(0,_3fr)]";
const rowStyle = `grid gap-2 md:gap-4 border-b border-b-[#334155] box-border ${gridTemplate}`;

function Project(props: { data: BuilderboardProject; rank: number; lng: string }) {
  const { data, rank, lng } = props;
  const contributors = data.contributors?.slice(0, 5) || [];
  
  return (
    <div className={`${rowStyle} py-4 items-start md:items-center text-xs text-[#F8FAFC]`}>
      {/* Rank */}
      <p className="text-base hidden md:block">#{rank}</p>

      {/* Project Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="md:hidden text-base">#{rank}</span>
          <Link 
            href={`/${lng}/project/${data.repoName}`}
            className="font-bold text-sm md:text-base text-[#F8FAFC] hover:underline"
          >
            {data.repoName}
          </Link>
        </div>
        <p className="text-xs md:text-sm text-[#94A3B8] line-clamp-2">
          {data.description}
        </p>
        <div className="flex gap-4 text-[#94A3B8] text-xs">
          <span>{data.stargazers_count} stars</span>
          <span>{data.forks_count} forks</span>
        </div>
      </div>

      {/* Languages & Topics */}
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <div className="flex flex-wrap gap-2">
          {data.languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 bg-[#1E293B] rounded-[4px] text-xs text-[#F8FAFC]"
            >
              {lang}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-[#0F172A] rounded-[4px] text-xs text-[#94A3B8]"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Contributors & Update Time */}
      <div className="flex flex-col gap-3 mt-4 md:mt-0">
        <div className="flex -space-x-2">
          {contributors.map((contributor) => (
            <a
              key={contributor.login}
              href={`https://github.com/${contributor.login}`}
              className="relative"
            >
              <Image
                src={contributor.avatar_url}
                alt={contributor.login}
                width={24}
                height={24}
                className="rounded-full border-2 border-[#0F172A]"
              />
            </a>
          ))}
          {data.contributors.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-[#1E293B] border-2 border-[#0F172A] flex items-center justify-center text-xs text-[#94A3B8]">
              +{data.contributors.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-[#94A3B8]">
          Updated {format(new Date(data.updated_at), "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}

interface ProjectsProps {
  ecosystem: string;
  sector: string;
  lng: string;
}

export default function Projects({ ecosystem, sector, lng }: ProjectsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const { data: projects = [], isLoading } = useBuilderboardProject(100, ecosystem, sector);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [ecosystem, sector]);

  
  const currentPageData = projects.slice(
    ITEMS_PER_PAGE * (currentPage - 1),
    ITEMS_PER_PAGE * currentPage
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UpdateIcon className="w-8 h-8 text-[#00FFFF] animate-spin" />
        <p className="mt-4 text-[#94A3B8]">Loading projects...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CodeIcon className="w-12 h-12 text-[#475569] mb-4" />
        <p className="text-[#94A3B8] mb-2">No projects found</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${rowStyle} py-2`} />

      {currentPageData.map((project, index) => (
        <Project
          data={project}
          rank={index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
          lng={lng}
          key={project.repoName}
        />
      ))}

      {projects.length > 0 && (
        <PageSwitcher
          currentPage={currentPage}
          rowsPerPage={ITEMS_PER_PAGE}
          totalRows={projects.length}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}
    </>
  );
} 