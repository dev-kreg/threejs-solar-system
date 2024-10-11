export interface PlanetData {
    name: string;
    texture: string;
    radius: number;
    orbitRadius: number;
    orbitalPeriod: number;
    rotationPeriod: number;
    mass: number;
    diameter: number;
    density: number;
    gravity: number;
    escapeVelocity: number;
    lengthOfDay: number;
    distanceFromSun: number;
    perihelion: number;
    aphelion: number;
    orbitalVelocity: number;
    orbitalInclination: number;
    orbitalEccentricity: number;
    obliquityToOrbit: number;
    meanTemperature: number;
    surfacePressure: number | string;
    numberOfMoons: number;
    hasRingSystem: boolean;
    hasGlobalMagneticField: boolean | string;
    ring?: {
        innerRadius: number;
        outerRadius: number;
        texture: string;
        alphaMap: string;
    };
}

export const planetaryData: PlanetData[] = [
    {
        name: "Mercury",
        texture: "mercury.webp",
        radius: 3,
        orbitRadius: 100,
        orbitalPeriod: 88,
        rotationPeriod: 58.65,
        mass: 0.330,
        diameter: 4879,
        density: 5429,
        gravity: 3.7,
        escapeVelocity: 4.3,
        lengthOfDay: 4222.6,
        distanceFromSun: 57.9,
        perihelion: 46.0,
        aphelion: 69.8,
        orbitalVelocity: 47.4,
        orbitalInclination: 7.0,
        orbitalEccentricity: 0.206,
        obliquityToOrbit: 0.034,
        meanTemperature: 167,
        surfacePressure: 0,
        numberOfMoons: 0,
        hasRingSystem: false,
        hasGlobalMagneticField: true
    },
    {
        name: "Venus",
        texture: "venus_surface.webp",
        radius: 5,
        orbitRadius: 180,
        orbitalPeriod: 224.7,
        rotationPeriod: -243,
        mass: 4.87,
        diameter: 12104,
        density: 5243,
        gravity: 8.9,
        escapeVelocity: 10.4,
        lengthOfDay: 2802.0,
        distanceFromSun: 108.2,
        perihelion: 107.5,
        aphelion: 108.9,
        orbitalVelocity: 35.0,
        orbitalInclination: 3.4,
        orbitalEccentricity: 0.007,
        obliquityToOrbit: 177.4,
        meanTemperature: 464,
        surfacePressure: 92,
        numberOfMoons: 0,
        hasRingSystem: false,
        hasGlobalMagneticField: false
    },
    {
        name: "Earth",
        texture: "earth_daymap.webp",
        radius: 5,
        orbitRadius: 250,
        orbitalPeriod: 365.25,
        rotationPeriod: 1,
        mass: 5.97,
        diameter: 12756,
        density: 5514,
        gravity: 9.8,
        escapeVelocity: 11.2,
        lengthOfDay: 24.0,
        distanceFromSun: 149.6,
        perihelion: 147.1,
        aphelion: 152.1,
        orbitalVelocity: 29.8,
        orbitalInclination: 0.0,
        orbitalEccentricity: 0.017,
        obliquityToOrbit: 23.4,
        meanTemperature: 15,
        surfacePressure: 1,
        numberOfMoons: 1,
        hasRingSystem: false,
        hasGlobalMagneticField: true
    },
    {
        name: "Mars",
        texture: "mars.webp",
        radius: 4,
        orbitRadius: 380,
        orbitalPeriod: 687,
        rotationPeriod: 1.03,
        mass: 0.642,
        diameter: 6792,
        density: 3934,
        gravity: 3.7,
        escapeVelocity: 5.0,
        lengthOfDay: 24.7,
        distanceFromSun: 228.0,
        perihelion: 206.7,
        aphelion: 249.3,
        orbitalVelocity: 24.1,
        orbitalInclination: 1.8,
        orbitalEccentricity: 0.094,
        obliquityToOrbit: 25.2,
        meanTemperature: -65,
        surfacePressure: 0.01,
        numberOfMoons: 2,
        hasRingSystem: false,
        hasGlobalMagneticField: false
    },
    {
        name: "Jupiter",
        texture: "jupiter.webp",
        radius: 15,
        orbitRadius: 650,
        orbitalPeriod: 4333,
        rotationPeriod: 0.41,
        mass: 1898,
        diameter: 142984,
        density: 1326,
        gravity: 23.1,
        escapeVelocity: 59.5,
        lengthOfDay: 9.9,
        distanceFromSun: 778.5,
        perihelion: 740.6,
        aphelion: 816.4,
        orbitalVelocity: 13.1,
        orbitalInclination: 1.3,
        orbitalEccentricity: 0.049,
        obliquityToOrbit: 3.1,
        meanTemperature: -110,
        surfacePressure: "Unknown",
        numberOfMoons: 95,
        hasRingSystem: true,
        hasGlobalMagneticField: true
    },
    {
        name: "Saturn",
        texture: "saturn.webp",
        radius: 13,
        orbitRadius: 900,
        orbitalPeriod: 10759,
        rotationPeriod: 0.44,
        mass: 568,
        diameter: 120536,
        density: 687,
        gravity: 9.0,
        escapeVelocity: 35.5,
        lengthOfDay: 10.7,
        distanceFromSun: 1432.0,
        perihelion: 1357.6,
        aphelion: 1506.5,
        orbitalVelocity: 9.7,
        orbitalInclination: 2.5,
        orbitalEccentricity: 0.052,
        obliquityToOrbit: 26.7,
        meanTemperature: -140,
        surfacePressure: "Unknown",
        numberOfMoons: 146,
        hasRingSystem: true,
        hasGlobalMagneticField: true,
        ring: {
            innerRadius: 16.05, // Adjust these values as needed
            outerRadius: 29.5,   // Adjust these values as needed
            texture: 'saturnringcolor.jpg',
            alphaMap: 'saturnringpattern.jpg'
        }
    },
    {
        name: "Uranus",
        texture: "uranus.webp",
        radius: 8,
        orbitRadius: 1200,
        orbitalPeriod: 30687,
        rotationPeriod: -0.72,
        mass: 86.8,
        diameter: 51118,
        density: 1270,
        gravity: 8.7,
        escapeVelocity: 21.3,
        lengthOfDay: 17.2,
        distanceFromSun: 2867.0,
        perihelion: 2732.7,
        aphelion: 3001.4,
        orbitalVelocity: 6.8,
        orbitalInclination: 0.8,
        orbitalEccentricity: 0.047,
        obliquityToOrbit: 97.8,
        meanTemperature: -195,
        surfacePressure: "Unknown",
        numberOfMoons: 28,
        hasRingSystem: true,
        hasGlobalMagneticField: true
    },
    {
        name: "Neptune",
        texture: "neptune.webp",
        radius: 8,
        orbitRadius: 1500,
        orbitalPeriod: 60190,
        rotationPeriod: 0.67,
        mass: 102,
        diameter: 49528,
        density: 1638,
        gravity: 11.0,
        escapeVelocity: 23.5,
        lengthOfDay: 16.1,
        distanceFromSun: 4515.0,
        perihelion: 4471.1,
        aphelion: 4558.9,
        orbitalVelocity: 5.4,
        orbitalInclination: 1.8,
        orbitalEccentricity: 0.010,
        obliquityToOrbit: 28.3,
        meanTemperature: -200,
        surfacePressure: "Unknown",
        numberOfMoons: 16,
        hasRingSystem: true,
        hasGlobalMagneticField: true
    },
    {
        name: "Pluto",
        texture: "pluto.webp",
        radius: 2,
        orbitRadius: 1800,
        orbitalPeriod: 90560,
        rotationPeriod: 6.39,
        mass: 0.0130,
        diameter: 2376,
        density: 1850,
        gravity: 0.7,
        escapeVelocity: 1.3,
        lengthOfDay: 153.3,
        distanceFromSun: 5906.4,
        perihelion: 4436.8,
        aphelion: 7375.9,
        orbitalVelocity: 4.7,
        orbitalInclination: 17.2,
        orbitalEccentricity: 0.244,
        obliquityToOrbit: 119.5,
        meanTemperature: -225,
        surfacePressure: 0.00001,
        numberOfMoons: 5,
        hasRingSystem: false,
        hasGlobalMagneticField: "Unknown"
    }
];

export const sunData = {
    texture: "sun.webp",
    radius: 20,
    rotationPeriod: 25.38 * 24 * 60 * 60 // 25.38 days in seconds
};