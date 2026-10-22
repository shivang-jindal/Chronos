import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Share2, Search, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon, Layers as LayersIcon, Download as DownloadIcon2 } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { DATA_LAYERS, TEMPORAL_LAYERS, COLLECTIONS, DATA_LAYERS as DL, TEMPORAL_LAYERS as TL } from '@chronos/shared';

export function DataExplorerPage() {
  const { layers } = useChronosStore();
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const collections = [
    { id: 'landsat-c2-l2', name: 'Landsat Collection 2 Level-2', description: 'Surface reflectance and surface temperature', count: '2.5M scenes' },
    { id: 'sentinel-2-l2a', name: 'Sentinel-2 Level-2A', description: 'Surface reflectance at 10-60m resolution', count: '1.8M scenes' },
    { id: 'planet-nicfi', name: 'Planet NICFI', description: 'High-resolution tropical forest monitoring', count: '500k scenes' },
    { id: 'viirs-night-lights', name: 'VIIRS Night Lights', description: 'Monthly night-time lights', count: '12 years' },
    { id: 'sentinel-1-grd', name: 'Sentinel-1 GRD', description: 'C-band SAR ground range detected', count: '2M scenes' },
    { id: 'gedi-l2a', name: 'GEDI L2A', description: 'Lidar canopy height and structure', count: '500M shots' },
    { id: 'icesat2-atl08', name: 'ICESat-2 ATL08', description: 'Land and vegetation height', count: '1B photons' },
    { id: 'copernicus-dem', name: 'Copernicus DEM', description: 'Global 30m digital elevation model', count: 'Global' },
    { id: 'esa-cci-lc', name: 'ESA CCI Land Cover', description: 'Annual land cover maps 1992-2020', count: '29 years' },
    { id: 'ghsl', name: 'GHSL', description: 'Global Human Settlement Layer', count: '1975-2020' },
    { id: 'esa-worldcover', name: 'ESA WorldCover', description: '10m global land cover 2020/2021', count: '2 epochs' },
    { id: 'dynamic-world', name: 'Dynamic World', description: 'Near real-time 10m land cover', count: 'Daily' }
  ];

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Explorer</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Browse and discover Earth observation datasets</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Bulk Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-72 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search datasets..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filters</label>
            <div className="space-y-3">
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Collections</option>
                <option value="optical">Optical</option>
                <option value="radar">Radar</option>
                <option value="lidar">Lidar</option>
                <option value="thermal">Thermal</option>
                <option value="night_lights">Night Lights</option>
                <option value="dem">Elevation</option>
                <option value="land_cover">Land Cover</option>
                <option value="human_footprint">Human Footprint</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Collections</span>
                <span className="font-medium text-slate-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Scenes</span>
                <span className="font-medium text-slate-900 dark:text-white">5.8M+</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Temporal Range</span>
                <span className="font-medium text-slate-900 dark:text-white">1984 - Present</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Size</span>
                <span className="font-medium text-slate-900 dark:text-white">2.4 PB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Collections</h1>
            <div className="flex items-center gap-2">
              <select className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="table">Table View</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <Globe className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button className="p-1.5 rounded bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                      {collection.id.split('-')[0].toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{collection.count}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{collection.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button className="flex-1 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCollections.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No collections found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}