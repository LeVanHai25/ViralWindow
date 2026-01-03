const express = require("express");
const router = express.Router();
const customerCtrl = require("../controllers/customerController");
const customerCRMCtrl = require("../controllers/customerCRMController");

router.get("/", customerCtrl.getAllCustomers);
router.get("/next-code", customerCtrl.getNextCode);  // Must be before /:id
router.get("/:id", customerCtrl.getById);
router.post("/", customerCtrl.create);
router.put("/:id", customerCtrl.update);
router.delete("/:id", customerCtrl.delete);

// CRM routes
router.get("/:id/crm", customerCRMCtrl.getCustomerCRM);
router.put("/:id/status", customerCRMCtrl.updateCustomerStatus);

// Appointments
router.post("/appointments", customerCRMCtrl.createAppointment);
router.put("/appointments/:id", customerCRMCtrl.updateAppointment);
router.get("/appointments/upcoming", customerCRMCtrl.getUpcomingAppointments);

// Interactions
router.post("/interactions", customerCRMCtrl.createInteraction);

module.exports = router;






