import type { Profile, Vehicle, ParkingSpot, ParkingAssignment, CommunityProject, ProjectQuote, AppNotification, ProjectVote } from './types';

const today = new Date();
const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
const twoMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

export const profiles: Profile[] = [
  { id: 'user-admin', email: 'admin@grecoph.com', fullName: 'Carolina Soto', role: 'admin', phone: '3001234567', interiorNumber: 1, houseNumber: 'Int 1 Casa 101', createdAt: new Date() },
  { id: 'user-resident-1', email: 'resident1@email.com', fullName: 'Juan Pérez', role: 'resident', phone: '3017654321', interiorNumber: 5, houseNumber: 'Int 5 Casa 101', createdAt: new Date() },
  { id: 'user-resident-2', email: 'resident2@email.com', fullName: 'Ana García', role: 'resident', phone: '3109876543', interiorNumber: 2, houseNumber: 'Int 2 Casa 202', createdAt: new Date() },
  { id: 'user-resident-3', email: 'resident3@email.com', fullName: 'Luis Fernandez', role: 'resident', phone: '3201112233', interiorNumber: 8, houseNumber: 'Int 8 Casa 301', createdAt: new Date() },
];

export const vehicles: Vehicle[] = [
  { id: 'vehicle-1', userId: 'user-resident-1', licensePlate: 'ABC-123', brand: 'Renault', model: 'Sandero', color: 'Rojo', active: true },
  { id: 'vehicle-2', userId: 'user-resident-2', licensePlate: 'DEF-456', brand: 'Chevrolet', model: 'Onix', color: 'Gris', active: true },
  { id: 'vehicle-3', userId: 'user-resident-3', licensePlate: 'GHI-789', brand: 'Mazda', model: '3', color: 'Blanco', active: true },
  { id: 'vehicle-4', userId: 'user-resident-1', licensePlate: 'JKL-012', brand: 'Kia', model: 'Picanto', color: 'Negro', active: false },
];

export const parkingSpots: ParkingSpot[] = Array.from({ length: 164 }, (_, i) => ({
  id: `spot-${i + 1}`,
  spotNumber: `P-${String(i + 1).padStart(3, '0')}`,
  status: 'available',
  location: `Nivel ${Math.ceil((i + 1) / 41)}`,
}));

export const parkingAssignments: ParkingAssignment[] = [
  { id: 'assign-1', parkingSpotId: 'spot-1', userId: 'user-resident-1', vehicleId: 'vehicle-1', startDate: today, endDate: oneMonthFromNow, paymentStatus: 'paid', status: 'active', createdAt: new Date() },
  { id: 'assign-2', parkingSpotId: 'spot-2', userId: 'user-resident-2', vehicleId: 'vehicle-2', startDate: today, endDate: oneMonthFromNow, paymentStatus: 'unpaid', status: 'active', createdAt: new Date() },
  { id: 'assign-3', parkingSpotId: 'spot-3', userId: 'user-resident-3', vehicleId: 'vehicle-3', startDate: new Date(2023, 10, 1), endDate: new Date(2023, 11, 1), paymentStatus: 'paid', status: 'expired', createdAt: new Date(2023, 10, 1) },
];

// Mark spots as occupied based on assignments
parkingAssignments.forEach(assignment => {
    if (assignment.status === 'active') {
        const spot = parkingSpots.find(p => p.id === assignment.parkingSpotId);
        if (spot) {
            spot.status = 'occupied';
        }
    }
});


export const communityProjects: CommunityProject[] = [
    { 
        id: 'proj-1', 
        title: 'Remodelación del Salón Comunal', 
        description: 'Actualización completa del salón comunal, incluyendo pintura, cambio de luces a LED, y reparación de humedades. El objetivo es modernizar el espacio para el disfrute de todos los residentes y aumentar el valor de la propiedad.',
        justification: 'El salón comunal presenta un deterioro notable. Las paredes tienen humedades y la iluminación es deficiente y consume mucha energía. Una remodelación es necesaria para mantener las áreas comunes en buen estado.',
        viability: 'El proyecto es viable con el presupuesto solicitado. Se han contactado a tres proveedores que han presentado cotizaciones competitivas. La ejecución puede realizarse en un plazo de 3 semanas sin interrumpir mayormente a la comunidad.',
        priority: 'high', 
        budget: 35000000, 
        status: 'voting', 
        votingDeadline: oneMonthFromNow,
        createdBy: 'user-admin',
        createdAt: new Date(),
    },
    { 
        id: 'proj-2', 
        title: 'Instalación de Parque Infantil', 
        description: 'Creación de un nuevo parque infantil en la zona verde norte. Incluirá columpios, un tobogán y piso de caucho para la seguridad de los niños.',
        justification: 'Actualmente no existen áreas de juego seguras y adecuadas para los niños más pequeños del conjunto. Este proyecto promueve la recreación y el bienestar familiar.',
        viability: 'Se requiere la aprobación de la asamblea para la destinación del presupuesto. Ya se cuenta con el diseño y las cotizaciones preliminares. El tiempo estimado de construcción es de 1 mes.',
        priority: 'medium', 
        budget: 50000000, 
        status: 'proposal', 
        votingDeadline: twoMonthsFromNow,
        createdBy: 'user-resident-1',
        createdAt: new Date(),
    },
     { 
        id: 'proj-3', 
        title: 'Mejora del Sistema de Cámaras de Seguridad', 
        description: 'Cambiar las cámaras de seguridad análogas por un sistema digital de alta definición y ampliar la cobertura a los puntos ciegos identificados en los parqueaderos.',
        justification: 'El sistema actual es obsoleto y la calidad de imagen es muy baja, lo que dificulta la identificación en caso de incidentes. La seguridad es una prioridad para todos.',
        viability: 'Proyecto de alta viabilidad y retorno en seguridad. Requiere una inversión significativa pero necesaria. Los proveedores ofrecen garantía y mantenimiento por 2 años.',
        priority: 'high', 
        budget: 28000000, 
        status: 'approved', 
        votingDeadline: new Date(today.getTime() - 1000*60*60*24*15), // 15 days ago
        createdBy: 'user-admin',
        createdAt: new Date(today.getTime() - 1000*60*60*24*45), // 45 days ago
    },
];

export const projectQuotes: ProjectQuote[] = [
    { id: 'quote-1-1', projectId: 'proj-1', providerName: 'Construcciones El Futuro', amount: 32500000, description: 'Remodelación completa según especificaciones.', fileUrl: '#', fileName: 'cotizacion_futuro.pdf', createdAt: new Date() },
    { id: 'quote-1-2', projectId: 'proj-1', providerName: 'Remodela SAS', amount: 34000000, description: 'Incluye acabados de lujo y garantía extendida.', fileUrl: '#', fileName: 'cotizacion_remodela.pdf', createdAt: new Date() },
    { id: 'quote-1-3', projectId: 'proj-1', providerName: 'Acabados y Obras', amount: 31000000, description: 'Opción más económica, materiales estándar.', fileUrl: '#', fileName: 'cotizacion_acabados.pdf', createdAt: new Date() },
    { id: 'quote-2-1', projectId: 'proj-2', providerName: 'Parques Infantiles Alegría', amount: 48000000, description: 'Estructuras de alta durabilidad y piso de seguridad.', fileUrl: '#', fileName: 'cotizacion_alegria.pdf', createdAt: new Date() },
];

export const projectVotes: ProjectVote[] = [
    { id: 'vote-1', projectId: 'proj-1', userId: 'user-resident-1', voteChoice: 'quote-1-1', createdAt: new Date() },
    { id: 'vote-2', projectId: 'proj-1', userId: 'user-resident-2', voteChoice: 'quote-1-3', createdAt: new Date() },
    { id: 'vote-3', projectId: 'proj-1', userId: 'user-resident-3', voteChoice: 'quote-1-1', createdAt: new Date() },
];


export const notifications: AppNotification[] = [
    { id: 'notif-1', userId: 'user-resident-1', title: 'Recordatorio de Pago', message: 'Recuerda que tu pago de parqueadero vence pronto.', type: 'payment', read: false, createdAt: new Date() },
    { id: 'notif-2', userId: 'user-resident-2', title: 'Votación Abierta', message: 'La votación para el proyecto "Remodelación del Salón Comunal" ya está abierta.', type: 'project', read: true, createdAt: new Date() },
    { id: 'notif-3', userId: 'user-resident-1', title: 'Mantenimiento Programado', message: 'Se realizará mantenimiento en los ascensores de la torre 5 el día de mañana.', type: 'general', read: true, createdAt: new Date(today.getTime() - 1000*60*60*24) },
];
