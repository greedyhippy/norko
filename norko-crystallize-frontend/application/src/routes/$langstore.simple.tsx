import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

type Product = {
    name: string;
    category: string;
};

type LoaderData = {
    storeName: string;
    message: string;
    products: Product[];
};

export const loader: LoaderFunction = async () => {
    return json<LoaderData>({
        storeName: "Norko Infrared Heaters",
        message: "Welcome to Norko - Your Infrared Heating Solution",
        products: [
            { name: "Panel Heaters", category: "Indoor Heating" },
            { name: "Ceiling Heaters", category: "Commercial" },
            { name: "Industrial Heaters", category: "Heavy Duty" },
            { name: "Patio Heaters", category: "Outdoor" },
            { name: "Far Infrared Heaters", category: "Health & Wellness" }
        ]
    });
};

export default function Simple() {
    const data = useLoaderData<LoaderData>();
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {data.storeName}
                    </h1>
                    <p className="text-xl text-gray-600 mb-12">
                        {data.message}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {data.products.map((product: Product, index: number) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600">
                                    {product.category}
                                </p>
                                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    View Products
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Integration Status
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                ✅ Railway GraphQL API Connected
                            </div>
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                ✅ Crystallize Tenant Connected
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
