"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/app/i18n/client";
import { Languages } from "@/i18n";

export function Header({ lng }: { lng: Languages }) {
  const { t } = useTranslation(lng, "translation");
  const languages = {
    en: "En",
    zh: "中文",
  };

  return (
    <header className="sticky z-[11] top-0 left-0 right-0 w-full bg-night">
      <div className="container mx-auto flex items-center justify-between h-[72px] px-4">
        <div className="flex items-center gap-8">
          <Link href="https://bewater.xyz">
            <Image
              src="/logo/bewater_black.svg" 
              width={120}
              height={24}
              alt="bewater logo"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[12px] whitespace-nowrap">
            <span className="font-bold text-grey-400">
              {languages[lng]}
            </span>
            {Object.entries(languages)
              .filter(([key]) => key !== lng)
              .map(([key, label]) => (
                <span key={key}>
                  <span className="text-base text-grey-500"> / </span>
                  <Link href={`/${key}`} className="text-grey-500">
                    {label}
                  </Link>
                </span>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
} 