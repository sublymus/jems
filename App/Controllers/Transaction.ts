import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, ModelControllers, ModelInstanceSchema, ResponseSchema } from "../../lib/squery/Initialize";

const Transaction: ControllerSchema = {
    start: async (ctx: ContextSchema): ResponseSchema => {
        const client = await ModelControllers[ctx.signup.modelPath].option.model.findOne({
            _id: ctx.signup.id
        });
        Log('client', { client });
        if (!client) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: ctx.signup.modelPath + " don't exist",
                status: 404
            }
        }
        const resCurrent = await ModelControllers['transaction']()['list']({
            ...ctx,
            service: 'list',
            __key: client.__key,
            data: {
                paging: {
                    query: {
                        status: 'start',
                        __parentModel: `${ctx.signup.modelPath}_${ctx.signup.id}_transactions_transaction`
                    }
                }
            }
        });

        Log('resCurrent', { resCurrent });
        if (resCurrent.error) return resCurrent

        if (resCurrent.response.items && resCurrent.response.items.length > 0) {
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: resCurrent.response.items[0]._id,
                status: 200
            }
        }
        const etp = await ModelControllers['entreprise'].option.model.findOne();
        Log('etp', { etp });

        if (!etp) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: "entreprise don't exist",
                status: 404
            }
        }
        const resT = await ModelControllers['transaction']()['list']({
            ...ctx,
            __permission: 'admin',
            __key: ctx.__key,
            data: {
                addNew: [{

                    senderAccount: ctx.login.id,
                    // receiverContact: ctx.data.receiverContact,
                    status: 'start',
                    //sum: ctx.data.sum,
                    //codePromo: 'azerty',
                    // discussion: {
                    //     client: ctx.login.id,
                    // }
                }],
                paging: {
                    query: {
                        __parentModel: `${ctx.signup.modelPath}_${ctx.signup.id}_transactions_transaction`
                    }
                }
            }
        });
        Log('resT', { resT });
        if (resT.error) return resT;
        const resET = await ModelControllers['transaction']()['list']({
            ...ctx,
            __permission: 'admin',
            __key: etp.__key.toString(),
            data: {
                addId: [...resT.response.added],
                paging: {
                    query: {
                        __parentModel: `entreprise_${etp._id.toString()}_newTransactions_transaction`
                    }
                }
            }
        });

        Log('resET', { resET });
        if (resET.error) return resET;

        return {
            code: "OPERATION_SUCCESS",
            message: "OPERATION_SUCCESS",
            response: resET.response.added[0],
            status: 200
        }
    },
    full: async (ctx: ContextSchema): ResponseSchema => { 
        const lastVal = 'start', newVal = 'full';

        const res = await ModelControllers['transaction']()['update']({
            ...ctx,
            __permission: 'admin',
            service: 'update',
            data: {
                id: ctx.data.id,
                receiverContact: ctx.data.receiverContact,
                sum: ctx.data.sum,
                codePromo: ctx.data.codePromo,
                senderFile:ctx.data.senderFile
                // discussion: {
                //     client: ctx.login.id,
                // }
            }
        });

        if (res.error) return res;

        const transaction = await ModelControllers['transaction'].option.model.findOne({
            _id: ctx.data.id
        });

        if (!transaction) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: "transaction don't exist",
                status: 404
            }
        }
        if (!transaction.sum) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: "transaction.sum don't exist",
                status: 404
            }
        }
        if (!transaction.receiverContact) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: "transaction.receiverContact don't exist",
                status: 404
            }
        }
        if (!transaction.senderFile ||  transaction.senderFile.length == 0) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: "transaction.senderFile don't exist",
                status: 404
            }
        }
    
        if (transaction.status != lastVal) {
            return {
                error: "Transaction_new",
                code: "NOT_FOUND",
                message: `status <${lastVal}> is required to get status<${newVal}>`,
                status: 404
            }
        }
        const res2 = await ModelControllers['transaction']()['update']({
            ...ctx,
            __permission: 'admin',
            service: 'update',
            data: {
                id: ctx.data.id,
                status: transaction.manager ? 'run' : newVal,
            }
        });
        if (res2.error) return res2;
        return {
            code: "OPERATION_SUCCESS",
            message: "OPERATION_SUCCESS",
            response: ctx.data.id,
            status: 200
        }
    },
    run: async (ctx: ContextSchema): ResponseSchema => {
        if (ctx.signup.modelPath != 'manager') {
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: ctx.signup.modelPath + " can not run transaction",
                status: 404
            }
        }
        const manager = await ModelControllers['manager'].option.model.findOne({ _id: ctx.signup.id });
        Log('manager', { manager });
        if (!manager) {
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "manager not found",
                status: 404
            }
        }
        return await updateTransaction(ctx, 'run', 'end');
    },
    join: async (ctx: ContextSchema): ResponseSchema => {
        try {
            
            if (ctx.signup.modelPath != 'manager') {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: ctx.signup.modelPath + " can not join transaction",
                    status: 404
                }
            }
            const manager = await ModelControllers['manager'].option.model.findOne({ _id: ctx.signup.id });
            Log('manager', { manager });
            if (!manager) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "manager not found",
                    status: 404
                }
            }
            const transaction: ModelInstanceSchema = await ModelControllers['transaction'].option.model.findOne({ _id: ctx.data.id });
            Log('transaction', { transaction });
            if (!transaction) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "transaction not found",
                    status: 404
                }
            }
            if (transaction.manager) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "this transaction allready have a manager ",
                    status: 404
                }
            }
            transaction.manager = ctx.login.id;
            if(transaction.status == 'full') transaction.status = 'run';
            await transaction.save();

            const etp = await ModelControllers['entreprise'].option.model.findOne();
            Log('etp', { etp });

            if (!etp) {
                return {
                    error: "Transaction_new",
                    code: "NOT_FOUND",
                    message: "entreprise don't exist",
                    status: 404
                }
            }
            const resET = await ModelControllers['transaction']()['list']({
                ...ctx,
                __permission: 'admin',
                __key: etp.__key.toString(),
                data: {
                    remove: [ctx.data.id],
                    paging: {
                        query: {
                            __parentModel: `entreprise_${etp._id.toString()}_newTransactions_transaction`
                        }
                    }
                }
            });
            Log('resET',resET);
            if (resET.error) return resET;

            const resListCM = await ModelControllers['transaction']()['list']({
                ...ctx,
                __permission: 'admin',
                __key: ctx.__key,
                data: {
                    addId: [transaction._id.toString()],
                    paging: {
                        query: {
                            __parentModel: `manager_${ctx.signup.id}_currentTransactions_transaction`
                        }
                    }
                }
            });
            Log('resListCM',resListCM)
            if (resListCM.error) return resListCM;
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: ctx.data.id,
                status: 200
            }
        } catch (error) {
            return {
                error: "SERVER_ERROR",
                code: "SERVER_ERROR",
                message: error.message,
                status: 502
            }
        }
    },
    end: async (ctx: ContextSchema): ResponseSchema => {
        const lastVal = 'run', newVal = 'end';
        try {
            if (ctx.signup.modelPath != 'manager') {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: ctx.signup.modelPath + " can not run transaction",
                    status: 404
                }
            }
            const manager = await ModelControllers['manager'].option.model.findOne({ _id: ctx.signup.id });
            Log('manager', { manager });
            if (!manager) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "manager not found",
                    status: 404
                }
            }
            const transaction = await ModelControllers['transaction'].option.model.findOne({
                _id: ctx.data.id
            });
            if (!transaction) {
                return {
                    error: "Transaction_new",
                    code: "NOT_FOUND",
                    message: "transaction don't exist",
                    status: 404
                }
            }
            if (transaction.status != lastVal) {
                return {
                    error: "Transaction_new",
                    code: "NOT_FOUND",
                    message: `status <${lastVal}> is required to get status<${newVal}>`,
                    status: 404
                }
            }
            const res = await ModelControllers['transaction']()['update']({
                ...ctx,
                __permission: 'admin',
                service: 'update',
                data: {
                    id: ctx.data.id,
                    status: newVal,
                    managerFile:ctx.data.managerFile
                }
            });
            return res;
        } catch (error) {
            return {
                error: "SERVER_ERROR",
                code: "SERVER_ERROR",
                message: error.message,
                status: 502
            }
        }
    },
}

async function updateTransaction(ctx: ContextSchema, lastVal: string, newVal: string) {
    const transaction = await ModelControllers['transaction'].option.model.findOne({
        _id: ctx.data.id
    });
    if (!transaction) {
        return {
            error: "Transaction_new",
            code: "NOT_FOUND",
            message: "transaction don't exist",
            status: 404
        }
    }
    if (transaction.status != lastVal) {
        return {
            error: "Transaction_new",
            code: "NOT_FOUND",
            message: `status <${lastVal}> is required to get status<${newVal}>`,
            status: 404
        }
    }
    const res = await ModelControllers['transaction']()['update']({
        ...ctx,
        __permission: 'admin',
        service: 'update',
        data: {
            id: ctx.data.id,
            status: newVal,
        }
    });
    return res;
}
const ctrlMaker = CtrlManager({
    ctrl: { transaction: Transaction },
    access: {
        like: "any"
    }
})

ctrlMaker.post('like', async (e) => { })
