import {getRequestConfig} from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["vi","en","lo"];
export const defaultLocale = "vi";

export const getRequestConfigWith = getRequestConfig(async ({locale}) => {
    if(!locales.includes(locale)) {
        return notFound();
    }
    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
});