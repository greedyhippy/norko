import {
    HeadersFunction,
    json,
    LinksFunction,
    LoaderFunction,
    LoaderFunctionArgs,
    MetaFunction,
} from '@remix-run/node';
import { HttpCacheHeaderTaggerFromLoader, StoreFrontAwaretHttpCacheHeaderTagger } from '~/use-cases/http/cache';
import splideStyles from '@splidejs/splide/dist/css/themes/splide-default.min.css';
import { useLoaderData } from '@remix-run/react';
import { getStoreFront } from '~/use-cases/storefront.server';
import { buildMetas } from '~/use-cases/MicrodataBuilder';
import { getContext } from '~/use-cases/http/utils';
import videoStyles from '@crystallize/reactjs-components/assets/video/styles.css';
import LandingPage from '~/ui/pages/LandingPage';
import dataFetcherForShapePage from '~/use-cases/dataFetcherForShapePage.server';
import { authenticatedUser } from '~/core/authentication.server';
import { marketIdentifiersForUser } from '~/use-cases/marketIdentifiersForUser';
import { LandingPage as LandingPageType } from '~/use-cases/contracts/LandingPage';

export let meta: MetaFunction = ({ data }: any) => {
    // Handle fallback data structure (when Crystallize content is not available)
    if (data?.data?.isFallback) {
        return [
            { title: data.data.meta.title },
            { name: "description", content: data.data.meta.description },
        ];
    }
    
    // Handle original Crystallize data structure
    if (data?.data && !data?.data?.isFallback) {
        try {
            return buildMetas(data.data);
        } catch (error) {
            console.warn('Error building metas from Crystallize data:', error);
        }
    }
    
    // Final fallback meta tags
    return [
        { title: "Norko - Premium Infrared Heating Solutions" },
        { name: "description", content: "Professional infrared heaters for indoor, outdoor, and industrial applications" },
    ];
};

export const headers: HeadersFunction = ({ parentHeaders, loaderHeaders }) => {
    return {
        ...HttpCacheHeaderTaggerFromLoader(loaderHeaders).headers,
        Link: parentHeaders.get('Link') as string,
    };
};

export const links: LinksFunction = () => {
    return [
        { rel: 'stylesheet', href: splideStyles },
        { rel: 'stylesheet', href: videoStyles },
    ];
};

export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) => {
    const requestContext = getContext(request);
    const path = `/frontpage`;
    const { shared } = await getStoreFront(requestContext.host);
    const user = await authenticatedUser(request);
    
    try {
        const data = await dataFetcherForShapePage(
            'landing-page',
            path,
            requestContext,
            params,
            marketIdentifiersForUser(user),
        );
        return json({ data }, StoreFrontAwaretHttpCacheHeaderTagger('15s', '1w', [path], shared.config.tenantIdentifier));
    } catch (error) {
        // Fallback content when frontpage doesn't exist in Crystallize
        console.log('Frontpage not found, using fallback content:', error);
        
        // Structure the fallback data to match what the frontend components expect
        const fallbackData = {
            meta: {
                title: "Norko - Premium Infrared Heating Solutions",
                description: "Professional infrared heaters for indoor, outdoor, and industrial applications"
            },
            hero: {
                title: "Welcome to Norko",
                subtitle: "Premium Infrared Heating Solutions",
                description: "Discover our range of energy-efficient infrared heaters designed for every application"
            },
            categories: [
                { name: "Panel Heaters", description: "Perfect for residential and office spaces" },
                { name: "Ceiling Heaters", description: "Ideal for commercial environments" },
                { name: "Industrial Heaters", description: "Heavy-duty solutions for workshops" },
                { name: "Patio Heaters", description: "Outdoor heating for hospitality" },
                { name: "Far Infrared Heaters", description: "Health-focused heating technology" }
            ],
            // Add minimal structure to prevent component errors
            grids: [],
            isFallback: true
        };
        
        return json({ data: fallbackData }, StoreFrontAwaretHttpCacheHeaderTagger('15s', '1w', [path], shared.config.tenantIdentifier));
    }
};

export default () => {
    const { data } = useLoaderData<typeof loader>();
    return <LandingPage data={data} />;
};
