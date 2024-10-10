export interface PlanetData {
    name: string;
    texture: string;
    radius: number;
    orbitRadius: number;
    orbitalPeriod: number;
    rotationPeriod: number;
}

export const planetaryData: PlanetData[] = [
    { name: "Mercury", texture: "mercury.webp", radius: 3, orbitRadius: 100, orbitalPeriod: 88, rotationPeriod: 58.65 },
    { name: "Venus", texture: "venus_surface.webp", radius: 5, orbitRadius: 180, orbitalPeriod: 224.7, rotationPeriod: -243 },
    { name: "Earth", texture: "earth_daymap.webp", radius: 5, orbitRadius: 250, orbitalPeriod: 365.25, rotationPeriod: 1 },
    { name: "Mars", texture: "mars.webp", radius: 4, orbitRadius: 380, orbitalPeriod: 687, rotationPeriod: 1.03 },
    { name: "Jupiter", texture: "jupiter.webp", radius: 15, orbitRadius: 650, orbitalPeriod: 4333, rotationPeriod: 0.41 },
    { name: "Saturn", texture: "saturn.webp", radius: 13, orbitRadius: 900, orbitalPeriod: 10759, rotationPeriod: 0.44 },
    { name: "Uranus", texture: "uranus.webp", radius: 8, orbitRadius: 1200, orbitalPeriod: 30687, rotationPeriod: -0.72 },
    { name: "Neptune", texture: "neptune.webp", radius: 8, orbitRadius: 1500, orbitalPeriod: 60190, rotationPeriod: 0.67 },
    { name: "Pluto", texture: "pluto.webp", radius: 2, orbitRadius: 1800, orbitalPeriod: 90560, rotationPeriod: 6.39 }
];

export const sunData = {
    texture: "sun.webp",
    radius: 35,
    rotationPeriod: 25.38 * 24 * 60 * 60 // 25.38 days in seconds
};