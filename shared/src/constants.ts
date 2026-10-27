/**
 * Constants shared between client and server for Chronos.
 */

export const TEMPORAL_RESOLUTIONS = [
  'year',
  'quarter',
  'month',
  'week',
  'day'
] as const;
export type TemporalResolution = (typeof TEMPORAL_RESOLUTIONS)[number];

export const DATA_LAYERS = [
  'landsat',
  'sentinel2',
  'planet_nicfi',
  'maxar_open',
  'night_lights_dmsp',
  'night_lights_viirs',
  'sentinel1',
  'alos_palsar',
  'gedi',
  'icesat2',
  'landsat_tirs',
  'ecostress',
  'oai',
  'troposphere',
  'copernicus_dem',
  'nasa_dem',
  'arctic_dem',
  'rema',
  'osm',
  'microsoft_buildings',
  'ghsl',
  'wsf',
  'esa_cci',
  'glad',
  'dynamic_world',
  'esa_worldcover',
  'hfp',
  'hii',
  'night_lights'
] as const;
export type DataLayer = (typeof DATA_LAYERS)[number];

export const TEMPORAL_LAYERS = [
  'landsat_annual',
  'sentinel2_annual',
  'planet_nicfi_annual',
  'night_lights_annual',
  'urban_extents_annual',
  'water_annual',
  'glacier_annual',
  'coastline_annual',
  'cropland_annual',
  'sea_ice_annual',
  'night_lights_monthly',
  'fire_monthly',
  'precipitation_monthly',
  'temperature_monthly'
] as const;
export type TemporalLayer = (typeof TEMPORAL_LAYERS)[number];

export const CHANGE_TYPES = [
  'deforestation',
  'urban_expansion',
  'water_change',
  'glacier_change',
  'coastline_change',
  'cropland_change',
  'mining_expansion',
  'coastal_erosion',
  'glacier_mass_balance',
  'night_light_delta',
  'fire',
  'flood',
  'landslide',
  'volcanic',
  'oil_spill'
] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number];

export const SCENARIO_FORCINGS = [
  'ssp1_26',
  'ssp2_45',
  'ssp3_70',
  'ssp5_85'
] as const;
export type ScenarioForcing = (typeof SCENARIO_FORCINGS)[number];

export const POLICY_LEVERS = [
  'carbon_price',
  'protected_area_pct',
  'reforestation_target',
  'ev_mandate',
  'coal_phaseout',
  'renewable_target',
  'deforestation_ban',
  'wetland_restoration'
] as const;
export type PolicyLever = (typeof POLICY_LEVERS)[number];

export const CHANGE_DETECTION_ALGORITHMS = [
  'glad',
  'radd',
  'bfast',
  'ccdc',
  'landtrendr',
  'tscd',
  'sma'
] as const;
export type ChangeDetectionAlgorithm = (typeof CHANGE_DETECTION_ALGORITHMS)[number];

export const FORECASTING_MODELS = [
  'earthformer',
  'predrnn',
  'simvp',
  'diffeearth',
  'neuralgcm',
  'climsim',
  'icenet',
  'deepice'
] as const;
export type ForecastingModel = (typeof FORECASTING_MODELS)[number];

export const CHANGE_DETECTION_MODELS = [
  'glad',
  'radd',
  'bfast',
  'ccdc',
  'landtrendr',
  'tscd',
  'sma',
  'siamese',
  'changeformer'
] as const;
export type ChangeDetectionModel = (typeof CHANGE_DETECTION_MODELS)[number];

export const VISUALIZATION_STYLES = [
  'natural',
  'false_color',
  'ndvi',
  'evi',
  'savi',
  'ndwi',
  'mndwi',
  'ndbi',
  'nbr',
  'dnbr',
  'ndsi',
  'crv',
  'thermal',
  'night_lights',
  'crt',
  'nvg',
  'flir_ironbow',
  'flir_whitehot',
  'flir_blackhot'
] as const;
export type VisualizationStyle = (typeof VISUALIZATION_STYLES)[number];

export const SCENARIO_TYPES = [
  'business_as_usual',
  'aggressive_mitigation',
  'worst_case',
  'custom'
] as const;
export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export const EXPORT_FORMATS = [
  'geotiff',
  'cog',
  'netcdf',
  'zarr',
  'png',
  'jpg',
  'webp',
  'mp4',
  'webm',
  'gif',
  'csv',
  'json',
  'geojson',
  'parquet'
] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** Roles for Chronos organizations. */
export const ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer'
};

/** Permission flags for Chronos. */
export const PERMISSIONS = [
  'temporal.forecast',
  'change.detect',
  'scenario.build',
  'scenario.run',
  'export.create',
  'export.download',
  'settings.manage',
  'member.manage',
  'audit.view',
  'ownership.transfer',
  'organization.delete'
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const VIEWER_PERMISSIONS: Permission[] = [];
const MEMBER_PERMISSIONS: Permission[] = [
  'temporal.forecast',
  'change.detect',
  'scenario.build',
  'export.create',
];
const ADMIN_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  'scenario.run',
  'settings.manage',
  'member.manage',
  'audit.view',
];

export function permissionsForRole(role: Role): Permission[] {
  switch (role) {
    case 'owner':
      return ['temporal.forecast', 'change.detect', 'scenario.build', 'scenario.run', 'export.create', 'export.download', 'settings.manage', 'member.manage', 'audit.view', 'ownership.transfer', 'organization.delete'];
    case 'admin':
      return [...ADMIN_PERMISSIONS];
    case 'member':
      return [...MEMBER_PERMISSIONS];
    case 'viewer':
      return [...VIEWER_PERMISSIONS];
  }
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission);
}

export const TEMPORAL_RESOLUTION_OPTIONS = [
  { value: 'year', label: 'Yearly', description: 'Annual composites' },
  { value: 'quarter', label: 'Quarterly', description: 'Quarterly composites' },
  { value: 'month', label: 'Monthly', description: 'Monthly composites' },
  { value: 'week', label: 'Weekly', description: 'Weekly composites' },
  { value: 'day', label: 'Daily', description: 'Daily (where available)' }
];

export const VISUALIZATION_STYLE_METADATA: Record<VisualizationStyle, { label: string; description: string; bands: string[] }> = {
  natural: { label: 'Natural Color', description: 'True color RGB', bands: ['red', 'green', 'blue'] },
  false_color: { label: 'False Color (NIR-R-G)', description: 'Vegetation in red', bands: ['nir', 'red', 'green'] },
  ndvi: { label: 'NDVI', description: 'Normalized Difference Vegetation Index', bands: ['nir', 'red'] },
  evi: { label: 'EVI', description: 'Enhanced Vegetation Index', bands: ['nir', 'red', 'blue'] },
  savi: { label: 'SAVI', description: 'Soil Adjusted Vegetation Index', bands: ['nir', 'red'] },
  ndwi: { label: 'NDWI', description: 'Normalized Difference Water Index', bands: ['green', 'nir'] },
  mndwi: { label: 'MNDWI', description: 'Modified NDWI', bands: ['green', 'swir1'] },
  ndbi: { label: 'NDBI', description: 'Normalized Difference Built-up Index', bands: ['swir1', 'nir'] },
  nbr: { label: 'NBR', description: 'Normalized Burn Ratio', bands: ['nir', 'swir2'] },
  dnbr: { label: 'dNBR', description: 'Differenced NBR (burn severity)', bands: ['nir', 'swir2'] },
  ndsi: { label: 'NDSI', description: 'Normalized Difference Snow Index', bands: ['green', 'swir1'] },
  crv: { label: 'CRV', description: 'Crop Residue Vegetation', bands: ['swir1', 'swir2'] },
  thermal: { label: 'Surface Temperature', description: 'Land Surface Temperature', bands: ['tir'] },
  night_lights: { label: 'Night Lights', description: 'VIIRS/DMSP Night Lights', bands: ['day_night_band'] },
  crt: { label: 'CRT', description: 'Cathode Ray Tube aesthetic', bands: ['red', 'green', 'blue'] },
  nvg: { label: 'Night Vision Green', description: 'Monochrome green', bands: ['green'] },
  flir_ironbow: { label: 'FLIR Ironbow', description: 'Thermal ironbow palette', bands: ['tir'] },
  flir_whitehot: { label: 'FLIR White Hot', description: 'Thermal white hot', bands: ['tir'] },
  flir_blackhot: { label: 'FLIR Black Hot', description: 'Thermal black hot', bands: ['tir'] }
};

export const CHANGE_TYPE_METADATA: Record<ChangeType, { label: string; description: string; severity: 'low' | 'medium' | 'high' | 'critical'; color: string }> = {
  deforestation: { label: 'Deforestation', description: 'Forest loss detected', severity: 'high', color: '#dc2626' },
  urban_expansion: { label: 'Urban Expansion', description: 'Built-up area increase', severity: 'medium', color: '#ea580c' },
  water_change: { label: 'Water Change', description: 'Water body appearance/disappearance', severity: 'medium', color: '#2563eb' },
  glacier_change: { label: 'Glacier Change', description: 'Glacier retreat/advance', severity: 'high', color: '#06b6d4' },
  coastline_change: { label: 'Coastline Change', description: 'Shoreline shift', severity: 'high', color: '#0891b2' },
  cropland_change: { label: 'Cropland Change', description: 'Agricultural land conversion', severity: 'medium', color: '#84cc16' },
  mining_expansion: { label: 'Mining Expansion', description: 'Extractive activity increase', severity: 'high', color: '#78716c' },
  coastal_erosion: { label: 'Coastal Erosion', description: 'Land loss to sea', severity: 'critical', color: '#dc2626' },
  glacier_mass_balance: { label: 'Glacier Mass Balance', description: 'Ice mass gain/loss', severity: 'high', color: '#06b6d4' },
  night_light_delta: { label: 'Night Light Change', description: 'Urbanization/economic activity change', severity: 'low', color: '#fbbf24' },
  fire: { label: 'Fire', description: 'Active fire / burn scar', severity: 'critical', color: '#dc2626' },
  flood: { label: 'Flood', description: 'Inundation event', severity: 'critical', color: '#dc2626' },
  landslide: { label: 'Landslide', description: 'Mass wasting event', severity: 'high', color: '#92400e' },
  volcanic: { label: 'Volcanic Activity', description: 'Eruption / lava flow', severity: 'critical', color: '#dc2626' },
  oil_spill: { label: 'Oil Spill', description: 'Marine pollution event', severity: 'critical', color: '#18181b' }
};

export const DEFAULT_TIME_RANGE = { start: 1984, end: 2024 };
export const FORECAST_HORIZON = 2050;
export const MAX_HISTORICAL_YEAR = 2024;
export const MIN_HISTORICAL_YEAR = 1984;

export const EARTH_RADIUS_M = 6371000;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export const LANDSAT_BANDS = ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'tir', 'qa'] as const;
export const SENTINEL2_BANDS = ['coastal', 'blue', 'green', 'red', 'red_edge1', 'red_edge2', 'red_edge3', 'nir', 'nir_narrow', 'water_vapor', 'cirrus', 'swir1', 'swir2'] as const;

export const SPECTRAL_INDICES = {
  ndvi: '(nir - red) / (nir + red)',
  evi: '2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1)',
  savi: '(1 + 0.5) * (nir - red) / (nir + red + 0.5)',
  ndwi: '(green - nir) / (green + nir)',
  mndwi: '(green - swir1) / (green + swir1)',
  ndbi: '(swir1 - nir) / (swir1 + nir)',
  nbr: '(nir - swir2) / (nir + swir2)',
  dnbr: 'nbr_pre - nbr_post',
  ndsi: '(green - swir1) / (green + swir1)',
  crv: '(swir1 - swir2) / (swir1 + swir2)',
  ndvi_anomaly: '(ndvi - ndvi_climatology) / ndvi_std'
} as const;

export type SpectralIndex = keyof typeof SPECTRAL_INDICES;

export const TEMPORAL_AGGREGATIONS = ['mean', 'median', 'min', 'max', 'std', 'count', 'sum', 'first', 'last'] as const;
export type TemporalAggregation = (typeof TEMPORAL_AGGREGATIONS)[number];

export const RESAMPLING_METHODS = ['nearest', 'bilinear', 'cubic', 'lanczos', 'average', 'mode', 'max', 'min', 'med'] as const;
export type ResamplingMethod = (typeof RESAMPLING_METHODS)[number];

export const CRS_OPTIONS = ['EPSG:4326', 'EPSG:3857', 'EPSG:32662', 'EPSG:6933'] as const;
export type CRS = (typeof CRS_OPTIONS)[number];

export const DEFAULT_CRS: CRS = 'EPSG:4326';

export const TILE_SIZE = 256;
export const MAX_ZOOM = 22;
export const MIN_ZOOM = 0;

export const STAC_EXTENSIONS = [
  'eo',
  'view',
  'proj',
  'temporal',
  'version',
  'item-assets',
  'file',
  'scientific',
  'processing',
  'forecast',
  'scenario'
] as const;

export const COLLECTIONS = [
  'landsat-c2-l2',
  'sentinel-2-l2a',
  'planet-nicfi',
  'maxar-open-data',
  'viirs-night-lights',
  'dmsp-night-lights',
  'sentinel-1-grd',
  'alos-palsar',
  'gedi-l2a',
  'icesat2-atl08',
  'landsat-tirs',
  'ecostress-l2',
  'oai',
  'troposphere',
  'copernicus-dem',
  'nasa-dem',
  'arctic-dem',
  'rema',
  'osm',
  'microsoft-buildings',
  'ghsl',
  'wsf',
  'esa-cci-lc',
  'glad-alerts',
  'dynamic-world',
  'esa-worldcover',
  'hfp',
  'hii'
] as const;

export type Collection = (typeof COLLECTIONS)[number];

export const METADATA_FIELDS = [
  'id',
  'type',
  'stac_version',
  'stac_extensions',
  'title',
  'description',
  'collection',
  'license',
  'keywords',
  'providers',
  'properties',
  'geometry',
  'bbox',
  'assets',
  'links'
] as const;

export const ASSET_ROLES = [
  'data',
  'thumbnail',
  'overview',
  'metadata',
  'visual',
  'license',
  'ancillary'
] as const;

export const ASSET_KEYS = [
  'blue',
  'green',
  'red',
  'nir',
  'swir1',
  'swir2',
  'tir',
  'qa',
  'nir08',
  'swir16',
  'swir22',
  'tir10',
  'tir11',
  'red_edge1',
  'red_edge2',
  'red_edge3',
  'nir09',
  'water_vapor',
  'cirrus',
  'coastal',
  'red_edge1',
  'red_edge2',
  'red_edge3',
  'nir',
  'nir09',
  'swir1',
  'swir2'
] as const;

export const MAX_ITEMS_PER_REQUEST = 1000;
export const DEFAULT_PAGE_SIZE = 100;
export const MAX_CONCURRENT_DOWNLOADS = 20;
export const DEFAULT_TIMEOUT_MS = 30000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1000;

export const CACHE_TTL_SECONDS = 3600;
export const TILE_CACHE_TTL_SECONDS = 86400;

export const MAX_CONCURRENT_TILES = 50;
export const TILE_BATCH_SIZE = 10;

export const COMPRESSION_QUALITY = 85;
export const JPEG_QUALITY = 85;
export const PNG_COMPRESSION = 6;

export const GZIP_COMPRESSION = true;
export const BROTLI_COMPRESSION = true;

export const MAX_FILE_SIZE_MB = 500;
export const MAX_UPLOAD_SIZE_MB = 100;

export const RATE_LIMIT_WINDOW_MS = 60000;
export const RATE_LIMIT_MAX_REQUESTS = 1000;

export const JWT_EXPIRY_HOURS = 24;
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const API_VERSION = 'v1';
export const API_PREFIX = '/api/v1';

export const HEALTH_CHECK_INTERVAL_MS = 30000;
export const HEALTH_CHECK_TIMEOUT_MS = 5000;

export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export const DEFAULT_LOG_LEVEL: LogLevel = 'info';

export const METRICS_PREFIX = 'chronos';
export const METRICS_PORT = 9090;

export const TRACE_SAMPLE_RATE = 0.1;
export const PROFILING_ENABLED = false;

export const FEATURE_FLAGS = {
  TEMPORAL_FORECASTING: true,
  CHANGE_DETECTION: true,
  SCENARIO_BUILDER: true,
  AI_CHAT: true,
  VOICE_CONTROL: true,
  MULTIPLAYER: true,
  VR_AR: true,
  EXPORT_ANIMATION: true,
  CHANGE_DETECTOR: true,
  FORECASTING_ENGINE: true,
  AI_ORACLE: true,
  CHANGE_DETECTIVE: true,
  SCENARIO_ENGINE: true
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const DEFAULT_MAP_CENTER = { lat: 0, lon: 0, zoom: 2 };
export const DEFAULT_CAMERA_HEIGHT = 10000000;

export const CAMERA_SPEEDS = {
  slow: 0.5,
  normal: 1,
  fast: 2,
  very_fast: 5
} as const;

export const ANIMATION_SPEEDS = {
  very_slow: 0.25,
  slow: 0.5,
  normal: 1,
  fast: 2,
  very_fast: 5,
  ultra_fast: 10
} as const;

export const MAX_CAMERA_HEIGHT = 50000000;
export const MIN_CAMERA_HEIGHT = 100;

export const DEFAULT_SUN_LIGHTING = true;
export const DEFAULT_ATMOSPHERE = true;
export const DEFAULT_FOG = true;
export const DEFAULT_CLOUDS = false;

export const TIME_FORMATS = {
  year: 'YYYY',
  quarter: 'YYYY-[Q]Q',
  month: 'YYYY-MM',
  week: 'YYYY-[W]WW',
  day: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
} as const;

export const DATE_DISPLAY_FORMATS = {
  year: 'YYYY',
  quarter: 'QQQ YYYY',
  month: 'MMM YYYY',
  week: 'Wk WW, YYYY',
  day: 'MMM DD, YYYY',
  datetime: 'MMM DD, YYYY HH:mm'
} as const;

export const NUMBER_FORMATS = {
  compact: 'compact',
  standard: 'standard',
  scientific: 'scientific',
  engineering: 'engineering'
} as const;

export const UNITS = {
  area: ['ha', 'km2', 'm2', 'acres', 'sqmi'],
  length: ['m', 'km', 'mi', 'ft'],
  mass: ['kg', 't', 'Mt', 'Gt', 'lb'],
  temperature: ['celsius', 'fahrenheit', 'kelvin'],
  speed: ['m/s', 'km/h', 'mph', 'knots'],
  rate: ['m/yr', 'km/yr', 'mm/yr', 'cm/yr'],
  rate_volumetric: ['m3/s', 'km3/yr', 'm3/yr', 'L/s'],
  concentration: ['ppm', 'ppb', 'ppt', 'mg/m3', 'ug/m3'],
  index: ['unitless', 'percent', 'ratio'],
  time: ['ms', 's', 'min', 'h', 'd', 'yr', 'kyr', 'Myr']
} as const;

export const COLOR_SCALES = {
  sequential: ['viridis', 'plasma', 'inferno', 'magma', 'cividis', 'turbo', 'rocket', 'mako'],
  diverging: ['rdbu', 'rdylbu', 'rdylgn', 'brbg', 'piyg', 'prgn', 'puor', 'rdgy', 'rdylgn', 'spectral'],
  categorical: ['category10', 'accent', 'dark2', 'paired', 'pastel1', 'pastel2', 'set1', 'set2', 'set3', 'tableau10'],
  cyclical: ['twilight', 'twilight_shifted', 'hsv'],
  thermal: ['hot', 'cool', 'autumn', 'winter', 'spring', 'summer'],
  divergence: ['bluered', 'portland', 'jet', 'rainbow']
} as const;

export type ColorScaleType = keyof typeof COLOR_SCALES;

export const DEFAULT_COLOR_SCALE: ColorScaleType = 'sequential';

export const OPACITY_RANGE = [0, 1] as const;
export const GAMMA_RANGE = [0.1, 3] as const;
export const CONTRAST_RANGE = [0, 2] as const;
export const BRIGHTNESS_RANGE = [0, 2] as const;
export const SATURATION_RANGE = [0, 2] as const;
export const HUE_ROTATE_RANGE = [-180, 180] as const;

export const ANIMATION_EASING = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier'] as const;
export type AnimationEasing = (typeof ANIMATION_EASING)[number];

export const INTERPOLATION_METHODS = ['linear', 'nearest', 'cubic', 'spline', 'akima'] as const;
export type InterpolationMethod = (typeof INTERPOLATION_METHODS)[number];

export const DEFAULT_INTERPOLATION: InterpolationMethod = 'cubic';

export const NUMERICAL_PRECISION = 6;
export const COORDINATE_PRECISION = 6;
export const ELEVATION_PRECISION = 2;

export const MIN_DEFORESTATION_AREA_HA = 0.1;
export const MIN_URBAN_EXPANSION_AREA_HA = 0.01;
export const MIN_WATER_CHANGE_AREA_HA = 0.01;
export const MIN_GLACIER_CHANGE_AREA_HA = 1;

export const CHANGE_CONFIDENCE_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
  high: 0.8
} as const;

export const FORECAST_CONFIDENCE_LEVELS = [0.5, 0.68, 0.9, 0.95, 0.99] as const;
export type ForecastConfidence = (typeof FORECAST_CONFIDENCE_LEVELS)[number];

export const ENSEMBLE_SIZES = [10, 25, 50, 100, 200, 500, 1000] as const;
export type EnsembleSize = (typeof ENSEMBLE_SIZES)[number];

export const DEFAULT_ENSEMBLE_SIZE: EnsembleSize = 50;

export const MONTE_CARLO_ITERATIONS = 10000;

export const SENSITIVITY_ANALYSIS_SAMPLES = 1000;

export const SOBOL_SEQUENCE_SAMPLES = 1024;

export const LATIN_HYPERCUBE_SAMPLES = 500;

export const MORRIS_SAMPLES = 200;

export const SALTLLI_SAMPLES = 1000;

export const DEFAULT_RANDOM_SEED = 42;

export const MAX_PARALLEL_JOBS = 4;
export const MAX_PARALLEL_TILES = 10;
export const MAX_CONCURRENT_UPLOADS = 10;

export const CHUNK_SIZE_BYTES = 1024 * 1024;
export const TILE_CHUNK_SIZE = 256 * 256 * 4;

export const MAX_MEMORY_USAGE_GB = 8;
export const MAX_CPU_USAGE_PERCENT = 80;

export const GRACEFUL_SHUTDOWN_TIMEOUT_MS = 30000;
export const GRACEFUL_SHUTDOWN_SIGNALS = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const;

export const LOG_FORMAT = 'json';
export const LOG_PRETTY_PRINT = false;

export const AUDIT_LOG_RETENTION_DAYS = 365;
export const ACCESS_LOG_RETENTION_DAYS = 90;
export const ERROR_LOG_RETENTION_DAYS = 365;
export const DEBUG_LOG_RETENTION_DAYS = 7;

export const BACKUP_INTERVAL_HOURS = 24;
export const BACKUP_RETENTION_DAYS = 30;
export const BACKUP_COMPRESSION = true;
export const BACKUP_ENCRYPTION = true;

export const MONITORING_ENABLED = true;
export const METRICS_INTERVAL_SECONDS = 10;

export const ALERT_THRESHOLDS = {
  cpu_percent: 80,
  memory_percent: 85,
  disk_percent: 90,
  error_rate: 0.05,
  latency_p99_ms: 5000,
  queue_depth: 1000
} as const;

export const NOTIFICATION_CHANNELS = ['email', 'slack', 'pagerduty', 'webhook', 'sms'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const ALERT_SEVERITIES = ['info', 'warning', 'critical', 'emergency'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const INCIDENT_STATUSES = ['open', 'acknowledged', 'investigating', 'resolved', 'closed'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_SEVERITIES = ['sev1', 'sev2', 'sev3', 'sev4', 'sev5'] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const ON_CALL_ROTATION_DAYS = 7;
export const ON_CALL_HANDOFF_HOUR = 9;

export const DOCS_URL = 'https://docs.chronos.earth';
export const API_DOCS_URL = 'https://api.chronos.earth/docs';
export const STATUS_PAGE_URL = 'https://status.chronos.earth';
export const SUPPORT_EMAIL = 'support@chronos.earth';
export const SECURITY_EMAIL = 'security@chronos.earth';
export const SALES_EMAIL = 'sales@chronos.earth';

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/chronos_earth',
  github: 'https://github.com/chronos-earth',
  linkedin: 'https://linkedin.com/company/chronos-earth',
  youtube: 'https://youtube.com/@chronos_earth',
  discord: 'https://discord.gg/chronos-earth'
} as const;

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
// Guarded so the module also evaluates in the browser, where `process` is absent.
export const GIT_COMMIT =
  (typeof process !== 'undefined' && process.env?.GIT_COMMIT) || 'unknown';