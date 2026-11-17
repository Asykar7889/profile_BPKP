import { GeoJsonFeatureCollection } from '@/types/dashboard';

/**
 * Clean, lightweight, self-contained GeoJSON for the 17 Kabupaten/Kota in Sumatera Selatan.
 * Geographic bounding box: lat ~ -1.7° to -4.9°, lng ~ 102.1° to 106.1°
 * Contiguous polygons with realistic positions for smooth rendering, hovering, clicking, and zooming.
 */
export const SUMSEL_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1601',
        nama_wilayah: 'Kabupaten Ogan Komering Ulu',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.95, -3.95],
            [104.30, -3.95],
            [104.45, -4.15],
            [104.35, -4.40],
            [104.05, -4.35],
            [103.85, -4.15],
            [103.95, -3.95]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1602',
        nama_wilayah: 'Kabupaten Ogan Komering Ilir',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [104.90, -2.85],
            [105.75, -3.10],
            [106.05, -3.75],
            [105.70, -4.30],
            [104.95, -4.15],
            [104.75, -3.60],
            [104.90, -2.85]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1603',
        nama_wilayah: 'Kabupaten Muara Enim',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.55, -3.45],
            [103.95, -3.35],
            [104.15, -3.55],
            [104.05, -3.95],
            [103.70, -4.05],
            [103.45, -3.75],
            [103.55, -3.45]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1604',
        nama_wilayah: 'Kabupaten Lahat',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.30, -3.55],
            [103.65, -3.55],
            [103.75, -3.85],
            [103.60, -4.15],
            [103.25, -4.05],
            [103.15, -3.75],
            [103.30, -3.55]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1605',
        nama_wilayah: 'Kabupaten Musi Rawas',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [102.75, -2.75],
            [103.35, -2.65],
            [103.60, -3.05],
            [103.45, -3.45],
            [103.00, -3.45],
            [102.70, -3.15],
            [102.75, -2.75]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1606',
        nama_wilayah: 'Kabupaten Musi Banyuasin',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.30, -1.85],
            [104.25, -1.95],
            [104.45, -2.45],
            [103.95, -2.85],
            [103.35, -2.65],
            [103.15, -2.25],
            [103.30, -1.85]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1607',
        nama_wilayah: 'Kabupaten Banyuasin',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [104.25, -1.95],
            [105.15, -2.15],
            [105.35, -2.75],
            [104.85, -2.85],
            [104.45, -2.45],
            [104.25, -1.95]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1608',
        nama_wilayah: 'Kabupaten Ogan Komering Ulu Selatan',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.85, -4.35],
            [104.25, -4.40],
            [104.35, -4.85],
            [103.95, -4.95],
            [103.70, -4.70],
            [103.85, -4.35]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1609',
        nama_wilayah: 'Kabupaten Ogan Komering Ulu Timur',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [104.45, -3.95],
            [104.95, -3.95],
            [104.95, -4.35],
            [104.55, -4.45],
            [104.35, -4.15],
            [104.45, -3.95]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1610',
        nama_wilayah: 'Kabupaten Ogan Ilir',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [104.55, -3.20],
            [104.85, -3.20],
            [104.80, -3.65],
            [104.45, -3.60],
            [104.40, -3.35],
            [104.55, -3.20]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1611',
        nama_wilayah: 'Kabupaten Empat Lawang',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [102.80, -3.55],
            [103.15, -3.55],
            [103.20, -3.90],
            [102.90, -4.00],
            [102.75, -3.75],
            [102.80, -3.55]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1612',
        nama_wilayah: 'Kabupaten Penukal Abab Lematang Ilir (PALI)',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.85, -3.00],
            [104.25, -2.95],
            [104.30, -3.30],
            [103.95, -3.35],
            [103.80, -3.15],
            [103.85, -3.00]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1613',
        nama_wilayah: 'Kabupaten Musi Rawas Utara',
        tipe_wilayah: 'Kabupaten'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [102.50, -2.30],
            [103.15, -2.25],
            [103.35, -2.65],
            [102.75, -2.75],
            [102.40, -2.60],
            [102.50, -2.30]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1671',
        nama_wilayah: 'Kota Palembang',
        tipe_wilayah: 'Kota'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [104.68, -2.90],
            [104.83, -2.90],
            [104.85, -3.05],
            [104.68, -3.05],
            [104.68, -2.90]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1672',
        nama_wilayah: 'Kota Prabumulih',
        tipe_wilayah: 'Kota'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [104.18, -3.38],
            [104.33, -3.38],
            [104.34, -3.50],
            [104.17, -3.50],
            [104.18, -3.38]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1673',
        nama_wilayah: 'Kota Pagar Alam',
        tipe_wilayah: 'Kota'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.18, -4.00],
            [103.32, -4.00],
            [103.33, -4.12],
            [103.17, -4.12],
            [103.18, -4.00]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        kode_wilayah: '1674',
        nama_wilayah: 'Kota Lubuklinggau',
        tipe_wilayah: 'Kota'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [102.80, -3.23],
            [102.93, -3.23],
            [102.94, -3.35],
            [102.79, -3.35],
            [102.80, -3.23]
          ]
        ]
      }
    }
  ]
};
