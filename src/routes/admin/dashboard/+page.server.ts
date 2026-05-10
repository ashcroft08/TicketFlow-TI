import type { PageServerLoad } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';
import { AssetRepository } from '$lib/server/repositories/AssetRepository';

const ticketRepo = new TicketRepository();
const userRepo = new UserRepository();
const branchRepo = new BranchRepository();
const assetRepo = new AssetRepository();

export const load: PageServerLoad = async () => {
    // 1. Obtener todos los tickets
    const allTickets = await ticketRepo.getAllTickets();
    
    // 2. Desglose por estados
    const statsByStatus = {
        abiertos: allTickets.filter(t => t.estado?.nombre === 'Abierto').length,
        enProceso: allTickets.filter(t => t.estado?.nombre === 'En Proceso').length,
        resueltos: allTickets.filter(t => t.estado?.nombre === 'Resuelto' || t.estado?.nombre === 'Cerrado').length
    };

    // 3. Personal técnico
    const technicians = await userRepo.getUsersByRole('TECH');
    
    // 4. Sucursales y Activos
    const branches = await branchRepo.getAll();
    const assets = await assetRepo.getAll();

    // 5. Actividad reciente (últimos 8 tickets para más detalle)
    const recentTickets = allTickets.slice(0, 8);

    return {
        stats: {
            totalTickets: allTickets.length,
            abiertos: statsByStatus.abiertos,
            enProceso: statsByStatus.enProceso,
            resueltos: statsByStatus.resueltos,
            techStaff: technicians.length,
            branches: branches.length,
            totalAssets: assets.length
        },
        recentTickets
    };
};
