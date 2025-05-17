import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages } from './app/i18n/settings';

acceptLanguage.languages([...languages]);

export function middleware(request: NextRequest) {
  let lng;
  if (request.cookies.has('i18next')) {
    lng = acceptLanguage.get(request.cookies.get('i18next')?.value);
  }
  if (!lng) {
    lng = acceptLanguage.get(request.headers.get('Accept-Language'));
  }
  if (!lng) {
    lng = fallbackLng;
  }

  // 如果是根路径，重定向到默认语言
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/${fallbackLng}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
}; 