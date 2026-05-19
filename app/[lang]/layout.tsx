import { TabAwayTitle } from "@/components/tab-away-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/site-navigation";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getDictionary, Locale, hasLocale } from "./dictionaries";
import { LanguageProvider } from "@/components/language-provider";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "tr" }];
}

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) => {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return (
    <LanguageProvider lang={lang as Locale} dict={dict}>
      <TabAwayTitle />
      <SiteNavigation />
      <SmoothScrollProvider>
        {children}
        <SiteFooter />
      </SmoothScrollProvider>
    </LanguageProvider>
  );
};

export default RootLayout;
