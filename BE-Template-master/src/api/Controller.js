exports.helloword = (request, response) => {
    response.json({ message: "hello world" })
};

exports.contracts = async(req, res) => {
    try {
        const { Contract } = req.app.get('models')
        const { id } = req.params
        let contract
        if (id) {
            contract = await Contract.findOne({ where: { id: id, ClientId: req.profile.id } })
        } else {
            contract = await Contract.findOne({ where: { ClientId: req.profile.id } })
        }
        if (!contract) return res.status(404).end()
        res.json(contract)
    } catch (e) {
        console.log('Error', e)
    }
}


exports.jobsUnPaid = async(req, res) => {
    try {
        const { Contract, Job } = req.app.get('models')
        const newLocal = null;
        const jobs = await Job.findAll({
            where: { paid: newLocal },
            include: [{
                model: Contract,
                where: { ClientId: req.profile.id, status: ['new', 'in_progress'] },
            }]
        })
        if (!jobs) return res.status(404).end()
        res.json(jobs)
    } catch (e) {
        console.log('Error', e)
    }
}


exports.payJob = async(req, res) => {
    try {
        const { Contract, Job, Profile } = req.app.get('models')
        const { job_id } = req.params
        const JobToPay = await Job.findOne({
            where: { id: job_id },
            include: [{
                model: Contract,
                where: { ClientId: req.profile.id },
            }]
        })
        const Client = await Profile.findOne({
            where: { id: req.profile.id }
        })
        const Contractor = await Profile.findOne({
            where: { id: JobToPay.Contract.ContractorId }
        })
        if (Client.balance >= JobToPay.price) {

            Client.balance -= JobToPay.price
            if (!await Client.save()) {
                return res.status(404).end('Erro to subtrain job value')
            }

            Contractor.balance += JobToPay.price
            if (!await Contractor.save()) {
                return res.status(404).end('Erro to sum job value to contract')
            }
            JobToPay.paid = 1
            JobToPay.paymentDate = new Date()
            if (!await JobToPay.save()) {
                return res.status(404).end('Erro to save job payment')
            }

            res.json("Successful payment");
        }
        res.status(404).json({ message: "Client: insufficient balance" });
    } catch (e) {
        console.log('Error', e)
    }
}

/** rillian depositando para rillian*/
exports.BalanceDeposit = async(req, res) => {
    try {
        const { Contract, Job, Profile } = req.app.get('models')
        const { sequelize } = req.app.get('sequelize')
        const { deposit } = req.body

        const Jobs = await Job.findAll({
            where: { paid: null },
            raw: true,
            attributes: [
                [sequelize.fn('sum', sequelize.col('price')), 'total_amount']
            ],
            include: [{
                model: Contract,
                where: { ClientId: req.profile.id, status: ['in_progress'] },
            }]
        })


        if (deposit <= (Jobs[0].total_amount * 0.25)) {
            const Source = await Profile.findOne({
                where: { id: req.profile.id }
            })

            Source.balance += deposit
            if (!await Source.save()) {
                return res.status(404).end()
            }

            return res.json({
                message: "Successful deposit"
            });
        }

        return res.status(404).end('Erro to deposit')
    } catch (e) {
        console.log('Error', e)
    }
}
exports.balanceTransfer = async(req, res) => {
    try {
        const { Contract, Job, Profile } = req.app.get('models')
        const { sequelize } = req.app.get('sequelize')
        const { userId } = req.params
        const { deposit } = req.body



        const Source = await Profile.findOne({
            where: { id: req.profile.id }
        })
        const Destiny = await Profile.findOne({
            where: { id: userId }
        })


        const Jobs = await Job.findAll({
            where: { paid: null },
            raw: true,
            attributes: [
                [sequelize.fn('sum', sequelize.col('price')), 'total_amount']
            ],
            include: [{
                model: Contract,
                where: { ClientId: req.profile.id, status: ['in_progress'] },
            }]
        })
        if (deposit <= (Jobs[0].total_amount * 0.25)) {

            if (Source.balance >= deposit) {

                Source.balance -= deposit
                if (!await Source.save()) {
                    return res.status(404).end()
                }

                Destiny.balance += deposit
                if (!await Destiny.save()) {
                    return res.status(404).end()
                }

                res.json({ message: "Successful transfer" });
            }
        }
        res.status(404).json({ message: "Client: insufficient balance to transfer" });
    } catch (e) {
        console.log('Error', e)
    }
}

exports.AdminBestProfission = async(req, res) => {
    try {
        const { Op, fn } = require("sequelize");
        const { start, end } = req.query
        const { Contract, Job, Profile } = req.app.get('models')
        const newLocal = true;
        const jobs = await Job.findAll({
            attributes: [
                [fn('sum', sequelize.col('price')), 'total_amount'],
            ],
            raw: true,
            where: {
                paid: newLocal,
                paymentDate: {
                    [Op.between]: [start, end]
                }
            },
            include: [{
                model: Contract,
                where: { status: ['new', 'in_progress'] },
                attributes: [],
                include: [{
                    model: Profile,
                    as: 'Contractor',
                    attributes: ['profession'],
                }]
            }],
            group: ['Contract.Contractor.profession'],

        })

        var max = jobs.reduce(function(max, b) {
            if (max.total_amount > b.total_amount) return max;
            return b
        });

        if (!max) return res.status(404).end()
        res.json({
            'Total_profession': max['total_amount'],
            'Profession': max['Contract.Contractor.profession']
        })
    } catch (e) {
        console.log('Error', e)
    }
}

exports.adminBestClients = async(req, res) => {
    try {
        const { Op, fn } = require("sequelize");

        const { start, end } = req.query
        const limit = req.query.limit === undefined ? 2 : req.query.limit

        const { Contract, Job, Profile } = req.app.get('models')
        const newLocal = true;

        const bestClients = await Job.findAll({
            attributes: [
                [fn('sum ', sequelize.col('price')), 'total_amount'],
            ],
            raw: true,
            where: {
                paid: newLocal,
                paymentDate: {
                    [Op.between]: [start, end]
                }
            },
            include: [{
                model: Contract,
                attributes: [],
                include: [{
                    model: Profile,
                    as: 'Client',
                    attributes: ['firstName', 'lastName'],
                }]
            }],
            group: ['Contract.Client.id'],
            order: sequelize.literal('total_amount DESC'),
            limit: limit
        })

        const
            data = bestClients.map((el) => {
                return {
                    id: el['Contract.Client.id'],
                    fullName: el['Contract.Client.firstName'] + ' ' + el['Contract.Client.lastName'],
                    pago: el['total_amount']
                }
            })

        if (!data) return res.status(404).end()
        res.json(data)
    } catch (e) {
        console.log('Error', e)
    }
}