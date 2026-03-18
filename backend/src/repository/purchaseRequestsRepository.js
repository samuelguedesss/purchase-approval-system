import { Op } from 'sequelize'
import db from '../model/index.js'

const { PurchaseRequest, User, Department } = db;

const includeAssociations = [
    { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    { model: Department, as: 'department', attributes: ['id', 'name'] },
];

const createPurchaseRequestsRepo = async ({ product_name, description, amount, payment_method, user_id, department_id }) => {
    try {
        const purchaseRequest = await PurchaseRequest.create({
            product_name,
            description,
            amount,
            payment_method,
            user_id,
            department_id
        });
        return purchaseRequest;
    } catch (error) {
        console.error("erro no repository ao criar termo de compra", error.message);
        throw error;
    }
}

const getPurchaseRequestsRepo = async ({ user_id, department_id }) => {
    try {
        const purchaseRequests = await PurchaseRequest.findAll({
            where: { user_id, department_id },
            include: includeAssociations,
            order: [['created_at', 'DESC']],
        });
        return purchaseRequests;
    } catch (error) {
        console.error("erro no repository ao buscar solicitações de compra", error.message);
        throw error;
    }
}

const findByIdRepo = async (id) => {
    const purchaseRequest = await PurchaseRequest.findByPk(id, {
        include: includeAssociations,
    });
    return purchaseRequest;
}

const updateStatusRepo = async (id, fields) => {
    await PurchaseRequest.update(fields, { where: { id } });
    const updated = await findByIdRepo(id);
    return updated;
}

const getPendingForCoordinatorRepo = async (department_id) => {
    const requests = await PurchaseRequest.findAll({
        where: {
            department_id,
            coordinator_status: 'PENDING',
        },
        include: includeAssociations,
        order: [['created_at', 'DESC']],
    });
    return requests;
}

const getPendingForGeneralManagerRepo = async () => {
    const requests = await PurchaseRequest.findAll({
        where: {
            coordinator_status: 'APPROVED',
            general_manager_status: 'PENDING',
            amount: { [Op.gt]: 500 },
        },
        include: includeAssociations,
        order: [['created_at', 'DESC']],
    });
    return requests;
}

const getPendingForFinanceRepo = async () => {
    const requests = await PurchaseRequest.findAll({
        where: {
            coordinator_status: 'APPROVED',
            general_manager_status: { [Op.in]: ['APPROVED', 'SKIPPED'] },
            finance_status: 'PENDING',
        },
        include: includeAssociations,
        order: [['created_at', 'DESC']],
    });
    return requests;
}

export default {
    createPurchaseRequestsRepo,
    getPurchaseRequestsRepo,
    findByIdRepo,
    updateStatusRepo,
    getPendingForCoordinatorRepo,
    getPendingForGeneralManagerRepo,
    getPendingForFinanceRepo,
}
