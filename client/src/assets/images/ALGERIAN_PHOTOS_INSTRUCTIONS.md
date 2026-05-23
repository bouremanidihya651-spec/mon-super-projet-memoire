# Instructions for Replacing Images with Algerian Photos

## Overview
This document explains how to replace the current Unsplash placeholder images with authentic Algerian photos in your travel website.

## Current Image Locations

### Home.jsx
- Hero background: `https://images.unsplash.com/photo-1503220317375-aaad61436b1b`
- Featured destinations (3):
  - `https://images.unsplash.com/photo-1567874790230-3acbb51e61dd`
  - `https://images.unsplash.com/photo-1527959987222-9946fb0e7139`
  - `https://images.unsplash.com/photo-1507923590520-8f0e3a37ca4e`
- Luxury activities (3):
  - `https://images.unsplash.com/photo-1587049633312-d628ae50a8ae`
  - `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4`
  - `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4`

### About.jsx
- Hero section: `https://images.unsplash.com/photo-1530521954074-e64f6810b32d`
- Mission section: `https://images.unsplash.com/photo-1527959987222-9946fb0e7139`
- Team members (4):
  - `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2`
  - `https://images.unsplash.com/photo-1560250097-0b93528c311a`
  - `https://images.unsplash.com/photo-1551836022-d5d88e9218df`
  - `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d`

### Hotels.jsx
- Page header: `https://images.unsplash.com/photo-1566073771259-6a8506099945`
- Hotel images (all use the same placeholder): `https://images.unsplash.com/photo-1566073771259-6a8506099945`

### Activities.jsx
- Page header: `https://images.unsplash.com/photo-1544950984-749bff81f751`
- Activity images (6):
  - `https://images.unsplash.com/photo-1587049633312-d628ae50a8ae`
  - `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4`
  - `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4`
  - `https://images.unsplash.com/photo-1546182990-dffeafbe841d`
  - `https://images.unsplash.com/photo-1516483638261-f4dbaf036963`
  - `https://images.unsplash.com/photo-1556911220-e15b29be8c8f`

### Destinations.jsx
- Page header: `https://images.unsplash.com/photo-1503220317375-aaad61436b1b`
- Destination images (6):
  - `https://images.unsplash.com/photo-1567874790230-3acbb51e61dd`
  - `https://images.unsplash.com/photo-1527959987222-9946fb0e7139`
  - `https://images.unsplash.com/photo-1507923590520-8f0e3a37ca4e`
  - `https://images.unsplash.com/photo-1546182990-dffeafbe841d`
  - `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf`
  - `https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9`

## Recommended Algerian Photo Sources

### Free Resources:
1. **Unsplash** - Search for "Algeria" or "Algérie"
2. **Pexels** - Search for "Algeria" 
3. **Pixabay** - Search for "Algeria"

### Specific Algerian Locations to Photograph:
1. **Hoggar Mountains** - Ancient rock formations and desert landscapes
2. **Kasbah of Algiers** - UNESCO World Heritage site with traditional architecture
3. **Sahara Desert** - Iconic sand dunes and oases
4. **Timgad** - Well-preserved Roman ruins
5. **Constantine** - Dramatic city built on a rocky plateau
6. **Tassili n'Ajjer** - UNESCO site with unique geological formations and ancient cave art
7. **Djémila** - Roman ruins with spectacular mountain views
8. **Tipaza** - Coastal archaeological site with Roman ruins
9. **Ghardaïa** - M'zab valley traditional city
10. **El Mahaba** - Beautiful beaches along the Mediterranean coast

## How to Replace Images

### Method 1: Direct URL Replacement
1. Find the image URL in the JSX file
2. Replace it with your new Algerian photo URL
3. Ensure the new image meets the same dimensions for best results

### Method 2: Local Assets
1. Place your Algerian photos in the `src/assets/images/` folder
2. Import them at the top of each file:
   ```javascript
   import algeriaPhoto1 from '../assets/images/algeria-photo-1.jpg';
   ```
3. Replace the URL with the imported variable:
   ```jsx
   <img src={algeriaPhoto1} alt="Description" />
   ```

## Image Optimization Tips
- Resize images to appropriate dimensions before uploading
- Compress images to reduce load times (aim for <200KB for large images)
- Use WebP format when possible for better compression
- Maintain aspect ratios to prevent distortion

## Naming Convention for Algerian Photos
Use descriptive names like:
- `algiers-kasbah-sunset.jpg`
- `hoggar-mountains-desert.jpg`
- `constantine-bridge-overview.jpg`
- `sahara-dunes-golden-hour.jpg`
- `timgad-roman-ruins.jpg`