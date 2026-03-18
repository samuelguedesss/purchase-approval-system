import purchaseRequestsService from '../service/purchaseRequestsService.js'

const createPurchaseRequests = async (req, res) => {
   try {
      const { product_name, description, quantity, unit_price, payment_method } = req.body;
      const user_id = req.user.id;
      const department_id = req.user.department_id;

      const purchaseRequests = await purchaseRequestsService.createPurchaseRequestsService({
         product_name,
         description,
         quantity,
         unit_price,
         payment_method,
         user_id,
         department_id
      });

      return res.status(201).json(purchaseRequests);
   } catch (error) {
      return res.status(400).json({ error: error.message });
   }
}

const getPurchaseRequests = async (req, res) => {
   try {
      const user_id = req.user.id;
      const department_id = req.user.department_id;

      const purchaseRequests = await purchaseRequestsService.getPurchaseRequestsService({
         user_id,
         department_id
      });

      return res.status(200).json(purchaseRequests);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
}

const getPendingApprovals = async (req, res) => {
   try {
      const pending = await purchaseRequestsService.getPendingApprovalsService(req.user);
      return res.status(200).json(pending);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
}

const approvePurchaseRequest = async (req, res) => {
   try {
      const { id } = req.params;
      const updated = await purchaseRequestsService.approvePurchaseRequestService({
         requestId: id,
         user: req.user,
      });
      return res.status(200).json(updated);
   } catch (error) {
      return res.status(400).json({ error: error.message });
   }
}

const rejectPurchaseRequest = async (req, res) => {
   try {
      const { id } = req.params;
      const updated = await purchaseRequestsService.rejectPurchaseRequestService({
         requestId: id,
         user: req.user,
      });
      return res.status(200).json(updated);
   } catch (error) {
      return res.status(400).json({ error: error.message });
   }
}

export default {
   createPurchaseRequests,
   getPurchaseRequests,
   getPendingApprovals,
   approvePurchaseRequest,
   rejectPurchaseRequest,
}
