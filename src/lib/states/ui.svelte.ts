import { page } from '$app/state';

// State for Dashboard Tabs
class DashboardState {
    activeTab = $state<'mis_tickets' | 'nuevos' | 'finalizados'>('mis_tickets');
}

// State for Ticket View Tabs
class TicketViewState {
    activeTab = $state<'details' | 'chat'>('details');
}

// Global modal states
class ModalState {
    showNewTicketModal = $state(false);
}

export const dashboardState = new DashboardState();
export const ticketViewState = new TicketViewState();
export const modalState = new ModalState();
