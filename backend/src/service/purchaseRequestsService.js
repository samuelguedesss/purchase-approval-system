import purchaseRequestsRepository from '../repository/purchaseRequestsRepository.js'

const createPurchaseRequestsService = async ({ product_name, description, quantity, unit_price, payment_method, user_id, department_id }) => {

    if (!product_name || !description || !quantity || !unit_price || !payment_method) {
        throw new Error("Todos os campos precisam ser preenchidos");
    }
    if (!user_id) throw new Error("Usuario não informado");
    if (!department_id) throw new Error("Departamento não informado");

    const amount = Number(quantity) * Number(unit_price);

    if (amount <= 0) {
        throw new Error("Valor total deve ser maior que zero.");
    }

    const purchaseRequest = await purchaseRequestsRepository.createPurchaseRequestsRepo({
        product_name, description, amount, payment_method, user_id, department_id
    });
    return purchaseRequest;
}

const getPurchaseRequestsService = async ({ user_id, department_id }) => {
    const purchaseRequests = await purchaseRequestsRepository.getPurchaseRequestsRepo({ user_id, department_id });
    return purchaseRequests;
}

const approvePurchaseRequestService = async ({ requestId, user }) => {
    const request = await purchaseRequestsRepository.findByIdRepo(requestId);
    if (!request) throw new Error("Solicitação não encontrada.");

    const { role, department_id } = user;
    const updateFields = {};

    if (role === 'COORDINATOR') {
        if (request.coordinator_status !== 'PENDING') {
            throw new Error("Esta solicitação já foi avaliada pelo coordenador.");
        }
        if (request.department_id !== department_id) {
            throw new Error("Você só pode aprovar solicitações do seu departamento.");
        }

        updateFields.coordinator_status = 'APPROVED';

        if (Number(request.amount) <= 500) {
            updateFields.general_manager_status = 'SKIPPED';
        }

    } else if (role === 'GENERAL_MANAGER') {
        if (request.coordinator_status !== 'APPROVED') {
            throw new Error("O coordenador ainda não aprovou esta solicitação.");
        }
        if (request.general_manager_status !== 'PENDING') {
            throw new Error("Esta solicitação já foi avaliada pelo gerente geral.");
        }

        updateFields.general_manager_status = 'APPROVED';

    } else if (role === 'COORDINATION_FINANCE') {
        if (request.coordinator_status !== 'APPROVED') {
            throw new Error("O coordenador ainda não aprovou esta solicitação.");
        }
        if (!['APPROVED', 'SKIPPED'].includes(request.general_manager_status)) {
            throw new Error("O gerente geral ainda não avaliou esta solicitação.");
        }
        if (request.finance_status !== 'PENDING') {
            throw new Error("Esta solicitação já foi avaliada pelo financeiro.");
        }

        updateFields.finance_status = 'APPROVED';

    } else {
        throw new Error("Sem permissão para aprovar.");
    }

    const updated = await purchaseRequestsRepository.updateStatusRepo(requestId, updateFields);
    return updated;
}

const rejectPurchaseRequestService = async ({ requestId, user }) => {
    const request = await purchaseRequestsRepository.findByIdRepo(requestId);
    if (!request) throw new Error("Solicitação não encontrada.");

    const { role, department_id } = user;
    const updateFields = {};

    if (role === 'COORDINATOR') {
        if (request.coordinator_status !== 'PENDING') {
            throw new Error("Esta solicitação já foi avaliada pelo coordenador.");
        }
        if (request.department_id !== department_id) {
            throw new Error("Você só pode rejeitar solicitações do seu departamento.");
        }
        updateFields.coordinator_status = 'REJECTED';

    } else if (role === 'GENERAL_MANAGER') {
        if (request.coordinator_status !== 'APPROVED') {
            throw new Error("O coordenador ainda não aprovou esta solicitação.");
        }
        if (request.general_manager_status !== 'PENDING') {
            throw new Error("Esta solicitação já foi avaliada pelo gerente geral.");
        }
        updateFields.general_manager_status = 'REJECTED';

    } else if (role === 'COORDINATION_FINANCE') {
        if (request.coordinator_status !== 'APPROVED') {
            throw new Error("O coordenador ainda não aprovou esta solicitação.");
        }
        if (!['APPROVED', 'SKIPPED'].includes(request.general_manager_status)) {
            throw new Error("O gerente geral ainda não avaliou esta solicitação.");
        }
        if (request.finance_status !== 'PENDING') {
            throw new Error("Esta solicitação já foi avaliada pelo financeiro.");
        }
        updateFields.finance_status = 'REJECTED';

    } else {
        throw new Error("Sem permissão para rejeitar.");
    }

    const updated = await purchaseRequestsRepository.updateStatusRepo(requestId, updateFields);
    return updated;
}

const getPendingApprovalsService = async (user) => {
    const { role, department_id } = user;

    if (role === 'COORDINATOR') {
        return await purchaseRequestsRepository.getPendingForCoordinatorRepo(department_id);
    }
    if (role === 'GENERAL_MANAGER') {
        return await purchaseRequestsRepository.getPendingForGeneralManagerRepo();
    }
    if (role === 'COORDINATION_FINANCE') {
        return await purchaseRequestsRepository.getPendingForFinanceRepo();
    }

    return [];
}

export default {
    createPurchaseRequestsService,
    getPurchaseRequestsService,
    approvePurchaseRequestService,
    rejectPurchaseRequestService,
    getPendingApprovalsService,
}
