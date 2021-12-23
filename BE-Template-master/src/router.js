const express = require('express');
const router = express.Router();
const { getProfile } = require('./middleware/getProfile')
const controllers = require('./api/Controller')

router.get("/", controllers.helloword);

router.get('/contracts/:id', getProfile, controllers.contracts)

router.get('/contracts', getProfile, controllers.contracts)


router.post('/jobs/:job_id/pay', getProfile, controllers.jobsUnPaid)

/** rillian depositando para rillian*/
router.post('/balances/deposit', getProfile, controllers.payJob)

router.post('/balances/transfer/:userId', getProfile, controllers.BalanceDeposit)

router.get('/admin/best-profession', controllers.balanceTransfer)


router.get('/admin/best-clients', controllers.AdminBestProfission)

module.exports = router