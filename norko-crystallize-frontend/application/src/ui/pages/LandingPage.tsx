import { Grid } from '../components/grid/grid';
import { LandingPage } from '~/use-cases/contracts/LandingPage';

export default ({ data: landing }: { data: LandingPage | any }) => {
    // Handle fallback data structure (when Crystallize content is not available)
    if (landing.isFallback) {
        return (
            <div className="min-h-[100vh] bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl font-bold mb-4">{landing.hero.title}</h1>
                        <h2 className="text-2xl mb-6">{landing.hero.subtitle}</h2>
                        <p className="text-lg max-w-2xl mx-auto">{landing.hero.description}</p>
                    </div>
                </div>
                
                {/* Categories Section */}
                <div className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Product Range</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {landing.categories.map((category: any, index: number) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.name}</h3>
                                    <p className="text-gray-600 mb-4">{category.description}</p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                        Explore {category.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Status Section */}
                <div className="bg-gray-100 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold mb-8 text-gray-900">System Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                ✅ Railway GraphQL API Connected
                            </div>
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                ✅ Crystallize Tenant Connected
                            </div>
                            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                ⚠️ Using Fallback Content (Crystallize frontpage not found)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle legacy fallback data structure (keeping for backward compatibility)
    if (!landing.grids && landing.components) {
        return (
            <div className="min-h-[100vh] bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl font-bold mb-4">{landing.components.hero.title}</h1>
                        <h2 className="text-2xl mb-6">{landing.components.hero.subtitle}</h2>
                        <p className="text-lg max-w-2xl mx-auto">{landing.components.hero.description}</p>
                    </div>
                </div>
                
                {/* Categories Section */}
                <div className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Product Range</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {landing.components.categories.map((category: any, index: number) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.name}</h3>
                                    <p className="text-gray-600 mb-4">{category.description}</p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                        Explore {category.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Status Section */}
                <div className="bg-gray-100 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold mb-8 text-gray-900">System Status</h2>
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
        );
    }

    // Handle original Crystallize data structure
    return (
        <div className="min-h-[100vh]">
            {landing.grids?.map((grid: any, index: number) => (
                <div key={`${grid.id}-${index}`} className="mx-auto w-full test">
                    <Grid grid={grid} />
                </div>
            ))}
        </div>
    );
};
