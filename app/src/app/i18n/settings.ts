import { languages } from "@/i18n";

export const fallbackLng = "en";
export const defaultNS = "common";

export { languages };

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: ['common', 'developer'],
  };
} 